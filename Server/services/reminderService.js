const cron = require('node-cron');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const Subscription = require('../models/Subscription');
const Savings = require('../models/Savings');
const brevoEmailService = require('./brevoEmailService');
const smsService = require('./smsService');
const openaiService = require('./openaiServices');
const { checkNotificationTrialStatus } = require('../middleware/subscription');

class ReminderService {
    constructor() {
        this.initializeSchedulers();
    }

    initializeSchedulers() {
        // Run daily at 9:00 AM (but skip Sunday for business emails)
        cron.schedule('0 9 * * 1-6', () => { // Monday to Saturday only
            this.sendContributionReminders();
            this.sendLoanRepaymentReminders();
        });

        // Run on Monday at 9:00 AM to handle weekend reminders
        cron.schedule('0 9 * * 1', () => { // Monday only
            this.sendDelayedWeekendReminders();
        });

        // Run daily at 10:00 AM to check for group contribution days and send nudges
        cron.schedule('0 10 * * *', () => { // Every day at 10 AM
            this.sendDailyFinancialNudges();
        });

        console.log('📧 Email reminder schedulers initialized (Monday-Saturday only)');
        console.log('🤖 AI nudge scheduler initialized (daily at 10 AM - group contribution days)');
    }

    // Calculate next contribution due date
    calculateNextContributionDate(group) {
        const { frequency, due_day } = group.contribution_settings;
        const now = new Date();
        
        if (frequency === 'monthly') {
            const year = now.getFullYear();
            const month = now.getMonth();
            const dueDate = new Date(year, month, due_day);
            
            // If due date has passed this month, calculate for next month
            if (dueDate <= now) {
                dueDate.setMonth(month + 1);
                // Handle year rollover
                if (dueDate.getMonth() === 0) {
                    dueDate.setFullYear(year + 1);
                }
            }
            
            return dueDate;
        } else if (frequency === 'weekly') {
            // due_day: 1=Monday, 7=Sunday
            const daysUntilNext = (due_day - now.getDay() + 7) % 7;
            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
            return nextDate;
        }
        
        return null;
    }

    // Send contribution reminders for monthly contributions
    async sendContributionReminders() {
        try {
            // Find all groups with contribution settings configured
            const groups = await Group.find({ 
                'contribution_settings.frequency': { $exists: true }
            });

            for (const group of groups) {
                const today = new Date();
                const shouldSendReminder = this.shouldSendContributionReminder(group, today);
                
                if (shouldSendReminder) {
                    const nextDueDate = this.calculateNextContributionDate(group);
                    await this.sendGroupContributionReminder(group, nextDueDate);
                }
            }
            
            console.log('📧 Contribution reminders processed');
        } catch (error) {
            console.error('Error sending contribution reminders:', error);
        }
    }

    // Check if we should send a contribution reminder today
    shouldSendContributionReminder(group, today) {
        const { frequency, due_day, reminder_days_before } = group.contribution_settings;
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Never send on Sunday
        if (dayOfWeek === 0) {
            return false;
        }

        if (frequency === 'weekly') {
            // For weekly contributions, use group's reminder_days_before setting
            const reminderDaysBeforeDue = reminder_days_before || 1;
            let reminderDay = due_day - reminderDaysBeforeDue;
            
            // Handle week boundaries (if reminder day is <= 0, it's previous week)
            if (reminderDay <= 0) {
                reminderDay = 7 + reminderDay;
            }
            
            // If reminder day is Sunday, move to Monday
            const adjustedReminderDay = reminderDay === 0 ? 1 : reminderDay;
            
            return dayOfWeek === adjustedReminderDay;
        } else if (frequency === 'monthly') {
            // For monthly contributions, check if we're the right number of days before due date
            const currentDate = today.getDate();
            const dueDate = due_day;
            const reminderDate = dueDate - (reminder_days_before || 3);
            
            // Handle month boundaries
            if (reminderDate <= 0) {
                // Reminder is in previous month - check if it's near end of current month
                const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                const adjustedReminderDate = daysInCurrentMonth + reminderDate;
                return currentDate === adjustedReminderDate;
            }
            
            return currentDate === reminderDate;
        }

        return false;
    }

    // Handle reminders that would have been sent on Sunday
    async sendDelayedWeekendReminders() {
        try {
            console.log('� Checking for delayed weekend reminders...');
            
            // Check for weekly contributions that were due on Monday (reminder should have been Sunday)
            const groups = await Group.find({ 
                'contribution_settings.frequency': 'weekly',
                'contribution_settings.due_day': 1 // Monday
            });

            for (const group of groups) {
                const nextDueDate = this.calculateNextContributionDate(group);
                await this.sendGroupContributionReminder(group, nextDueDate);
            }
            
            console.log('📧 Delayed weekend reminders processed');
        } catch (error) {
            console.error('Error sending delayed weekend reminders:', error);
        }
    }

    // Send contribution reminder to all group members
    async sendGroupContributionReminder(group, dueDate) {
        try {
            const members = await Member.find({
                group_id: group._id,
                status: 'approved',
                email_verified: true,
                email: { $exists: true, $ne: null }
            });

            for (const member of members) {
                try {
                    // Check if member has trial access or active subscription
                    const trialStatus = await checkNotificationTrialStatus(member._id);
                    const subscription = await Subscription.findOne({ 
                        member_id: member._id,
                        status: 'active'
                    });
                    
                    const hasAccess = trialStatus.inTrial || (subscription && subscription.isActive());
                    
                    if (!hasAccess) {
                        console.log(`⏭️ Skipping reminder for ${member.email} - trial expired, no active subscription`);
                        continue; // Skip sending to this member
                    }

                    await brevoEmailService.sendContributionReminder(
                        member.email,
                        member.full_name,
                        group.group_name,
                        group.contribution_settings.amount,
                        dueDate
                    );
                    
                    // Add small delay to prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (emailError) {
                    console.error(`Failed to send reminder to ${member.email}:`, emailError);
                }
            }
            
            console.log(`📧 Contribution reminders sent to ${members.length} members in ${group.group_name}`);
        } catch (error) {
            console.error(`Error sending contribution reminder for group ${group.group_name}:`, error);
        }
    }

    // Send loan repayment reminders
    async sendLoanRepaymentReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
            
            // Find loans with repayments due tomorrow
            const loansWithRepaymentsDue = await Loan.find({
                status: 'approved',
                repayment_date: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                }
            }).populate('member_id');

            for (const loan of loansWithRepaymentsDue) {
                if (loan.member_id.email_verified && loan.member_id.email) {
                    try {
                        // Check if member has trial access or active subscription
                        const trialStatus = await checkNotificationTrialStatus(loan.member_id._id);
                        const subscription = await Subscription.findOne({ 
                            member_id: loan.member_id._id,
                            status: 'active'
                        });
                        
                        const hasAccess = trialStatus.inTrial || (subscription && subscription.isActive());
                        
                        if (!hasAccess) {
                            console.log(`⏭️ Skipping loan reminder for ${loan.member_id.email} - trial expired, no active subscription`);
                            continue; // Skip sending to this member
                        }

                        const totalDue = loan.amount + (loan.amount * loan.interest_rate / 100);
                        
                        await brevoEmailService.sendLoanRepaymentReminder(
                            loan.member_id.email,
                            loan.member_id.full_name,
                            loan.amount,
                            totalDue,
                            loan.repayment_date
                        );
                    } catch (emailError) {
                        console.error(`Failed to send repayment reminder to ${loan.member_id.email}:`, emailError);
                    }
                }
            }
            
            console.log(`📧 Repayment reminders sent for ${loansWithRepaymentsDue.length} loans`);
        } catch (error) {
            console.error('Error sending repayment reminders:', error);
        }
    }

    // Manual trigger for testing
    async sendTestContributionReminder(groupId) {
        try {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            const nextDueDate = this.calculateNextContributionDate(group);
            await this.sendGroupContributionReminder(group, nextDueDate);
            
            return { message: 'Test contribution reminder sent' };
        } catch (error) {
            console.error('Error sending test reminder:', error);
            throw error;
        }
    }

    // Manual trigger for testing repayment reminders
    async sendTestRepaymentReminder(loanId) {
        try {
            const loan = await Loan.findById(loanId).populate('member_id');
            if (!loan) {
                throw new Error('Loan not found');
            }
            
            const totalDue = loan.amount + (loan.amount * loan.interest_rate / 100);
            
            await brevoEmailService.sendLoanRepaymentReminder(
                loan.member_id.email,
                loan.member_id.full_name,
                loan.amount,
                totalDue,
                loan.repayment_date
            );
            
            return { message: 'Test repayment reminder sent' };
        } catch (error) {
            console.error('Error sending test reminder:', error);
            throw error;
        }
    }

    // Send daily AI financial nudges to subscribed members on their group contribution days
    async sendDailyFinancialNudges() {
        try {
            console.log('🤖 Starting daily financial nudges check...');

            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const dayOfMonth = today.getDate();

            // Find all groups that have contributions due today
            const groupsWithDueContributions = await Group.find({
                $or: [
                    // Weekly groups with due_day matching today
                    {
                        'contribution_settings.frequency': 'weekly',
                        'contribution_settings.due_day': dayOfWeek === 0 ? 7 : dayOfWeek // Convert 0 to 7 for Sunday
                    },
                    // Monthly groups with due_day matching today
                    {
                        'contribution_settings.frequency': 'monthly',
                        'contribution_settings.due_day': dayOfMonth
                    }
                ]
            });

            console.log(`📊 Found ${groupsWithDueContributions.length} groups with contributions due today`);

            if (groupsWithDueContributions.length === 0) {
                console.log('📅 No groups have contributions due today, skipping nudges');
                return;
            }

            // Get all active subscriptions for members in these groups
            const groupIds = groupsWithDueContributions.map(g => g._id);
            const subscriptions = await Subscription.find({
                status: 'active',
                'member_id': { $ne: null }
            })
            .populate({
                path: 'member_id',
                match: { group_id: { $in: groupIds } }
            })
            .exec();

            // Filter out subscriptions where member_id is null after population
            const validSubscriptions = subscriptions.filter(sub => sub.member_id);

            console.log(`📧 Found ${validSubscriptions.length} active subscriptions in groups with due contributions today`);

            let successCount = 0;
            let errorCount = 0;

            for (const subscription of validSubscriptions) {
                try {
                    const member = subscription.member_id;
                    if (!member) continue;

                    // Get member's savings data for nudge generation
                    const userSavings = await Savings.find({ member_id: member._id });
                    const totalSavings = userSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

                    // Get group info
                    const group = await Group.findById(member.group_id);

                    // Prepare member data for nudge
                    const memberData = {
                        totalSavings: totalSavings,
                        weeklyAverage: totalSavings / Math.max(userSavings.length, 1), // rough average
                        missedWeeks: 0, // Could calculate this
                        rank: 'N/A', // Could calculate ranking
                        contributionDay: group?.contribution_settings?.frequency === 'weekly' ?
                            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][group.contribution_settings.due_day === 7 ? 0 : group.contribution_settings.due_day] :
                            `Monthly (${group?.contribution_settings?.due_day})`
                    };

                    // Generate personalized nudge
                    const nudgeMessage = await openaiService.generateFinancialNudge(memberData);

                    if (nudgeMessage) {
                        // Send via email (SMS can be added later as fallback)
                        const message = `Hi ${member.full_name}! ${nudgeMessage} - Jaza Nyumba`;

                        // Send via email
                        if (member.email) {
                            await brevoEmailService.sendFinancialNudge(
                                member.email,
                                member.full_name,
                                nudgeMessage
                            );
                            console.log(`📧 Nudge email sent to ${member.full_name} (${memberData.contributionDay})`);
                        } else {
                            console.log(`⚠️ No email available for ${member.full_name}, skipping nudge`);
                        }

                        successCount++;
                    }

                    // Small delay to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (memberError) {
                    console.error(`❌ Error sending nudge to ${subscription.member_id?.full_name}:`, memberError.message);
                    errorCount++;
                }
            }

            console.log(`✅ Daily nudges completed: ${successCount} sent, ${errorCount} errors`);

        } catch (error) {
            console.error('❌ Error in daily financial nudges:', error);
        }
    }
}

module.exports = new ReminderService();
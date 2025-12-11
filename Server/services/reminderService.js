const cron = require('node-cron');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const smsService = require('./smsService');

class ReminderService {
    constructor() {
        this.initializeSchedulers();
    }

    initializeSchedulers() {
        // Run daily at 9:00 AM (but skip Sunday for business SMS)
        cron.schedule('0 9 * * 1-6', () => { // Monday to Saturday only
            this.sendContributionReminders();
            this.sendLoanRepaymentReminders();
        });

        // Run on Monday at 9:00 AM to handle weekend reminders
        cron.schedule('0 9 * * 1', () => { // Monday only
            this.sendDelayedWeekendReminders();
        });

        console.log('📅 SMS reminder schedulers initialized (Monday-Saturday only)');
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
            const groups = await Group.find({ 
                'contribution_settings.auto_reminders': true,
                'sms_settings.contribution_reminders': true 
            });

            for (const group of groups) {
                const today = new Date();
                const shouldSendReminder = this.shouldSendContributionReminder(group, today);
                
                if (shouldSendReminder) {
                    const nextDueDate = this.calculateNextContributionDate(group);
                    await this.sendGroupContributionReminder(group, nextDueDate);
                }
            }
            
            console.log('📱 Contribution reminders processed');
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
            console.log('📱 Checking for delayed weekend reminders...');
            
            // Check for weekly contributions that were due on Monday (reminder should have been Sunday)
            const groups = await Group.find({ 
                'contribution_settings.auto_reminders': true,
                'contribution_settings.frequency': 'weekly',
                'contribution_settings.due_day': 1, // Monday
                'sms_settings.contribution_reminders': true 
            });

            for (const group of groups) {
                const nextDueDate = this.calculateNextContributionDate(group);
                await this.sendGroupContributionReminder(group, nextDueDate);
            }
            
            console.log('📱 Delayed weekend reminders processed');
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
                phone_verified: true,
                'sms_notifications.contribution_reminders': true
            });

            const dueDateStr = dueDate.toLocaleDateString('en-GB');
            
            for (const member of members) {
                await smsService.sendContributionReminder(
                    member.phone,
                    member.full_name,
                    group.contribution_settings.amount,
                    dueDateStr,
                    group.group_name
                );
                
                // Add small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            console.log(`📱 Contribution reminders sent to ${members.length} members in ${group.group_name}`);
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
                if (loan.member_id.sms_notifications.repayment_reminders) {
                    const dueDateStr = loan.repayment_date.toLocaleDateString('en-GB');
                    
                    await smsService.sendRepaymentReminder(
                        loan.member_id.phone,
                        loan.member_id.full_name,
                        loan.amount + (loan.amount * loan.interest_rate / 100), // Include interest
                        dueDateStr,
                        loan._id
                    );
                }
            }
            
            console.log(`📱 Repayment reminders sent for ${loansWithRepaymentsDue.length} loans`);
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
            
            const dueDateStr = loan.repayment_date.toLocaleDateString('en-GB');
            
            await smsService.sendRepaymentReminder(
                loan.member_id.phone,
                loan.member_id.full_name,
                loan.amount + (loan.amount * loan.interest_rate / 100),
                dueDateStr,
                loan._id
            );
            
            return { message: 'Test repayment reminder sent' };
        } catch (error) {
            console.error('Error sending test reminder:', error);
            throw error;
        }
    }
}

module.exports = new ReminderService();
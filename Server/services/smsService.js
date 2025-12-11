const axios = require('axios');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const smsTemplates = require('./smsTemplates');

class SMSLeopardService {
    constructor() {
        this.apiKey = process.env.SMS_LEOPARD_API_KEY;
        this.apiSecret = process.env.SMS_LEOPARD_API_SECRET;
        this.senderId = process.env.SMS_LEOPARD_SENDER_ID || 'SMS_Leopard';
        this.baseURL = 'https://api.smsleopard.com/v1/sms/send';
    }

    // Generate Authorization header with base64 encoded credentials
    generateAuthHeader() {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('SMS Leopard API credentials not configured');
        }
        
        const credentials = `${this.apiKey}:${this.apiSecret}`;
        const base64Credentials = Buffer.from(credentials).toString('base64');
        return `Basic ${base64Credentials}`;
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Check if member can receive SMS (has subscription or it's login OTP)
    async canReceiveSMS(memberId, smsType = 'general') {
        try {
            // Login OTP is always allowed
            if (smsType === 'login_otp' || smsType === 'verification_otp') {
                return true;
            }

            const member = await Member.findById(memberId);
            if (!member) return false;

            // Check if member has active subscription
            return member.has_active_subscription && new Date() < member.subscription_expires;
        } catch (error) {
            console.error('SMS permission check error:', error);
            return false;
        }
    }

    // Core SMS sending function with subscription check
    async sendSMS(to, message, memberId = null, smsType = 'general') {
        try {
            // Check permissions if memberId is provided
            if (memberId) {
                const canSend = await this.canReceiveSMS(memberId, smsType);
                if (!canSend) {
                    console.log(`SMS blocked for member ${memberId}: No active subscription`);
                    return { 
                        success: false, 
                        error: 'SMS requires active subscription',
                        blocked: true 
                    };
                }
            }

            const response = await axios.post(this.baseURL, {
                message: message,
                destination: to,
                source: this.senderId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': this.generateAuthHeader()
                }
            });

            console.log(`SMS sent to ${to}: ${message}`);
            
            // Update usage if memberId provided
            if (memberId && smsType !== 'login_otp' && smsType !== 'verification_otp') {
                await this.updateSMSUsage(memberId);
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error('SMS sending failed:', error.response?.data || error.message);
            return { success: false, error: error.response?.data || error.message };
        }
    }

    // Update SMS usage counter
    async updateSMSUsage(memberId) {
        try {
            const subscription = await Subscription.findOne({ member_id: memberId });
            if (subscription) {
                subscription.usage.sms_sent_this_month += 1;
                await subscription.save();
            }
        } catch (error) {
            console.error('Error updating SMS usage:', error);
        }
    }

    // Account approval notification
    async sendAccountApprovalSMS(phone, fullName, groupName, memberId = null) {
        const message = smsTemplates.renderTemplate('account_approval', {
            fullName,
            groupName
        });
        return await this.sendSMS(phone, message, memberId, 'account_update');
    }

    // Phone verification OTP (always allowed)
    async sendVerificationOTP(phone, otp, fullName, memberId = null) {
        const message = smsTemplates.renderTemplate('verification_otp', {
            fullName,
            otp
        });
        return await this.sendSMS(phone, message, memberId, 'verification_otp');
    }

    // Login OTP (always allowed)
    async sendLoginOTP(phone, otp, fullName, memberId = null) {
        const message = smsTemplates.renderTemplate('login_otp', {
            fullName,
            otp
        });
        return await this.sendSMS(phone, message, memberId, 'login_otp');
    }

    // Loan approval notification (requires subscription)
    async sendLoanApprovalSMS(phone, fullName, amount, interestRate, memberId = null) {
        const message = smsTemplates.renderTemplate('loan_approval', {
            fullName,
            amount: amount.toLocaleString(),
            interestRate
        });
        return await this.sendSMS(phone, message, memberId, 'loan_notification');
    }

    // Loan denial notification (requires subscription)
    async sendLoanDenialSMS(phone, fullName, reason, memberId = null) {
        const message = smsTemplates.renderTemplate('loan_denial', {
            fullName,
            reason
        });
        return await this.sendSMS(phone, message, memberId, 'loan_notification');
    }

    // Contribution reminder (requires subscription)
    async sendContributionReminder(phone, fullName, amount, dueDate, groupName, memberId = null) {
        const message = smsTemplates.renderTemplate('contribution_reminder', {
            fullName,
            groupName,
            amount: amount.toLocaleString(),
            dueDate
        });
        return await this.sendSMS(phone, message, memberId, 'contribution_reminder');
    }

    // Loan repayment reminder (requires subscription)
    async sendRepaymentReminder(phone, fullName, amount, dueDate, loanId, memberId = null) {
        const message = smsTemplates.renderTemplate('repayment_reminder', {
            fullName,
            amount: amount.toLocaleString(),
            dueDate
        });
        return await this.sendSMS(phone, message, memberId, 'repayment_reminder');
    }

    // Group invitation (requires subscription)
    async sendGroupInvitation(phone, fullName, groupName, inviteCode, inviterName, memberId = null) {
        const message = smsTemplates.renderTemplate('group_invite', {
            fullName,
            inviterName,
            groupName,
            inviteCode
        });
        return await this.sendSMS(phone, message, memberId, 'group_invite');
    }

    // General group notification
    async sendGroupNotification(phone, fullName, groupName, message) {
        const fullMessage = `Hi ${fullName}, ${groupName} update: ${message}`;
        return await this.sendSMS(phone, fullMessage);
    }

    // Bulk SMS for group announcements
    async sendBulkSMS(phoneNumbers, message) {
        const results = [];
        for (const phone of phoneNumbers) {
            try {
                const result = await this.sendSMS(phone, message);
                results.push({ phone, ...result });
                // Add delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                results.push({ phone, success: false, error: error.message });
            }
        }
        return results;
    }
}

module.exports = new SMSLeopardService();
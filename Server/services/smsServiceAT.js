const axios = require('axios');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const smsTemplates = require('./smsTemplates');

class AfricasTalkingSMSService {
    constructor() {
        this.username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
        this.apiKey = process.env.AFRICASTALKING_API_KEY;
        this.senderId = process.env.AFRICASTALKING_SENDER_ID || 'SMSLEOPARD';
        this.baseURL = 'https://api.africastalking.com/version1/messaging';
    }

    // Generate Authorization header
    generateAuthHeader() {
        if (!this.apiKey) {
            throw new Error('Africa\'s Talking API key not configured');
        }
        return `apiKey ${this.apiKey}`;
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Check if member can receive SMS (has subscription or it's login OTP)
    async canReceiveSMS(memberId, smsType = 'general') {
        try {
            // Free SMS types that don't require subscription
            if (smsType === 'login_otp' || smsType === 'verification_otp' || smsType === 'account_update') {
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

            // Format phone number for Kenya
            const formattedPhone = this.formatKenyanPhoneNumber(to);
            
            console.log(`📱 Sending SMS via Africa's Talking:`, {
                to: formattedPhone,
                from: this.senderId,
                message: message.substring(0, 50) + '...'
            });

            const response = await axios.post(this.baseURL, {
                username: this.username,
                to: formattedPhone,
                message: message,
                from: this.senderId
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'apiKey': this.apiKey
                }
            });

            console.log(`✅ SMS sent successfully to ${formattedPhone}`);
            console.log('📋 Africa\'s Talking API Response:', JSON.stringify(response.data, null, 2));
            
            // Update usage if memberId provided
            if (memberId && smsType !== 'login_otp' && smsType !== 'verification_otp') {
                await this.updateSMSUsage(memberId);
            }

            // Parse Africa's Talking response
            const smsResponse = response.data.SMSMessageData;
            if (smsResponse && smsResponse.Recipients && smsResponse.Recipients.length > 0) {
                const recipient = smsResponse.Recipients[0];
                
                return { 
                    success: recipient.status === 'Success',
                    data: response.data,
                    messageId: recipient.messageId,
                    cost: recipient.cost,
                    status: recipient.status
                };
            } else {
                throw new Error('Invalid response format from Africa\'s Talking');
            }

        } catch (error) {
            console.error('❌ Africa\'s Talking SMS failed:', error.response?.data || error.message);
            console.error('📋 Full Error Response:', JSON.stringify(error.response?.data || {}, null, 2));
            console.error('🔗 SMS request URL:', this.baseURL);
            console.error('🔑 Environment Variables Check:');
            console.error('  - Username:', this.username);
            console.error('  - API Key:', this.apiKey ? 'Present' : 'Missing');
            console.error('  - Sender ID:', this.senderId);
            console.error('📞 Target Phone:', to);
            console.error('💬 Message:', message);
            
            return { 
                success: false, 
                error: error.response?.data || error.message,
                fullError: error.response?.data
            };
        }
    }

    // Format Kenyan phone numbers for Africa's Talking
    formatKenyanPhoneNumber(phone) {
        // Remove any non-digit characters
        let cleanPhone = phone.replace(/\D/g, '');
        
        // Handle different formats
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '+254' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
            cleanPhone = '+254' + cleanPhone;
        } else if (cleanPhone.startsWith('254')) {
            cleanPhone = '+' + cleanPhone;
        } else if (!cleanPhone.startsWith('+254')) {
            cleanPhone = '+254' + cleanPhone;
        }
        
        return cleanPhone;
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
    async sendContributionReminderSMS(phone, fullName, amount, dueDate, memberId = null) {
        const message = smsTemplates.renderTemplate('contribution_reminder', {
            fullName,
            amount: amount.toLocaleString(),
            dueDate: dueDate.toLocaleDateString()
        });
        return await this.sendSMS(phone, message, memberId, 'contribution_reminder');
    }

    // Repayment reminder (requires subscription)
    async sendRepaymentReminderSMS(phone, fullName, amount, dueDate, memberId = null) {
        const message = smsTemplates.renderTemplate('repayment_reminder', {
            fullName,
            amount: amount.toLocaleString(),
            dueDate: dueDate.toLocaleDateString()
        });
        return await this.sendSMS(phone, message, memberId, 'repayment_reminder');
    }

    // Withdrawal approval notification (requires subscription)
    async sendWithdrawalApprovalSMS(phone, fullName, amount, memberId = null) {
        const message = smsTemplates.renderTemplate('withdrawal_approval', {
            fullName,
            amount: amount.toLocaleString()
        });
        return await this.sendSMS(phone, message, memberId, 'withdrawal_notification');
    }

    // Withdrawal denial notification (requires subscription)
    async sendWithdrawalDenialSMS(phone, fullName, reason, memberId = null) {
        const message = smsTemplates.renderTemplate('withdrawal_denial', {
            fullName,
            reason
        });
        return await this.sendSMS(phone, message, memberId, 'withdrawal_notification');
    }
}

// Export based on environment variable
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'sms_leopard'; // 'sms_leopard' or 'africastalking'

if (SMS_PROVIDER === 'africastalking') {
    console.log('🌍 Using Africa\'s Talking SMS service');
    module.exports = new AfricasTalkingSMSService();
} else {
    console.log('🐆 Using SMS Leopard service');
    // Import the existing SMS Leopard service
    const SMSLeopardService = require('./smsLeopardService');
    module.exports = new SMSLeopardService();
}
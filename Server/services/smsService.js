const AfricasTalking = require('africastalking');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const smsTemplates = require('./smsTemplates');

// ⚠️ SMS SERVICE TEMPORARILY DISABLED FOR TESTING
const SMS_ENABLED = false;

class AfricasTalkingSMSService {
    constructor() {
        this.username = process.env.AT_USERNAME;
        this.apiKey = process.env.AT_API_KEY;
        this.senderId = process.env.AFRICASTALKING_SENDER_ID; // No default - uses AT's default if not set
        
        if (!SMS_ENABLED) {
            console.log('⚠️  SMS service is DISABLED for testing');
            this.smsClient = null;
            return;
        }
        
        if (!this.apiKey) {
            console.error('❌ Africa\'s Talking API key not configured');
            return;
        }

        // Initialize Africa's Talking
        const africastalking = AfricasTalking({
            apiKey: this.apiKey,
            username: this.username
        });

        this.smsClient = africastalking.SMS;
        console.log('🌍 Africa\'s Talking SMS service initialized');
        console.log('  - Username:', this.username);
        console.log('  - Sender ID:', this.senderId);
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Format phone number to international format for Kenya
    formatKenyanPhoneNumber(phone) {
        // Remove any non-digit characters
        let cleanPhone = phone.replace(/\D/g, '');
        
        // Handle different Kenyan formats
        if (cleanPhone.startsWith('0')) {
            // Convert 0712345678 to +254712345678
            cleanPhone = '+254' + cleanPhone.substring(1);
        } else if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) {
            // Convert 712345678 to +254712345678
            cleanPhone = '+254' + cleanPhone;
        } else if (cleanPhone.startsWith('254')) {
            // Convert 254712345678 to +254712345678
            cleanPhone = '+' + cleanPhone;
        } else if (!cleanPhone.startsWith('+254')) {
            // Fallback: assume it's a local number
            cleanPhone = '+254' + cleanPhone;
        }
        
        return cleanPhone;
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
            // If SMS is disabled, return success without sending
            if (!SMS_ENABLED) {
                console.log(`📱 SMS DISABLED - Would have sent to ${to}: ${message.substring(0, 50)}...`);
                return { 
                    success: true, 
                    message: 'SMS service disabled for testing',
                    simulated: true 
                };
            }
            
            if (!this.smsClient) {
                console.error('❌ SMS client not initialized');
                return { success: false, error: 'SMS service not configured' };
            }

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

            // Format phone number to international format
            const formattedPhone = this.formatKenyanPhoneNumber(to);
            
            // Build SMS payload - only include 'from' if sender ID is configured
            const smsPayload = {
                to: formattedPhone,
                message: message
            };
            
            if (this.senderId) {
                smsPayload.from = this.senderId;
            }
            
            console.log(`📱 Sending SMS via Africa's Talking:`, {
                to: formattedPhone,
                from: this.senderId || 'AT Default',
                message: message.substring(0, 50) + '...'
            });

            const response = await this.smsClient.send(smsPayload);

            console.log(`✅ SMS sent successfully to ${formattedPhone}`);
            console.log('📋 Africa\'s Talking Response:', JSON.stringify(response, null, 2));
            
            // Update usage if memberId provided
            if (memberId && smsType !== 'login_otp' && smsType !== 'verification_otp') {
                await this.updateSMSUsage(memberId);
            }

            // Parse Africa's Talking response
            if (response && response.SMSMessageData && response.SMSMessageData.Recipients && response.SMSMessageData.Recipients.length > 0) {
                const recipient = response.SMSMessageData.Recipients[0];
                
                return { 
                    success: recipient.status === 'Success',
                    data: response,
                    messageId: recipient.messageId,
                    cost: recipient.cost,
                    status: recipient.status,
                    statusCode: recipient.statusCode
                };
            } else {
                throw new Error('Invalid response format from Africa\'s Talking');
            }

        } catch (error) {
            console.error('❌ Africa\'s Talking SMS failed:', error.message);
            console.error('📋 Full Error:', error);
            console.error('🔑 Environment Variables Check:');
            console.error('  - Username:', this.username);
            console.error('  - API Key:', this.apiKey ? 'Present' : 'Missing');
            console.error('  - Sender ID:', this.senderId);
            console.error('📞 Target Phone:', to);
            console.error('💬 Message Length:', message.length);
            
            return { 
                success: false, 
                error: error.message,
                fullError: error
            };
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

module.exports = new AfricasTalkingSMSService();
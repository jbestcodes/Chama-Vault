const axios = require('axios');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const smsTemplates = require('./smsTemplates');

class SMSLeopardService {
    constructor() {
        this.apiKey = process.env.SMS_LEOPARD_API_KEY;
        this.apiSecret = process.env.SMS_LEOPARD_API_SECRET;
        // Prefer explicit env var, fall back to older key or default to 'SMSLEOPARD'
        this.senderId = process.env.SMS_LEOPARD_SENDER_ID || process.env.SMSLEOPARD_SOURCE || 'SMSLEOPARD';
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

            // Try multiple SMS Leopard API formats
            const formats = [
                // Format 1: Minimal format (most likely to work)
                {
                    message: message,
                    destination: to,
                    source: this.senderId
                },
                // Format 2: Standard format with sender
                {
                    to: to,
                    message: message,
                    source: this.senderId
                },
                // Format 3: Recipients array with sender
                {
                    recipients: [to],
                    message: message,
                    source: this.senderId
                },
                // Format 4: Simple message + number with sender
                {
                    number: to,
                    message: message,
                    source: this.senderId
                },
                // Format 5: Recipients array with phone field
                {
                    recipients: [{ phone: to }],
                    message: message,
                    source: this.senderId
                },
                // Format 6: Recipients array with destination field
                {
                    recipients: [{ destination: to }],
                    message: message,
                    source: this.senderId
                },
                // Format 7: Recipients array with number field
                {
                    recipients: [{ number: to }],
                    message: message,
                    source: this.senderId
                },
                // Format 8: Direct recipients field as string
                {
                    recipients: to,
                    message: message,
                    source: this.senderId
                }
            ];

            let lastError;
            
            for (let i = 0; i < formats.length; i++) {
                try {
                    console.log(`Trying SMS format ${i + 1}:`, formats[i]);
                    
                    const response = await axios.post(this.baseURL, formats[i], {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': this.generateAuthHeader()
                        }
                    });

                    console.log(`✅ SMS sent successfully with format ${i + 1} to ${to}`);
                    console.log('📋 Full SMS Leopard API Response:', JSON.stringify(response.data, null, 2));
                    
                    // Log specific response fields
                    if (response.data) {
                        console.log('📱 Response Details:');
                        console.log('  - Success:', response.data.success || response.data.status);
                        console.log('  - Message ID:', response.data.message_id || response.data.id || response.data.messageId);
                        console.log('  - Recipients:', response.data.recipients || response.data.recipient || 'N/A');
                        console.log('  - Status Code:', response.data.status_code || response.status);
                        console.log('  - Credits Used:', response.data.credits_used || response.data.cost || 'N/A');
                        console.log('  - Delivery Status:', response.data.delivery_status || 'N/A');
                    }
                    
                    // Update usage if memberId provided
                    if (memberId && smsType !== 'login_otp' && smsType !== 'verification_otp') {
                        await this.updateSMSUsage(memberId);
                    }

                    return { 
                        success: true, 
                        data: response.data, 
                        format: i + 1,
                        messageId: response.data?.message_id || response.data?.id || response.data?.messageId,
                        recipients: response.data?.recipients || response.data?.recipient
                    };
                } catch (formatError) {
                    lastError = formatError;
                    console.log(`❌ Format ${i + 1} failed:`, formatError.response?.data || formatError.message);
                    if (formatError.response?.data) {
                        console.log('📋 Full Error Response:', JSON.stringify(formatError.response.data, null, 2));
                    }
                    continue;
                }
            }

            // If all formats failed, throw the last error
            throw lastError;
        } catch (error) {
            console.error('❌ All SMS formats failed. Final error:', error.response?.data || error.message);
            console.error('📋 Full Final Error Response:', JSON.stringify(error.response?.data || {}, null, 2));
            console.error('🔗 SMS request URL:', this.baseURL);
            console.error('🔑 Environment Variables Check:');
            console.error('  - API Key:', this.apiKey ? 'Present' : 'Missing');
            console.error('  - API Secret:', this.apiSecret ? 'Present' : 'Missing'); 
            console.error('  - Sender ID:', this.senderId);
            console.error('  - Base URL:', this.baseURL);
            console.error('📞 Target Phone:', to);
            console.error('💬 Message:', message);
            
            return { 
                success: false, 
                error: error.response?.data || error.message,
                fullError: error.response?.data,
                formats_tried: 4
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
require('dotenv').config();
const brevo = require('@getbrevo/brevo');

class BrevoEmailService {
    constructor() {
        if (!process.env.BREVO_API_KEY) {
            console.error('❌ BREVO_API_KEY is not set in environment variables!');
        } else {
            console.log('✅ Brevo email service initialized');
        }
        
        this.apiInstance = new brevo.TransactionalEmailsApi();
        this.apiInstance.setApiKey(
            brevo.TransactionalEmailsApiApiKeys.apiKey, 
            process.env.BREVO_API_KEY
        );
    }

    /**
     * Send email verification code
     */
    async sendVerificationEmail(email, fullName, verificationCode) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = "Verify Your Email - Jaza Nyumba";
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_SECURITY_EMAIL || "security@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .code { background: #fff; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border: 2px dashed #4F46E5; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Jaza Nyumba!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>Thank you for registering with Jaza Nyumba. Please verify your email address by entering the code below:</p>
                        <div class="code">${verificationCode}</div>
                        <p>This code will expire in 15 minutes.</p>
                        <p>If you didn't request this verification, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Verification email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    /**
     * Send contribution reminder
     */
    async sendContributionReminder(email, fullName, groupName, amount, dueDate) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = `Contribution Reminder - ${groupName}`;
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .amount { background: #fff; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; color: #10B981; border: 2px solid #10B981; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Contribution Reminder</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>This is a friendly reminder that your contribution to <strong>${groupName}</strong> is due soon.</p>
                        <div class="amount">KES ${amount.toLocaleString()}</div>
                        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                        <p>Please make your contribution on time to keep your group on track.</p>
                        <p><a href="${process.env.FRONTEND_URL || 'https://jazanyumba.online'}/dashboard" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">View Dashboard</a></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Contribution reminder sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending contribution reminder:', error);
            throw new Error('Failed to send contribution reminder');
        }
    }

    /**
     * Send loan repayment reminder
     */
    async sendLoanRepaymentReminder(email, fullName, loanAmount, dueAmount, dueDate) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = "Loan Repayment Reminder - Jaza Nyumba";
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .amount { background: #fff; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; color: #EF4444; border: 2px solid #EF4444; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💰 Loan Repayment Reminder</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>This is a reminder about your upcoming loan repayment.</p>
                        <p><strong>Loan Amount:</strong> KES ${loanAmount.toLocaleString()}</p>
                        <div class="amount">KES ${dueAmount.toLocaleString()}</div>
                        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                        <p>Please ensure timely repayment to maintain your good standing.</p>
                        <p><a href="${process.env.FRONTEND_URL || 'https://jazanyumba.online'}/loans" style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">View Loans</a></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Loan repayment reminder sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending loan repayment reminder:', error);
            throw new Error('Failed to send loan repayment reminder');
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, fullName, resetToken) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        const resetUrl = `${process.env.FRONTEND_URL || 'https://jazanyumba.online'}/email-password-reset/${resetToken}`;
        
        sendSmtpEmail.subject = "Reset Your Password - Jaza Nyumba";
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_SECURITY_EMAIL || "security@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔒 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request a password reset, please ignore this email.</p>
                        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">Or copy this link: ${resetUrl}</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Password reset email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    /**
     * Send welcome email after successful verification
     */
    async sendWelcomeEmail(email, fullName, groupName) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = "Welcome to Jaza Nyumba! 🎉";
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Jaza Nyumba!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>Your email has been verified successfully! You're now part of <strong>${groupName}</strong>.</p>
                        <p>With Jaza Nyumba, you can:</p>
                        <ul>
                            <li>Track contributions and savings</li>
                            <li>Manage loans and repayments</li>
                            <li>View group leaderboards</li>
                            <li>Get AI-powered insights</li>
                        </ul>
                        <a href="${process.env.FRONTEND_URL || 'https://jazanyumba.online'}/dashboard" class="button">Go to Dashboard</a>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Welcome email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending welcome email:', error);
            // Don't throw error for welcome email as it's not critical
            return { success: false, error: error.message };
        }
    }

    /**
     * Send group invitation email
     */
    async sendGroupInvitationEmail(email, recipientName, groupName, inviteCode, inviterName, inviteLink) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = `You're Invited to Join ${groupName} on Jaza Nyumba`;
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: recipientName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #7C3AED; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .invite-code { background: #fff; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #7C3AED; border: 3px dashed #7C3AED; border-radius: 8px; margin: 20px 0; }
                    .button { background: #7C3AED; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
                    .info-box { background: #EDE9FE; border-left: 4px solid #7C3AED; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎊 You're Invited!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${recipientName},</h2>
                        <p><strong>${inviterName}</strong> has invited you to join <strong>${groupName}</strong> on Jaza Nyumba!</p>
                        
                        <div class="info-box">
                            <strong>What is Jaza Nyumba?</strong>
                            <p>Jaza Nyumba is a digital platform for managing savings groups (Chamas). Track contributions, manage loans, and access AI-powered financial insights!</p>
                        </div>

                        <p>Your invitation code is:</p>
                        <div class="invite-code">${inviteCode}</div>
                        
                        <p style="text-align: center;">
                            <a href="${inviteLink}" class="button">Accept Invitation & Register</a>
                        </p>
                        
                        <p style="font-size: 14px; color: #6b7280;">
                            <strong>Note:</strong> This invitation expires in 7 days. If the button doesn't work, copy and paste this link into your browser:<br>
                            <span style="word-break: break-all; color: #7C3AED;">${inviteLink}</span>
                        </p>
                        
                        <p>We look forward to having you join the group!</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                        <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Group invitation email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending group invitation email:', error);
            throw new Error('Failed to send group invitation email');
        }
    }

    /**
     * Send pending approval notification to new member
     */
    async sendPendingApprovalEmail(email, fullName, groupName) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = `Registration Received - Pending Admin Approval`;
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .info-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏳ Registration Received</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>Thank you for accepting the invitation to join <strong>${groupName}</strong>!</p>
                        
                        <div class="info-box">
                            <strong>⏳ Pending Admin Approval</strong>
                            <p>Your registration has been received and is now pending approval from the group admin. You'll receive an email notification once your account is approved.</p>
                        </div>

                        <p><strong>What happens next?</strong></p>
                        <ul>
                            <li>The group admin will review your registration</li>
                            <li>You'll receive an email once approved</li>
                            <li>After approval, you can log in and start using Jaza Nyumba</li>
                        </ul>
                        
                        <p>We appreciate your patience!</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Pending approval email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending pending approval email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send approval notification to admin when member registers via invitation
     */
    async sendAdminApprovalNotification(adminEmail, adminName, memberName, memberEmail, groupName) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = `New Member Registration - ${groupName}`;
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email: adminEmail, name: adminName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .member-info { background: #fff; border: 2px solid #4F46E5; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>👤 New Member Registration</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${adminName},</h2>
                        <p>A new member has registered for <strong>${groupName}</strong> and is awaiting your approval.</p>
                        
                        <div class="member-info">
                            <p><strong>Name:</strong> ${memberName}</p>
                            <p><strong>Email:</strong> ${memberEmail}</p>
                            <p><strong>Status:</strong> Pending Approval</p>
                        </div>

                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://jazanyumba.online'}/admin-panel" class="button">Review & Approve</a>
                        </p>
                        
                        <p style="font-size: 14px; color: #6b7280;">
                            You can approve or deny this member from your admin dashboard.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Admin approval notification sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending admin approval notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send account approval notification
     */
    async sendAccountApprovalEmail(email, fullName, groupName) {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = `Account Approved - Welcome to ${groupName}!`;
        sendSmtpEmail.sender = { 
            name: "Jaza Nyumba", 
            email: process.env.BREVO_INFO_EMAIL || "info@jazanyumba.online" 
        };
        sendSmtpEmail.to = [{ email, name: fullName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
                    .info-box { background: #D1FAE5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Account Approved!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${fullName},</h2>
                        <p>Great news! Your account for <strong>${groupName}</strong> has been approved by the admin.</p>
                        
                        <div class="info-box">
                            <strong>🎉 You now have full access to:</strong>
                            <ul style="margin: 10px 0;">
                                <li>Track your contributions and savings</li>
                                <li>Apply for loans and view repayment schedules</li>
                                <li>View group leaderboards and performance</li>
                                <li>Access AI-powered financial insights</li>
                                <li>Receive email reminders for contributions</li>
                            </ul>
                        </div>

                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://jazanyumba.online'}/login" class="button">Login to Your Account</a>
                        </p>
                        
                        <p>Welcome to the group! We're excited to have you on this financial journey.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Account approval email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending account approval email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send loan approval email
    async sendLoanApprovalEmail(recipientEmail, memberName, loanAmount, interestRate, groupName) {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = '✅ Loan Approved - Jaza Nyumba';
        sendSmtpEmail.sender = { name: 'Jaza Nyumba', email: process.env.BREVO_INFO_EMAIL || 'info@jazanyumba.online' };
        sendSmtpEmail.to = [{ email: recipientEmail, name: memberName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .loan-info { background: #fff; border: 2px solid #10B981; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .amount { font-size: 24px; color: #10B981; font-weight: bold; text-align: center; margin: 10px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Loan Approved!</h1>
                    </div>
                    <div class="content">
                        <h2>Great news, ${memberName}!</h2>
                        <p>Your loan request for <strong>${groupName}</strong> has been approved by your group admin.</p>
                        
                        <div class="loan-info">
                            <p class="amount">KES ${loanAmount.toLocaleString()}</p>
                            <p><strong>Interest Rate:</strong> ${interestRate}%</p>
                            <p><strong>Status:</strong> Approved ✅</p>
                        </div>

                        <p>The loan amount will be disbursed according to your group's procedures. Please ensure timely repayments to maintain good standing.</p>
                        
                        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                            <strong>Next Steps:</strong><br>
                            • Contact your admin for disbursement details<br>
                            • Review your repayment schedule<br>
                            • Set up reminders for due dates
                        </p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Loan approval email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending loan approval email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send loan denial email
    async sendLoanDenialEmail(recipientEmail, memberName, reason, groupName) {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = 'Loan Request Update - Jaza Nyumba';
        sendSmtpEmail.sender = { name: 'Jaza Nyumba', email: process.env.BREVO_INFO_EMAIL || 'info@jazanyumba.online' };
        sendSmtpEmail.to = [{ email: recipientEmail, name: memberName }];
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .reason-box { background: #fff; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Loan Request Update</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${memberName},</h2>
                        <p>We wanted to update you on your recent loan request for <strong>${groupName}</strong>.</p>
                        
                        <div class="reason-box">
                            <p><strong>Status:</strong> Not Approved</p>
                            <p><strong>Reason:</strong> ${reason}</p>
                        </div>

                        <p>If you have questions about this decision, please contact your group admin for more information. You may reapply for a loan at a later time.</p>
                        
                        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                            Don't let this discourage you! Continue contributing regularly to strengthen your standing in the group.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Loan denial email sent:', response);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Error sending loan denial email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send bulk group message
    async sendBulkGroupMessage(recipientEmails, message, groupName, recipientNames) {
        const results = [];
        
        for (let i = 0; i < recipientEmails.length; i++) {
            const email = recipientEmails[i];
            const name = recipientNames[i] || 'Member';
            
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.subject = `Message from ${groupName} - Jaza Nyumba`;
            sendSmtpEmail.sender = { name: 'Jaza Nyumba', email: process.env.BREVO_INFO_EMAIL || 'info@jazanyumba.online' };
            sendSmtpEmail.to = [{ email: email, name: name }];
            sendSmtpEmail.htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                        .message-box { background: #fff; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; white-space: pre-wrap; }
                        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📢 Group Message</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name},</h2>
                            <p>You have a new message from <strong>${groupName}</strong>:</p>
                            
                            <div class="message-box">
                                ${message}
                            </div>

                            <p style="font-size: 14px; color: #6b7280;">
                                This message was sent by your group administrator.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Jaza Nyumba. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            try {
                const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
                results.push({ email, success: true, messageId: response.messageId });
            } catch (error) {
                console.error(`❌ Error sending bulk message to ${email}:`, error);
                results.push({ email, success: false, error: error.message });
            }
        }

        return results;
    }
}

module.exports = new BrevoEmailService();

// SMS Templates for Jaza Nyumba
class SMSTemplates {
    constructor() {
        this.templates = {
            // Authentication templates
            verification_otp: {
                message: "Hi {{fullName}}, your Jaza Nyumba verification code is: {{otp}}. Valid for 10 minutes. Do not share this code.",
                variables: ['fullName', 'otp']
            },
            
            login_otp: {
                message: "Hi {{fullName}}, your Jaza Nyumba login code is: {{otp}}. Valid for 5 minutes. Do not share this code.",
                variables: ['fullName', 'otp']
            },

            // Account management templates
            account_approval: {
                message: "Hi {{fullName}}! Your Jaza Nyumba account for {{groupName}} has been approved. You can now login and start saving. Welcome aboard!",
                variables: ['fullName', 'groupName']
            },

            // Loan templates
            loan_approval: {
                message: "Hi {{fullName}}! Your loan of KSH {{amount}} has been approved at {{interestRate}}% interest. Check your dashboard for repayment details.",
                variables: ['fullName', 'amount', 'interestRate']
            },

            loan_denial: {
                message: "Hi {{fullName}}, your loan request has been declined. Reason: {{reason}}. Contact your group admin for more details.",
                variables: ['fullName', 'reason']
            },

            // Contribution templates
            contribution_reminder: {
                message: "Hi {{fullName}}, reminder: Your {{groupName}} contribution of KSH {{amount}} is due {{dueDay}}. Save to stay on track! 💪",
                variables: ['fullName', 'groupName', 'amount', 'dueDay']
            },

            contribution_overdue: {
                message: "Hi {{fullName}}, your {{groupName}} contribution of KSH {{amount}} was due {{dueDay}}. Please contribute to avoid penalties. Late fee: KSH {{penalty}}",
                variables: ['fullName', 'groupName', 'amount', 'dueDay', 'penalty']
            },

            // Repayment templates
            repayment_reminder: {
                message: "Hi {{fullName}}, your loan repayment of KSH {{amount}} is due {{dueDay}}. Avoid penalties by paying on time.",
                variables: ['fullName', 'amount', 'dueDay']
            },

            repayment_overdue: {
                message: "Hi {{fullName}}, your loan repayment of KSH {{amount}} was due {{dueDay}}. Please pay immediately to avoid additional charges.",
                variables: ['fullName', 'amount', 'dueDay']
            },

            // Group invitation templates
            group_invite: {
                message: "Hi {{recipientName}}! {{inviterName}} has invited you to join {{groupName}} on Jaza Nyumba. Use invite code: {{inviteCode}}. Download the app and register today!",
                variables: ['recipientName', 'inviterName', 'groupName', 'inviteCode']
            },

            // Subscription templates
            subscription_welcome: {
                message: "Hi {{fullName}}, welcome to Jaza Nyumba Premium! You now have access to all SMS notifications and AI assistant. Enjoy your enhanced experience! 🌟",
                variables: ['fullName']
            },

            subscription_expired: {
                message: "Hi {{fullName}}, your Jaza Nyumba Premium subscription has expired. Renew now to continue receiving SMS notifications and AI assistance.",
                variables: ['fullName']
            },

            subscription_expiring: {
                message: "Hi {{fullName}}, your Jaza Nyumba Premium subscription expires in {{days}} days. Renew now to avoid interruption of services.",
                variables: ['fullName', 'days']
            },

            // Milestone templates
            milestone_achieved: {
                message: "Congratulations {{fullName}}! 🎉 You've achieved your '{{milestoneName}}' goal of KSH {{amount}}. Time to set your next financial target!",
                variables: ['fullName', 'milestoneName', 'amount']
            },

            milestone_progress: {
                message: "Hi {{fullName}}, you're {{progress}}% towards your '{{milestoneName}}' goal! Only KSH {{remaining}} to go. Keep saving! 💪",
                variables: ['fullName', 'progress', 'milestoneName', 'remaining']
            },

            // Admin templates
            admin_new_member: {
                message: "Hi {{adminName}}, {{memberName}} has requested to join {{groupName}}. Please review their application in your admin dashboard.",
                variables: ['adminName', 'memberName', 'groupName']
            },

            admin_loan_request: {
                message: "Hi {{adminName}}, {{memberName}} has requested a loan of KSH {{amount}}. Review and approve/deny in your admin dashboard.",
                variables: ['adminName', 'memberName', 'amount']
            }
        };

        // Custom templates by group (admin can customize)
        this.customTemplates = new Map();
    }

    // Get template by type
    getTemplate(templateType) {
        return this.templates[templateType] || null;
    }

    // Render template with variables
    renderTemplate(templateType, variables, groupId = null) {
        // Check for custom template first
        const customKey = `${groupId}_${templateType}`;
        let template = this.customTemplates.get(customKey) || this.templates[templateType];
        
        if (!template) {
            throw new Error(`Template '${templateType}' not found`);
        }

        let message = template.message;
        
        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            message = message.replace(regex, value);
        }

        // Check for unreplaced variables
        const unreplacedVariables = message.match(/{{(\w+)}}/g);
        if (unreplacedVariables) {
            console.warn(`Unreplaced variables in template '${templateType}':`, unreplacedVariables);
        }

        return message;
    }

    // Set custom template for a group
    setCustomTemplate(groupId, templateType, customMessage) {
        const customKey = `${groupId}_${templateType}`;
        this.customTemplates.set(customKey, { 
            message: customMessage,
            customized: true,
            createdAt: new Date()
        });
    }

    // Get available template types
    getTemplateTypes() {
        return Object.keys(this.templates);
    }

    // Get template variables for a specific template
    getTemplateVariables(templateType) {
        const template = this.templates[templateType];
        return template ? template.variables : [];
    }

    // Validate template variables
    validateTemplate(templateType, variables) {
        const template = this.templates[templateType];
        if (!template) {
            return { valid: false, error: 'Template not found' };
        }

        const missingVariables = template.variables.filter(
            variable => !(variable in variables)
        );

        if (missingVariables.length > 0) {
            return {
                valid: false,
                error: `Missing variables: ${missingVariables.join(', ')}`
            };
        }

        return { valid: true };
    }

    // Get all templates with their info
    getAllTemplates() {
        return Object.entries(this.templates).map(([type, template]) => ({
            type,
            message: template.message,
            variables: template.variables,
            customizable: true
        }));
    }
}

module.exports = new SMSTemplates();
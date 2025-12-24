const axios = require('axios');

class PaystackService {
    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY;
        this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
        this.baseURL = 'https://api.paystack.co';
        
        this.plans = {
            monthly: {
                name: 'Monthly Premium',
                amount: 10000, // KES 100 in kobo
                interval: 'monthly',
                plan_code: 'PLN_sdxjk0g1ufsv7xa',
                features: ['All SMS notifications', 'AI assistant access', 'Loan notifications', 'Contribution reminders', 'Group invites']
            },
            weekly: {
                name: 'Weekly Premium', 
                amount: 3000, // KES 30 in kobo
                interval: 'weekly',
                plan_code: 'PLN_s35pjg5h2wxi5rx',
                features: ['All SMS notifications', 'AI assistant access', 'Loan notifications', 'Contribution reminders', 'Group invites']
            }
        };
    }

    // Initialize subscription for a member
    async createSubscription(memberId, memberEmail, memberPhone, planType = 'monthly') {
        try {
            if (!this.plans[planType]) {
                throw new Error('Invalid plan type');
            }

            const plan = this.plans[planType];
            
            // Create or get plan
            const planCode = await this.getOrCreatePlan(planType, plan);
            
            // Initialize subscription
            const response = await axios.post(
                `${this.baseURL}/subscription`,
                {
                    customer: memberEmail,
                    plan: planCode,
                    callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
                    metadata: {
                        member_id: memberId,
                        phone: memberPhone,
                        plan_type: planType
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                subscription_code: response.data.data.subscription_code,
                email_token: response.data.data.email_token,
                authorization_url: response.data.data.authorization_url
            };

        } catch (error) {
            console.error('Subscription creation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Get or create a plan
    async getOrCreatePlan(planType, planDetails) {
        // Return the existing plan code directly
        return planDetails.plan_code;
    }

    // Verify subscription payment
    async verifySubscription(reference) {
        try {
            const response = await axios.get(
                `${this.baseURL}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`
                    }
                }
            );

            const data = response.data.data;
            
            return {
                success: data.status === 'success',
                amount: data.amount,
                currency: data.currency,
                customer: data.customer,
                metadata: data.metadata,
                reference: data.reference,
                subscription: data.subscription
            };

        } catch (error) {
            console.error('Verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Get subscription details
    async getSubscription(subscriptionCode) {
        try {
            const response = await axios.get(
                `${this.baseURL}/subscription/${subscriptionCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`
                    }
                }
            );

            const subscription = response.data.data;
            
            return {
                success: true,
                status: subscription.status,
                amount: subscription.amount,
                next_payment_date: subscription.next_payment_date,
                customer: subscription.customer,
                plan: subscription.plan,
                metadata: subscription.metadata
            };

        } catch (error) {
            console.error('Get subscription error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Cancel subscription
    async cancelSubscription(subscriptionCode, token) {
        try {
            const response = await axios.post(
                `${this.baseURL}/subscription/disable`,
                {
                    code: subscriptionCode,
                    token: token
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                message: 'Subscription cancelled successfully'
            };

        } catch (error) {
            console.error('Cancel subscription error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Get available plans
    getPlans() {
        return this.plans;
    }

    // Check if member has active subscription
    async checkMemberSubscription(memberId) {
        // This would typically query your database for subscription status
        // For now, return a basic structure
        return {
            isActive: false,
            planType: null,
            expiresAt: null,
            features: []
        };
    }

    // Get member feature access
    getMemberFeatures(planType) {
        if (!planType) {
            return {
                sms_notifications: false,
                ai_access: false,
                loan_notifications: false,
                contribution_reminders: false,
                group_invites: false
            };
        }

        return {
            sms_notifications: true,
            ai_access: true,
            loan_notifications: true,
            contribution_reminders: true,
            group_invites: true
        };
    }
}

module.exports = new PaystackService();
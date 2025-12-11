const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');
const paystackService = require('../services/paystackService');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get available subscription plans
router.get('/plans', (req, res) => {
    const plans = paystackService.getPlans();
    res.json({ plans });
});

// Get member subscription status
router.get('/my-subscription', authenticateToken, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ member_id: req.user.id });
        
        if (!subscription) {
            return res.json({
                hasSubscription: false,
                isActive: false,
                planType: null,
                features: {
                    sms_notifications: false,
                    ai_access: false,
                    loan_notifications: false,
                    contribution_reminders: false,
                    group_invites: false
                },
                message: 'No subscription found'
            });
        }

        res.json({
            hasSubscription: true,
            isActive: subscription.isActive(),
            planType: subscription.plan_type,
            status: subscription.status,
            features: subscription.features,
            nextPaymentDate: subscription.next_payment_date,
            expiresAt: subscription.expires_at,
            usage: subscription.usage
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get subscription status (alias for frontend compatibility)
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ member_id: req.user.id });
        
        if (!subscription || !subscription.isActive()) {
            return res.json({
                hasActiveSubscription: false,
                plan: null,
                frequency: null,
                expiresAt: null,
                usage: null
            });
        }

        res.json({
            hasActiveSubscription: true,
            plan: subscription.plan_type,
            frequency: subscription.billing_frequency,
            expiresAt: subscription.expires_at,
            usage: subscription.usage
        });

    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize new subscription for member
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const { planType, customerEmail } = req.body;
        
        if (!planType || !customerEmail) {
            return res.status(400).json({ error: 'Plan type and customer email are required' });
        }

        if (!['monthly', 'weekly'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type. Choose monthly or weekly.' });
        }

        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if subscription already exists
        let subscription = await Subscription.findOne({ member_id: req.user.id });
        
        if (subscription && subscription.isActive()) {
            return res.status(400).json({ error: 'You already have an active subscription' });
        }

        // Create Paystack subscription
        const paystackResult = await paystackService.createSubscription(
            req.user.id,
            customerEmail,
            member.phone,
            planType
        );

        if (!paystackResult.success) {
            return res.status(400).json({ error: paystackResult.error });
        }

        // Create or update subscription record
        const planDetails = paystackService.getPlans()[planType];
        const subscriptionData = {
            member_id: req.user.id,
            plan_type: planType,
            status: 'inactive', // Will be activated after payment
            subscription_code: paystackResult.subscription_code,
            authorization_url: paystackResult.authorization_url,
            amount: planDetails.amount,
            currency: 'KES',
            interval: planDetails.interval,
            features: getPlanFeatures(planType)
        };

        if (subscription) {
            Object.assign(subscription, subscriptionData);
            await subscription.save();
        } else {
            subscription = new Subscription(subscriptionData);
            await subscription.save();
        }

        res.json({
            message: 'Subscription initialized',
            authorizationUrl: paystackResult.authorization_url,
            subscriptionCode: paystackResult.subscription_code
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle Paystack webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = req.body;
        
        // Verify webhook signature (implement based on Paystack docs)
        // const signature = req.headers['x-paystack-signature'];
        
        switch (event.event) {
            case 'subscription.create':
                await this.handleSubscriptionCreated(event.data);
                break;
                
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data);
                break;
                
            case 'subscription.disable':
                await this.handleSubscriptionDisabled(event.data);
                break;
                
            default:
                console.log('Unhandled webhook event:', event.event);
        }
        
        res.status(200).json({ received: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});

// Verify payment and activate subscription
router.post('/verify/:reference', authenticateToken, async (req, res) => {
    try {
        const { reference } = req.params;
        
        const verification = await paystackService.verifySubscription(reference);
        
        if (!verification.success) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        const memberId = verification.metadata.member_id;
        if (memberId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const subscription = await Subscription.findOne({ member_id: memberId });
        
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Calculate expiry based on plan
        const now = new Date();
        const expiryDate = subscription.plan_type === 'weekly' 
            ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)  // 7 days
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Activate subscription
        subscription.status = 'active';
        subscription.start_date = now;
        subscription.expires_at = expiryDate;
        subscription.next_payment_date = expiryDate;
        subscription.features = getPlanFeatures(subscription.plan_type);
        
        // Add payment to history
        subscription.payments.push({
            reference: verification.reference,
            amount: verification.amount,
            status: 'success',
            paid_at: new Date()
        });
        
        await subscription.save();

        // Update member's subscription status
        await Member.findByIdAndUpdate(memberId, {
            has_active_subscription: true,
            subscription_plan: subscription.plan_type,
            subscription_expires: expiryDate
        });

        res.json({
            message: 'Subscription activated successfully',
            subscription: {
                planType: subscription.plan_type,
                status: subscription.status,
                expiresAt: subscription.expires_at,
                features: subscription.features
            }
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ member_id: req.user.id });
        
        if (!subscription) {
            return res.status(404).json({ error: 'No subscription found' });
        }

        // Cancel with Paystack
        const cancelResult = await paystackService.cancelSubscription(
            subscription.subscription_code,
            subscription.token
        );

        if (cancelResult.success) {
            subscription.status = 'cancelled';
            subscription.cancelled_at = new Date();
            await subscription.save();

            // Update member status
            await Member.findByIdAndUpdate(req.user.id, {
                has_active_subscription: false,
                subscription_plan: null,
                subscription_expires: null
            });
            
            res.json({ message: 'Subscription cancelled successfully' });
        } else {
            res.status(400).json({ error: 'Failed to cancel subscription' });
        }

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper methods
function getPlanFeatures(planType) {
    const features = {
        monthly: {
            sms_notifications: true,
            ai_access: true,
            loan_notifications: true,
            contribution_reminders: true,
            group_invites: true
        },
        weekly: {
            sms_notifications: true,
            ai_access: true,
            loan_notifications: true,
            contribution_reminders: true,
            group_invites: true
        }
    };
    
    return features[planType] || {
        sms_notifications: false,
        ai_access: false,
        loan_notifications: false,
        contribution_reminders: false,
        group_invites: false
    };
}

async function handleSubscriptionCreated(data) {
    // Handle subscription creation webhook
    console.log('Subscription created:', data);
}

async function handlePaymentFailed(data) {
    // Handle failed payment webhook
    console.log('Payment failed:', data);
    // You might want to send notifications here
}

async function handleSubscriptionDisabled(data) {
    // Handle subscription disabled webhook
    console.log('Subscription disabled:', data);
}

module.exports = router;
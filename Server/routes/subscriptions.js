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
        // Verify webhook signature
        const hash = require('crypto')
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = req.body;
        
        switch (event.event) {
            case 'subscription.create':
                await handleSubscriptionCreated(event.data);
                break;
                
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data);
                break;
                
            case 'subscription.disable':
                await handleSubscriptionDisabled(event.data);
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
        console.log('Verifying subscription:', reference, 'for user:', req.user.id);
        
        const verification = await paystackService.verifySubscription(reference);
        console.log('Paystack verification result:', verification);
        
        if (!verification.success) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        const memberId = verification.metadata.member_id;
        console.log('Transaction member_id:', memberId, 'Request user_id:', req.user.id);
        if (memberId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized - transaction does not belong to you' });
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
    try {
        console.log('Processing subscription created webhook:', data);

        const { subscription_code, customer, plan, metadata } = data;
        const memberId = metadata.member_id;
        const planType = metadata.plan_type;

        if (!memberId) {
            console.error('No member_id in subscription metadata');
            return;
        }

        // Get plan details to determine features
        const planFeatures = getPlanFeatures(planType);

        // Create or update subscription
        const subscriptionData = {
            member_id: memberId,
            plan_type: planType,
            status: 'active',
            subscription_code: subscription_code,
            customer_code: customer.customer_code,
            amount: plan.amount / 100, // Convert from kobo to KES
            currency: plan.currency,
            interval: plan.interval,
            start_date: new Date(),
            next_payment_date: new Date(Date.now() + (planType === 'monthly' ? 30 : 7) * 24 * 60 * 60 * 1000),
            features: planFeatures,
            updated_at: new Date()
        };

        // Use upsert to create or update
        await Subscription.findOneAndUpdate(
            { member_id: memberId },
            subscriptionData,
            { upsert: true, new: true }
        );

        // Update member's subscription status
        const expiryDate = subscriptionData.next_payment_date;
        await Member.findByIdAndUpdate(memberId, {
            has_active_subscription: true,
            subscription_plan: planType,
            subscription_expires: expiryDate
        });

        console.log(`Subscription activated for member ${memberId}`);

    } catch (error) {
        console.error('Error handling subscription created:', error);
    }
}

async function handlePaymentFailed(data) {
    try {
        console.log('Processing payment failed webhook:', data);

        const { subscription_code } = data;

        if (!subscription_code) {
            console.error('No subscription_code in payment failed data');
            return;
        }

        // Find subscription and mark as suspended or handle failed payment
        const subscription = await Subscription.findOne({ subscription_code });

        if (subscription) {
            // You might want to suspend features or send notifications
            console.log(`Payment failed for subscription ${subscription_code}, member ${subscription.member_id}`);
            // Could update status to 'suspended' or send notification
        }

    } catch (error) {
        console.error('Error handling payment failed:', error);
    }
}

async function handleSubscriptionDisabled(data) {
    try {
        console.log('Processing subscription disabled webhook:', data);

        const { subscription_code } = data;

        if (!subscription_code) {
            console.error('No subscription_code in subscription disabled data');
            return;
        }

        // Update subscription status to cancelled
        const subscription = await Subscription.findOneAndUpdate(
            { subscription_code },
            {
                status: 'cancelled',
                cancelled_at: new Date(),
                updated_at: new Date()
            },
            { new: true }
        );

        // Update member's subscription status if subscription found
        if (subscription) {
            await Member.findByIdAndUpdate(subscription.member_id, {
                has_active_subscription: false,
                subscription_plan: null,
                subscription_expires: null
            });
        }

        console.log(`Subscription ${subscription_code} cancelled`);

    } catch (error) {
        console.error('Error handling subscription disabled:', error);
    }
}

module.exports = router;
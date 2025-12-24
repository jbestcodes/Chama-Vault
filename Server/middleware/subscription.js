const Member = require('../models/Member');
const Subscription = require('../models/Subscription');

// Middleware to check if member has active subscription
const requireSubscription = async (req, res, next) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if member has active subscription
        if (!member.has_active_subscription || new Date() > member.subscription_expires) {
            return res.status(403).json({ 
                error: 'Premium subscription required',
                message: 'This feature requires an active subscription. Please subscribe to continue.',
                subscriptionRequired: true
            });
        }

        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to check specific feature access
const requireFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const subscription = await Subscription.findOne({ 
                member_id: req.user.id,
                status: 'active'
            });

            if (!subscription || !subscription.isActive()) {
                return res.status(403).json({ 
                    error: 'Premium subscription required',
                    message: `${featureName} requires an active subscription.`,
                    subscriptionRequired: true
                });
            }

            if (!subscription.hasFeature(featureName)) {
                return res.status(403).json({ 
                    error: 'Feature not available',
                    message: `${featureName} is not included in your current plan.`
                });
            }

            req.subscription = subscription;
            next();
        } catch (error) {
            console.error('Feature check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Check AI access (includes 2-week trial for new members)
const requireAI = async (req, res, next) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if member is still in 2-week trial period
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const isInTrialPeriod = new Date(member.created_at) > twoWeeksAgo;
        
        if (isInTrialPeriod) {
            req.trialUser = true;
            return next(); // Allow access during trial
        }

        // Check for active subscription
        const subscription = await Subscription.findOne({ 
            member_id: req.user.id,
            status: 'active'
        });

        if (!subscription || !subscription.isActive()) {
            return res.status(403).json({ 
                error: 'AI access expired',
                message: 'Your 2-week AI trial has expired. Please subscribe to continue using AI features.',
                subscriptionRequired: true,
                trialExpired: true
            });
        }

        if (!subscription.hasFeature('ai_access')) {
            return res.status(403).json({ 
                error: 'Feature not available',
                message: 'AI access is not included in your current plan.'
            });
        }

        req.subscription = subscription;
        next();
    } catch (error) {
        console.error('AI access check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Check SMS notifications access
const requireSMS = requireFeature('sms_notifications');

// Check group invite access
const requireGroupInvite = requireFeature('group_invites');

// Middleware for basic features (always allowed)
const allowBasicFeatures = (req, res, next) => {
    // These features are always available:
    // - Login OTP
    // - View savings
    // - Set milestones
    next();
};

// Check if member is still in AI trial period
const checkAITrialStatus = async (memberId) => {
    try {
        const member = await Member.findById(memberId);
        if (!member) return { inTrial: false, daysLeft: 0 };

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const isInTrialPeriod = new Date(member.created_at) > twoWeeksAgo;
        
        if (isInTrialPeriod) {
            const daysSinceSignup = Math.floor((new Date() - new Date(member.created_at)) / (1000 * 60 * 60 * 24));
            const daysLeft = 14 - daysSinceSignup;
            return { inTrial: true, daysLeft: Math.max(0, daysLeft) };
        }
        
        return { inTrial: false, daysLeft: 0 };
    } catch (error) {
        console.error('Error checking AI trial status:', error);
        return { inTrial: false, daysLeft: 0 };
    }
};

// Check leaderboard access (includes 2-week trial for new members)
const requireLeaderboard = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const member = await Member.findById(userId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Check if member is still in 2-week trial period
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const isInTrialPeriod = new Date(member.created_at) > twoWeeksAgo;
        
        if (isInTrialPeriod) {
            return next();
        }
        
        // Check for active subscription
        const hasActiveSubscription = await checkSubscriptionStatus(userId);
        
        if (hasActiveSubscription) {
            return next();
        } else {
            return res.status(403).json({ 
                error: 'Subscription required', 
                code: 'LEADERBOARD_SUBSCRIPTION_REQUIRED',
                message: 'Your 2-week leaderboard trial has expired. Please subscribe to continue accessing the leaderboard.',
                feature: 'leaderboard'
            });
        }

    } catch (error) {
        console.error('Leaderboard access check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Check if member is still in leaderboard trial period
const checkLeaderboardTrialStatus = async (memberId) => {
    try {
        const member = await Member.findById(memberId);
        if (!member) return { inTrial: false, daysLeft: 0 };

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const isInTrialPeriod = new Date(member.created_at) > twoWeeksAgo;
        
        if (isInTrialPeriod) {
            const daysSinceSignup = Math.floor((new Date() - new Date(member.created_at)) / (1000 * 60 * 60 * 24));
            const daysLeft = 14 - daysSinceSignup;
            return { inTrial: true, daysLeft: Math.max(0, daysLeft) };
        }
        
        return { inTrial: false, daysLeft: 0 };
    } catch (error) {
        console.error('Error checking leaderboard trial status:', error);
        return { inTrial: false, daysLeft: 0 };
    }
};

// Check if member is still in notifications/reminders trial period (2 weeks)
const checkNotificationTrialStatus = async (memberId) => {
    try {
        const member = await Member.findById(memberId);
        if (!member) return { inTrial: false, daysLeft: 0 };

        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const isInTrialPeriod = new Date(member.created_at) > twoWeeksAgo;
        
        if (isInTrialPeriod) {
            const daysSinceSignup = Math.floor((new Date() - new Date(member.created_at)) / (1000 * 60 * 60 * 24));
            const daysLeft = 14 - daysSinceSignup;
            return { inTrial: true, daysLeft: Math.max(0, daysLeft) };
        }
        
        return { inTrial: false, daysLeft: 0 };
    } catch (error) {
        console.error('Error checking notification trial status:', error);
        return { inTrial: false, daysLeft: 0 };
    }
};

module.exports = {
    requireSubscription,
    requireFeature,
    requireAI,
    requireSMS,
    requireGroupInvite,
    requireLeaderboard,
    allowBasicFeatures,
    checkAITrialStatus,
    checkLeaderboardTrialStatus,
    checkNotificationTrialStatus
};
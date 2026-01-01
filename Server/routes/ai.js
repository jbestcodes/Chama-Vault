const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAI, checkAITrialStatus } = require('../middleware/subscription');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const Milestone = require('../models/Milestone');
const Subscription = require('../models/Subscription');
const openaiService = require('../services/openaiServices');

// 1. Trial Status Route
router.get('/trial-status', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        const trialStatus = await checkAITrialStatus(memberId);
        
        const subscription = await Subscription.findOne({ 
            member_id: memberId,
            status: 'active'
        });

        res.json({
            ...trialStatus,
            hasActiveSubscription: !!subscription,
            message: trialStatus.inTrial 
                ? `You have ${trialStatus.daysLeft} days left in your AI trial period.`
                : subscription 
                ? 'You have full AI access with your subscription.'
                : 'Your AI trial has expired. Subscribe to continue using AI features.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check trial status' });
    }
});

// 2. Financial Nudge (Uses Service)
router.get('/financial-nudge', authenticateToken, requireAI, async (req, res) => {
    try {
        const userId = req.user.id;
        const trialStatus = await checkAITrialStatus(userId);
        await updateAIUsage(userId);
        
        const member = await Member.findById(userId);
        const savings = await Savings.find({ member_id: userId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        
        // Prepare data for AI
        const memberData = {
            totalSavings,
            full_name: member.full_name,
            group_name: member.group_name
        };

        let nudge = await openaiService.generateFinancialNudge(memberData);
        
        if (trialStatus.inTrial) {
            nudge += `\n\n🎁 Trial: ${trialStatus.daysLeft} days remaining.`;
        }
        
        res.json({ nudge, trialInfo: trialStatus });
    } catch (error) {
        res.status(500).json({ error: 'Nudge failed' });
    }
});

// 3. Loan Analysis (Uses Service)
router.get('/loan-analysis', authenticateToken, requireAI, async (req, res) => {
    try {
        const memberId = req.user.id;
        await updateAIUsage(memberId);
        
        const savings = await Savings.find({ member_id: memberId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        const activeLoan = await Loan.findOne({ member_id: memberId, status: 'active' });

        const memberData = {
            totalSavings,
            hasActiveLoan: !!activeLoan,
            membershipMonths: 3, // Logic to calculate this from member.createdAt if needed
            consistencyRate: 85
        };

        const analysis = await openaiService.analyzeLoanEligibility(memberData);
        res.json({ analysis });
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed' });
    }
});

// 4. Personalized Chat (Financial Assistant)
router.post('/chat', authenticateToken, requireAI, async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.user.id;
        
        const member = await Member.findById(userId);
        const userSavings = await Savings.find({ member_id: userId });
        const totalSavings = userSavings.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const activeLoan = await Loan.findOne({ member_id: userId, status: 'active' });

        const context = `User: ${member.full_name}, Savings: KSh ${totalSavings}, Active Loan: ${activeLoan ? 'Yes' : 'No'}`;

        const response = await openaiService.chatbotResponse(question, member.group_id, context);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: 'Chat failed' });
    }
});

// 5. Live Support Chat (Public - No Auth Required)
router.post('/support/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const reply = await openaiService.generateLiveSupportResponse(message);
        res.json({ reply, source: 'ai' });
    } catch (error) {
        res.json({ reply: 'Connection error.', source: 'error' });
    }
});

async function updateAIUsage(memberId) {
    try {
        const subscription = await Subscription.findOne({ member_id: memberId });
        if (subscription && subscription.usage) {
            subscription.usage.ai_requests_this_month += 1;
            await subscription.save();
        }
    } catch (error) {
        console.error('Usage update failed', error);
    }
}

module.exports = router;
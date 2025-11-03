const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Member = require('../models/Member');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const Milestone = require('../models/Milestone');

// AI Financial Nudge endpoint
router.get('/financial-nudge', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Get user's actual data
        const member = await Member.findById(memberId);
        const savings = await Savings.find({ member_id: memberId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        
        // Get milestone if exists
        const milestone = await Milestone.findOne({ member_id: memberId }).sort({ createdAt: -1 });
        
        let nudge;
        if (totalSavings === 0) {
            nudge = `Karibu ${member.full_name}! Welcome to ${member.group_name}. You haven't started saving yet - take the first step towards financial freedom today! 🌟`;
        } else if (milestone) {
            const progress = (totalSavings / milestone.target_amount) * 100;
            const remaining = milestone.target_amount - totalSavings;
            nudge = `Hongera ${member.full_name}! You've saved KSh ${totalSavings.toLocaleString()} towards your "${milestone.milestone_name}" goal. You're ${progress.toFixed(1)}% there! Only KSh ${remaining.toLocaleString()} to go! 💪`;
        } else {
            nudge = `Great work ${member.full_name}! You've saved KSh ${totalSavings.toLocaleString()} in ${member.group_name}. Ready to set your first milestone? 🎯`;
        }
        
        res.json({ nudge });
    } catch (error) {
        console.error('Financial nudge error:', error);
        res.status(500).json({ error: 'Failed to get financial nudge' });
    }
});

// AI Loan Analysis endpoint
router.get('/loan-analysis', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Get user's data
        const member = await Member.findById(memberId);
        const savings = await Savings.find({ member_id: memberId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        const activeLoan = await Loan.findOne({ member_id: memberId, status: 'active' });
        
        // Calculate eligibility
        const maxLoanAmount = totalSavings * 3; // 3x savings rule
        const hasActiveLoan = !!activeLoan;
        const meetsMinimum = totalSavings >= 500; // Minimum KSh 500 savings
        
        let eligibility, recommendation;
        
        if (hasActiveLoan) {
            eligibility = 'Not Eligible';
            recommendation = `You have an active loan of KSh ${activeLoan.total_due.toLocaleString()}. Please complete your current loan repayments before applying for a new loan.`;
        } else if (!meetsMinimum) {
            const needed = 500 - totalSavings;
            eligibility = 'Not Eligible';
            recommendation = `Build your savings first! You need KSh ${needed.toLocaleString()} more to reach the minimum KSh 500 requirement for loan eligibility.`;
        } else {
            eligibility = 'Qualified';
            recommendation = `Excellent! Based on your KSh ${totalSavings.toLocaleString()} savings in ${member.group_name}, you qualify for loans with competitive rates. Your financial discipline shows! 🏆`;
        }
        
        const analysis = {
            eligibility,
            maxAmount: hasActiveLoan ? 'KSh 0' : `KSh ${maxLoanAmount.toLocaleString()}`,
            currentSavings: `KSh ${totalSavings.toLocaleString()}`,
            recommendation
        };
        
        res.json({ analysis });
    } catch (error) {
        console.error('Loan analysis error:', error);
        res.status(500).json({ error: 'Failed to get loan analysis' });
    }
});

// AI Savings Health endpoint
router.get('/savings-health', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Get user's data
        const member = await Member.findById(memberId);
        const savings = await Savings.find({ member_id: memberId }).sort({ createdAt: -1 });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        
        // Calculate health score based on consistency
        const recentSavings = savings.slice(0, 4); // Last 4 entries
        const hasRecentActivity = recentSavings.length > 0;
        const consistencyScore = (recentSavings.length / 4) * 100;
        
        let score, status, summary;
        
        if (totalSavings === 0) {
            score = 0;
            status = 'Getting Started';
            summary = `Welcome to your financial journey ${member.full_name}! Every expert was once a beginner. Start with small, consistent savings to build momentum! 🌱`;
        } else if (consistencyScore >= 75) {
            score = 85 + Math.random() * 10;
            status = 'Excellent';
            summary = `Outstanding work ${member.full_name}! Your consistent saving pattern of KSh ${totalSavings.toLocaleString()} shows exceptional financial discipline. You're a role model! 🌟`;
        } else if (consistencyScore >= 50) {
            score = 60 + Math.random() * 20;
            status = 'Good';
            summary = `Good progress ${member.full_name}! You've saved KSh ${totalSavings.toLocaleString()}. Try to maintain more regular contributions to maximize your financial growth! 📈`;
        } else if (consistencyScore > 0) {
            score = 30 + Math.random() * 25;
            status = 'Needs Improvement';
            summary = `You're on the right track ${member.full_name} with KSh ${totalSavings.toLocaleString()} saved! Consider setting a weekly savings routine to boost your financial health! 💪`;
        }
        
        const health = {
            score: Math.round(score),
            status,
            summary,
            totalSavings: `KSh ${totalSavings.toLocaleString()}`,
            recentEntries: recentSavings.length,
            groupName: member.group_name
        };
        
        res.json({ health });
    } catch (error) {
        console.error('Savings health error:', error);
        res.status(500).json({ error: 'Failed to get savings health' });
    }
});

// AI Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { question } = req.body;
        const memberId = req.user.id;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // Get user context for personalized responses
        const member = await Member.findById(memberId);
        const savings = await Savings.find({ member_id: memberId });
        const totalSavings = savings.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        const activeLoan = await Loan.findOne({ member_id: memberId, status: 'active' });
        
        let response = `Habari ${member.full_name}! I'm here to help with your Chama questions! 🤖`;
        
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('loan')) {
            if (activeLoan) {
                response = `You currently have an active loan of KSh ${activeLoan.total_due.toLocaleString()}. Focus on completing your repayments before applying for new loans. You've got this! 💪`;
            } else if (totalSavings >= 500) {
                const maxLoan = totalSavings * 3;
                response = `Great news! With KSh ${totalSavings.toLocaleString()} saved, you can borrow up to KSh ${maxLoan.toLocaleString()} from ${member.group_name}. Your consistent saving has paid off! 🎉`;
            } else {
                const needed = 500 - totalSavings;
                response = `You need at least KSh 500 in savings to qualify for loans. You currently have KSh ${totalSavings.toLocaleString()}. Save KSh ${needed.toLocaleString()} more to unlock loan benefits! 📊`;
            }
        } else if (lowerQuestion.includes('withdraw')) {
            if (activeLoan) {
                response = `Withdrawal isn't possible while you have an active loan of KSh ${activeLoan.total_due.toLocaleString()}. Complete your loan repayments first for financial flexibility! 🔒`;
            } else if (totalSavings > 0) {
                response = `You can request to withdraw from your KSh ${totalSavings.toLocaleString()} savings. Remember, all withdrawal requests require admin approval in ${member.group_name}. Plan wisely! 💡`;
            } else {
                response = `You haven't started saving yet! Build your savings first before considering withdrawals. Every journey begins with a single step! 🌟`;
            }
        } else if (lowerQuestion.includes('save') || lowerQuestion.includes('contribution')) {
            if (totalSavings === 0) {
                response = `Welcome to ${member.group_name}! Start your savings journey today - even small amounts make a big difference over time! Your future self will thank you! 🌱`;
            } else {
                response = `Excellent work! You've saved KSh ${totalSavings.toLocaleString()} so far in ${member.group_name}. Keep up those regular contributions to grow your financial security! 📈`;
            }
        } else if (lowerQuestion.includes('group') || lowerQuestion.includes('chama')) {
            response = `You're a valued member of ${member.group_name}! Your group operates with shared goals and mutual support. Together, you're building financial strength! 🤝`;
        } else if (lowerQuestion.includes('balance') || lowerQuestion.includes('total')) {
            response = `Your current balance in ${member.group_name} is KSh ${totalSavings.toLocaleString()}. ${totalSavings > 0 ? 'Keep up the great work!' : 'Ready to start your savings journey?'} 💰`;
        }
        
        res.json({ response });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

module.exports = router;
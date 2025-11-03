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
        if (milestone) {
            const progress = (totalSavings / milestone.target_amount) * 100;
            nudge = `Hi ${member.full_name}! You've saved $${totalSavings.toFixed(2)} towards your "${milestone.milestone_name}" goal. You're ${progress.toFixed(1)}% there - keep it up!`;
        } else {
            nudge = `Great job ${member.full_name}! You've saved $${totalSavings.toFixed(2)} in ${member.group_name}. Consider setting a milestone to track your progress!`;
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
        const meetsMinimum = totalSavings >= 100; // Minimum $100 savings
        
        let eligibility, recommendation;
        
        if (hasActiveLoan) {
            eligibility = 'Not Eligible';
            recommendation = `You have an active loan of $${activeLoan.total_due}. Please repay your current loan before applying for a new one.`;
        } else if (!meetsMinimum) {
            eligibility = 'Not Eligible';
            recommendation = 'Save at least $100 before becoming eligible for loans.';
        } else {
            eligibility = 'Qualified';
            recommendation = `Based on your $${totalSavings.toFixed(2)} savings in ${member.group_name}, you qualify for competitive rates.`;
        }
        
        const analysis = {
            eligibility,
            maxAmount: hasActiveLoan ? '$0' : `$${maxLoanAmount.toFixed(2)}`,
            currentSavings: `$${totalSavings.toFixed(2)}`,
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
        
        if (consistencyScore >= 75) {
            score = 85 + Math.random() * 10;
            status = 'Excellent';
            summary = `Outstanding work ${member.full_name}! Your consistent saving pattern shows great financial discipline.`;
        } else if (consistencyScore >= 50) {
            score = 60 + Math.random() * 20;
            status = 'Good';
            summary = `Good progress ${member.full_name}! Try to save more consistently to improve your financial health.`;
        } else {
            score = 30 + Math.random() * 25;
            status = 'Needs Improvement';
            summary = `${member.full_name}, consider setting up a regular savings routine to build financial stability.`;
        }
        
        const health = {
            score: Math.round(score),
            status,
            summary,
            totalSavings: `$${totalSavings.toFixed(2)}`,
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
        
        let response = `Hi ${member.full_name}! I'm here to help with your Chama questions!`;
        
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('loan')) {
            if (activeLoan) {
                response = `You currently have an active loan of $${activeLoan.total_due}. Focus on repaying this before applying for new loans.`;
            } else if (totalSavings >= 100) {
                const maxLoan = totalSavings * 3;
                response = `Great news! With $${totalSavings.toFixed(2)} saved, you can borrow up to $${maxLoan.toFixed(2)} from ${member.group_name}.`;
            } else {
                response = `You need at least $100 in savings to qualify for loans. You currently have $${totalSavings.toFixed(2)}.`;
            }
        } else if (lowerQuestion.includes('withdraw')) {
            if (activeLoan) {
                response = `You can't withdraw while you have an active loan of $${activeLoan.total_due}. Please repay your loan first.`;
            } else {
                response = `You can request to withdraw from your $${totalSavings.toFixed(2)} savings. All withdrawal requests require admin approval in ${member.group_name}.`;
            }
        } else if (lowerQuestion.includes('save') || lowerQuestion.includes('contribution')) {
            response = `You've saved $${totalSavings.toFixed(2)} so far in ${member.group_name}. Keep up the regular contributions to improve your loan eligibility!`;
        } else if (lowerQuestion.includes('group') || lowerQuestion.includes('chama')) {
            response = `You're part of ${member.group_name}. Your group operates independently with its own rules and contribution amounts managed by your admin.`;
        } else if (lowerQuestion.includes('balance') || lowerQuestion.includes('total')) {
            response = `Your current balance in ${member.group_name} is $${totalSavings.toFixed(2)}.`;
        }
        
        res.json({ response });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// AI Financial Nudge endpoint
router.get('/financial-nudge', authenticateToken, async (req, res) => {
    try {
        const nudge = "Great job saving consistently! You're 15% ahead of your target this month.";
        res.json({ nudge });
    } catch (error) {
        console.error('Financial nudge error:', error);
        res.status(500).json({ error: 'Failed to get financial nudge' });
    }
});

// AI Loan Analysis endpoint
router.get('/loan-analysis', authenticateToken, async (req, res) => {
    try {
        const analysis = {
            eligibility: 'Qualified',
            maxAmount: 'KES 300,000',
            interestRate: '8.5%',
            recommendation: 'Based on your savings history, you qualify for premium rates.'
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
        const health = {
            score: 85,
            status: 'Excellent',
            summary: 'Your savings consistency is outstanding! Keep up the excellent work.',
            trends: 'Steady growth over the past 6 months'
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
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        let response = "I'm here to help with your Chama questions!";
        
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('loan')) {
            response = "Loans are available to members who have saved consistently for at least 3 months. You can borrow up to 3x your savings with an 8.5% monthly interest rate.";
        } else if (lowerQuestion.includes('withdraw')) {
            response = "Withdrawals are processed monthly. You can withdraw your contributions minus any penalties. Emergency withdrawals are available with admin approval.";
        } else if (lowerQuestion.includes('interest')) {
            response = "We offer 12% annual interest on your savings and charge 8.5% monthly interest on loans. Interest is calculated and added monthly.";
        } else if (lowerQuestion.includes('save') || lowerQuestion.includes('contribution')) {
            response = "Regular contributions help build your savings. The minimum monthly contribution varies by group. Consistent saving improves your loan eligibility.";
        }
        
        res.json({ response });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

module.exports = router;
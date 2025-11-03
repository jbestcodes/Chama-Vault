const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Member = require('../models/Member');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const Milestone = require('../models/Milestone');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// UPDATED AI Chat endpoint with REAL OpenAI
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
        const milestone = await Milestone.findOne({ member_id: memberId }).sort({ createdAt: -1 });

        // Create rich context for OpenAI
        const userContext = `
        User Profile:
        - Name: ${member.full_name}
        - Group: ${member.group_name}
        - Total Savings: KSh ${totalSavings.toLocaleString()}
        - Active Loan: ${activeLoan ? `KSh ${activeLoan.total_due.toLocaleString()}` : 'None'}
        - Current Milestone: ${milestone ? `${milestone.milestone_name} (Target: KSh ${milestone.target_amount.toLocaleString()})` : 'None set'}
        - Recent Savings Entries: ${savings.length}
        
        Chama Rules:
        - Minimum savings for loan eligibility: KSh 500
        - Maximum loan amount: 3x total savings
        - Currency: Kenyan Shillings (KSh)
        - Group-based savings and loans
        `;

        const systemPrompt = `You are a helpful financial advisor for a Kenyan Chama (table banking group). 
        You help members with savings, loans, and financial planning questions. 
        Always use KSh (Kenyan Shillings) for currency. 
        Be encouraging, practical, and give specific actionable advice.
        Answer in a friendly, supportive tone as if speaking to a friend.`;

        const userPrompt = `${userContext}\n\nUser Question: ${question}\n\nPlease provide a helpful, personalized response.`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", //  Cheapest option!
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 200, //  Reduced tokens = lower cost
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // Fallback to basic response if OpenAI fails
        let fallbackResponse = `Hi ${member?.full_name || 'there'}! I'm having trouble accessing my AI brain right now. `;
        
        const lowerQuestion = question.toLowerCase();
        if (lowerQuestion.includes('save') && lowerQuestion.includes('week')) {
            fallbackResponse += `For weekly savings planning, try dividing your target amount by 52 weeks. For KSh 10,000 per year, that's about KSh 192 per week!`;
        } else if (lowerQuestion.includes('loan')) {
            fallbackResponse += `For loan questions, remember you need at least KSh 500 in savings to qualify!`;
        } else {
            fallbackResponse += `Please try asking again, or contact your group admin for specific guidance.`;
        }
        
        res.json({ response: fallbackResponse });
    }
});

module.exports = router;
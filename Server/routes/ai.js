const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const openaiService = require('../services/openaiService');

// Get Financial Nudge
router.get('/financial-nudge', verifyToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Get member savings data
        const [memberStats] = await db.execute(`
            SELECT 
                COALESCE(SUM(s.amount), 0) as totalSavings,
                COUNT(DISTINCT s.week_number) as weeksActive,
                AVG(s.amount) as weeklyAverage,
                (SELECT COUNT(*) FROM savings s2 WHERE s2.member_id = ?) as totalEntries
            FROM savings s 
            WHERE s.member_id = ?
        `, [memberId, memberId]);

        // Get member rank
        const [rankData] = await db.execute(`
            SELECT member_rank, total_members FROM (
                SELECT 
                    member_id,
                    RANK() OVER (ORDER BY total_savings DESC) as member_rank,
                    COUNT(*) OVER() as total_members
                FROM (
                    SELECT member_id, COALESCE(SUM(amount), 0) as total_savings
                    FROM savings
                    GROUP BY member_id
                ) ranked_savings
            ) ranks
            WHERE member_id = ?
        `, [memberId]);

        const memberData = {
            totalSavings: memberStats[0]?.totalSavings || 0,
            weeklyAverage: memberStats[0]?.weeklyAverage || 0,
            missedWeeks: Math.max(0, 12 - (memberStats[0]?.weeksActive || 0)), // Assuming 12 weeks target
            rank: rankData[0]?.member_rank || 'N/A'
        };

        const nudge = await openaiService.generateFinancialNudge(memberData);

        res.json({
            success: true,
            nudge,
            memberStats: memberData
        });
    } catch (error) {
        console.error('Financial Nudge Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating financial nudge',
            nudge: 'Keep up the great work with your savings! Every contribution counts.'
        });
    }
});

// Get Loan Analysis
router.get('/loan-analysis', verifyToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Get comprehensive member data
        const [memberData] = await db.execute(`
            SELECT 
                u.username,
                u.created_at as join_date,
                COALESCE(SUM(s.amount), 0) as totalSavings,
                COUNT(DISTINCT s.week_number) as activeWeeks,
                DATEDIFF(NOW(), u.created_at) / 30 as membershipMonths,
                (CASE WHEN COUNT(DISTINCT s.week_number) > 0 
                      THEN (COUNT(DISTINCT s.week_number) / 12.0) * 100 
                      ELSE 0 END) as consistencyRate
            FROM users u
            LEFT JOIN savings s ON u.id = s.member_id
            WHERE u.id = ?
            GROUP BY u.id
        `, [memberId]);

        // Check for active loans (you might need to create a loans table)
        const hasActiveLoan = false; // Placeholder - implement based on your loan system

        const analysisData = {
            totalSavings: memberData[0]?.totalSavings || 0,
            consistencyRate: memberData[0]?.consistencyRate || 0,
            membershipMonths: memberData[0]?.membershipMonths || 0,
            hasActiveLoan
        };

        const loanAnalysis = await openaiService.analyzeLoanEligibility(analysisData);

        res.json({
            success: true,
            analysis: loanAnalysis,
            memberData: analysisData
        });
    } catch (error) {
        console.error('Loan Analysis Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error analyzing loan eligibility'
        });
    }
});

// Get Savings Health Insight
router.get('/savings-health', verifyToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        
        // Get member savings data
        const [memberStats] = await db.execute(`
            SELECT 
                COALESCE(SUM(s.amount), 0) as totalSavings,
                COUNT(DISTINCT s.week_number) as activeWeeks,
                AVG(s.amount) as weeklyAverage
            FROM savings s 
            WHERE s.member_id = ?
        `, [memberId]);

        // Get group statistics
        const [groupStats] = await db.execute(`
            SELECT 
                AVG(total_savings) as groupAverage,
                MAX(total_savings) as topSavings,
                COUNT(DISTINCT member_id) as totalMembers
            FROM (
                SELECT member_id, COALESCE(SUM(amount), 0) as total_savings
                FROM savings
                GROUP BY member_id
            ) member_totals
        `);

        // Get member rank
        const [rankData] = await db.execute(`
            SELECT member_rank FROM (
                SELECT 
                    member_id,
                    RANK() OVER (ORDER BY total_savings DESC) as member_rank
                FROM (
                    SELECT member_id, COALESCE(SUM(amount), 0) as total_savings
                    FROM savings
                    GROUP BY member_id
                ) ranked_savings
            ) ranks
            WHERE member_id = ?
        `, [memberId]);

        const memberData = {
            totalSavings: memberStats[0]?.totalSavings || 0,
            weeklyGoal: 100, // You can make this configurable
            achievementRate: ((memberStats[0]?.weeklyAverage || 0) / 100) * 100,
            rank: rankData[0]?.member_rank || 1
        };

        const groupData = {
            groupAverage: groupStats[0]?.groupAverage || 0,
            topSavings: groupStats[0]?.topSavings || 0,
            totalMembers: groupStats[0]?.totalMembers || 1
        };

        const healthInsight = await openaiService.generateSavingsHealthInsight(memberData, groupData);

        res.json({
            success: true,
            health: healthInsight,
            memberData,
            groupData
        });
    } catch (error) {
        console.error('Health Insight Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating health insights'
        });
    }
});

// Chatbot Endpoint
router.post('/chat', verifyToken, async (req, res) => {
    try {
        const { question, context } = req.body;
        
        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required'
            });
        }

        const response = await openaiService.chatbotResponse(question, context);

        res.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing your question'
        });
    }
});

module.exports = router;
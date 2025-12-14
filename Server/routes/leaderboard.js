const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Member = require('../models/Member');
const Savings = require('../models/Savings');
const Contribution = require('../models/Contribution');
const LoanRepayment = require('../models/LoanRepayment');

// Get group leaderboard with performance ratings
router.get('/leaderboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get current user's info
        const currentMember = await Member.findById(userId);
        if (!currentMember || !currentMember.group_id) {
            return res.status(404).json({ error: 'Member or group not found' });
        }

        // Get all members in the group (approved/active only)
        const members = await Member.find({
            group_id: currentMember.group_id,
            status: { $in: ['approved', 'active'] }
        }).select('_id full_name');

        // Get savings for all members
        const leaderboard = [];
        
        for (const member of members) {
            const savings = await Savings.find({ member_id: member._id });
            const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount || 0), 0);
            
            // Get contribution performance
            const contributions = await Contribution.find({ member_id: member._id });
            const contributionRatings = contributions.map(c => c.timing_rating).filter(r => r);
            
            // Get loan repayment performance
            const repayments = await LoanRepayment.find({ member_id: member._id });
            const repaymentRatings = repayments.map(r => r.timing_rating).filter(r => r);
            
            // Calculate combined rating
            const allRatings = [...contributionRatings, ...repaymentRatings];
            let overallRating = 'none';
            
            if (allRatings.length > 0) {
                const ratingCounts = {
                    excellent: allRatings.filter(r => r === 'excellent').length,
                    good: allRatings.filter(r => r === 'good').length,
                    fair: allRatings.filter(r => r === 'fair').length,
                    poor: allRatings.filter(r => r === 'poor').length
                };
                
                // Determine overall rating (weighted)
                if (ratingCounts.excellent >= allRatings.length * 0.7) overallRating = 'excellent';
                else if (ratingCounts.excellent + ratingCounts.good >= allRatings.length * 0.6) overallRating = 'good';
                else if (ratingCounts.poor >= allRatings.length * 0.5) overallRating = 'poor';
                else overallRating = 'fair';
            }
            
            // Mask name if not current user
            const displayName = member._id.toString() === userId.toString() 
                ? member.full_name 
                : member.full_name.substring(0, 1) + '***';
            
            leaderboard.push({
                id: member._id,
                name: displayName,
                totalSavings: totalSavings,
                rating: overallRating,
                isCurrentUser: member._id.toString() === userId.toString(),
                contributionCount: contributions.length,
                repaymentCount: repayments.length
            });
        }
        
        // Sort by total savings (descending)
        leaderboard.sort((a, b) => b.totalSavings - a.totalSavings);
        
        // Add rank
        leaderboard.forEach((member, index) => {
            member.rank = index + 1;
        });
        
        res.json({ 
            leaderboard,
            currentUser: {
                id: userId,
                name: currentMember.full_name
            }
        });
        
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

module.exports = router;

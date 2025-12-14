const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { checkLeaderboardTrialStatus } = require('../middleware/subscription');
const Member = require('../models/Member');
const Savings = require('../models/Savings');
const Milestone = require('../models/Milestone');
const Group = require('../models/Group');
const Invitation = require('../models/Invitation'); // New model for invitations

// Get all members in admin's group
router.get('/group', authenticateToken, isAdmin, async (req, res) => {
    try {
        const adminId = req.user.id;
        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        if (!groupId) {
            console.log('No group_id found for admin:', adminId);
            return res.status(400).json({ error: 'No group assigned.' });
        }

        console.log('Fetching members for group:', groupId);
        const members = await Member.find({ group_id: groupId })
            .select('_id full_name phone status created_at')
            .lean();
        
        // Add id field for frontend compatibility
        const membersWithId = members.map(m => ({
            ...m,
            id: m._id.toString()
        }));
        
        console.log('Found members:', membersWithId.length, '(pending:', membersWithId.filter(m => m.status === 'pending').length + ')');
        res.json({ members: membersWithId });
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add member to group
router.post('/add', authenticateToken, isAdmin, async (req, res) => {
    try {
        const adminId = req.user.id;
        const { full_name, phone } = req.body;
        
        if (!full_name || !phone) {
            return res.status(400).json({ error: 'Full name and phone required.' });
        }
        
        // Check if member already exists
        const existingMember = await Member.findOne({ phone });
        if (existingMember) {
            return res.status(400).json({ error: 'Member with this phone number already exists.' });
        }
        
        const admin = await Member.findById(adminId);
        const group = await Group.findById(admin.group_id);
        
        if (!group) return res.status(400).json({ error: 'No group assigned.' });

        // Create invitation
        const invitation = new Invitation({
            full_name,
            phone,
            group_id: admin.group_id,
            group_name: group.group_name,
            invited_by: adminId,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
        await invitation.save();
        
        // Generate invite link
        const inviteLink = `${process.env.FRONTEND_URL}/register?invite=${invitation._id}&group=${encodeURIComponent(group.group_name)}&phone=${phone}`;
        
        res.json({ 
            message: 'Invitation created successfully!',
            invite_link: inviteLink,
            instructions: 'Share this link with the member. They will be auto-approved when they register.',
            expires_in: '7 days'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Edit member
router.post('/edit', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_id, full_name, phone } = req.body;
        if (!member_id || !full_name || !phone) return res.status(400).json({ error: 'All fields required.' });

        await Member.findByIdAndUpdate(member_id, { full_name, phone });
        res.json({ message: 'Member updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove member
router.post('/remove', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_id } = req.body;
        if (!member_id) return res.status(400).json({ error: 'Member ID required.' });

        await Member.findByIdAndDelete(member_id);
        res.json({ message: 'Member removed.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Savings Matrix for Admin's Group
router.get('/matrix', authenticateToken, isAdmin, async (req, res) => {
    try {
        const adminId = req.user.id;
        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

        // Get all members in group
        const members = await Member.find(
            { group_id: groupId },
            { id: '$_id', full_name: 1, phone: 1 }
        ).sort({ full_name: 1 });

        // Get all distinct weeks for this group
        const memberIds = members.map(m => m._id);
        const weeks = await Savings.distinct('week_number', { member_id: { $in: memberIds } });
        weeks.sort((a, b) => a - b);

        // Get all savings for this group
        const savings = await Savings.find({ member_id: { $in: memberIds } });

        // Build matrix
        const matrix = {};
        weeks.forEach(week => { matrix[week] = {}; });
        savings.forEach(saving => {
            if (!matrix[saving.week_number]) matrix[saving.week_number] = {};
            matrix[saving.week_number][saving.member_id] = saving.amount;
        });

        // Calculate group total
        const groupTotal = savings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        res.json({
            members,
            weeks,
            matrix,
            groupTotal
        });
    } catch (err) {
        console.error("MATRIX ERROR:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user info
        const user = await Member.findById(userId);
        const groupId = user?.group_id;
        const groupName = user?.group_name;

        // Get group info to determine group type
        const group = await Group.findById(groupId);
        const groupType = group?.group_type || 'savings_and_loans';

        // Total savings for this user
        const userSavings = await Savings.find({ member_id: userId });
        const totalSavings = userSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        // Total members in group (only count active members)
        const memberCount = await Member.countDocuments({ 
            group_id: groupId, 
            status: 'active' 
        });

        // Total savings for all members in group
        const allMembers = await Member.find({ group_id: groupId, status: 'active' });
        const allMemberIds = allMembers.map(m => m._id);
        const allSavings = await Savings.find({ member_id: { $in: allMemberIds } });
        const totalSavingsAll = allSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        // User rank (by total savings in group)
        const memberSavings = {};
        allSavings.forEach(saving => {
            if (!memberSavings[saving.member_id]) memberSavings[saving.member_id] = 0;
            memberSavings[saving.member_id] += Number(saving.amount || 0);
        });
        
        const rankArray = Object.entries(memberSavings)
            .map(([memberId, total]) => ({ member_id: memberId, total }))
            .sort((a, b) => b.total - a.total);
        
        let userRank = null;
        rankArray.forEach((row, idx) => {
            if (row.member_id == userId) userRank = idx + 1;
        });

        // Last contribution
        const lastContribution = await Savings.findOne({ member_id: userId })
            .sort({ createdAt: -1 })
            .select({ amount: 1, createdAt: 1, _id: 0 });

        // Get total group savings (for admin only)
        let group_total_savings = null;
        if (req.user.role === 'admin') {
            group_total_savings = totalSavingsAll;
        }

        res.json({
            totalSavings,
            memberCount,
            totalSavingsAll,
            userRank,
            lastContribution: lastContribution ? { 
                amount: lastContribution.amount, 
                date: lastContribution.createdAt 
            } : null,
            group_name: groupName,
            group_total_savings,
            groupType: groupType
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add milestone for a member
router.post('/milestone', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        const { milestone_name, target_amount } = req.body;

        if (!milestone_name || !target_amount) {
            return res.status(400).json({ error: 'Milestone name and target amount are required.' });
        }
        if (Number(target_amount) <= 0) {
            return res.status(400).json({ error: 'Target amount must be a positive number.' });
        }

        // Check for duplicate milestone name for this user
        const existing = await Milestone.findOne({ member_id: memberId, milestone_name });
        if (existing) {
            return res.status(400).json({ error: 'You already have a milestone with this name.' });
        }

        const newMilestone = new Milestone({
            member_id: memberId,
            milestone_name,
            target_amount
        });
        await newMilestone.save();
        res.status(201).json({ message: 'Milestone created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get member milestones and progress
router.get('/milestone', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;

        // Get all milestones for the member
        const milestones = await Milestone.find({ member_id: memberId });

        // Get total savings for the member
        const userSavings = await Savings.find({ member_id: memberId });
        const total_savings = userSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        // Calculate progress for each milestone
        const milestonesWithProgress = milestones.map(milestone => ({
            id: milestone._id,
            milestone_name: milestone.milestone_name,
            target_amount: milestone.target_amount,
            progress: Math.min((total_savings / milestone.target_amount) * 100, 100),
            amount_saved: Math.min(total_savings, milestone.target_amount),
            amount_remaining: Math.max(milestone.target_amount - total_savings, 0)
        }));

        res.json({ milestones: milestonesWithProgress, total_savings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recommendation for member
router.get('/milestone/recommendation', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;

        // Get last month's savings
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

        const lastMonthSavings = await Savings.find({
            member_id: memberId,
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const last_month_savings = lastMonthSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        // Get active milestone
        const milestone = await Milestone.findOne({ member_id: memberId }).sort({ _id: -1 });

        // Get total savings
        const userSavings = await Savings.find({ member_id: memberId });
        const total_savings = userSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        // Get member's first name
        const user = await Member.findById(memberId);
        const firstName = user?.full_name?.split(" ")[0] || "";

        let recommendation = "No milestone set.";
        if (milestone) {
            const remaining = milestone.target_amount - total_savings;
            recommendation = `Hey ${firstName}, you have saved ${total_savings} so far. You need to save ${remaining > 0 ? remaining : 0} more to hit your "${milestone.milestone_name}" milestone.`;
        }

        res.json({ recommendation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a milestone (member only)
router.delete('/milestone/:id', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        const milestoneId = req.params.id;

        // Check if milestone exists and belongs to the user
        const milestone = await Milestone.findOne({ _id: milestoneId, member_id: memberId });
        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found or does not belong to you.' });
        }

        // Delete milestone
        await Milestone.findByIdAndDelete(milestoneId);
        res.json({ message: 'Milestone deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/my-profile', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;

        // Check leaderboard trial status
        const leaderboardTrial = await checkLeaderboardTrialStatus(memberId);
        
        // Get member info
        const user = await Member.findById(memberId);
        if (!user) {
            return res.status(404).json({ error: 'Profile not found.' });
        }

        // Get all members in the same group
        const groupMembers = await Member.find({ group_id: user.group_id });

        // Get savings for all group members
        const groupMemberIds = groupMembers.map(m => m._id);
        const allSavings = await Savings.find({ member_id: { $in: groupMemberIds } });

        // Calculate total savings per member
        const memberSavings = {};
        allSavings.forEach(saving => {
            if (!memberSavings[saving.member_id]) memberSavings[saving.member_id] = 0;
            memberSavings[saving.member_id] += Number(saving.amount || 0);
        });

        // Check if leaderboard access is available (trial or subscription)
        let leaderboard = [];
        let rank = null;
        let leaderboardAccess = false;

        if (leaderboardTrial.inTrial || user.has_active_subscription) {
            leaderboardAccess = true;
            
            // Create leaderboard
            const leaderboardData = groupMembers.map(member => ({
                id: member._id.toString(),
                full_name: member.full_name,
                total_savings: memberSavings[member._id] || 0
            })).sort((a, b) => b.total_savings - a.total_savings);

            // Mask names except for the logged-in user
            leaderboard = leaderboardData.map(row => ({
                name: row.id === memberId.toString() ? row.full_name : `${row.full_name.charAt(0)}****`,
                total_savings: Number(row.total_savings || 0)
            }));

            // Find user's rank in the group
            rank = leaderboardData.findIndex(row => row.id === memberId.toString()) + 1;
        }

        // Get user's savings history for graph
        const savingsHistory = await Savings.find({ member_id: memberId })
            .sort({ createdAt: 1 })
            .select({ _id: 1, amount: 1, createdAt: 1 });

        // Get total savings for the member
        const total_savings = memberSavings[memberId] || 0;

        // Calculate group_total_savings for admin only
        let group_total_savings = null;
        if (req.user.role === 'admin') {
            group_total_savings = Object.values(memberSavings).reduce((sum, amount) => sum + amount, 0);
        }

        res.json({
            full_name: user.full_name,
            phone: user.phone,
            group_name: user.group_name,
            rank,
            leaderboard,
            leaderboardAccess,
            leaderboardTrial: {
                inTrial: leaderboardTrial.inTrial,
                daysLeft: leaderboardTrial.daysLeft,
                message: leaderboardTrial.inTrial 
                    ? `🎉 You have ${leaderboardTrial.daysLeft} days left in your leaderboard trial!`
                    : leaderboardAccess 
                        ? 'Premium leaderboard access active'
                        : 'Subscribe to access the full leaderboard'
            },
            savingsHistory: savingsHistory.map(s => ({
                id: s._id,
                amount: s.amount,
                created_at: s.createdAt
            })),
            total_savings: Number(total_savings || 0),
            group_total_savings: group_total_savings !== null ? group_total_savings : "Hidden"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: Add savings for any member
router.post('/admin/add', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_id, week_number, amount } = req.body;
        if (!member_id || !week_number || !amount) {
            return res.status(400).json({ error: 'Member, week, and amount are required.' });
        }

        const newSavings = new Savings({
            member_id,
            week_number,
            amount
        });
        await newSavings.save();
        res.status(201).json({ message: 'Savings added successfully.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Savings for this member and week already exists.' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error adding savings.' });
    }
});

// Admin: Update savings for any member
router.post('/admin/update', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_id, week_number, amount } = req.body;
        if (!member_id || !week_number || !amount) {
            return res.status(400).json({ error: 'Member, week, and amount are required.' });
        }

        await Savings.findOneAndUpdate(
            { member_id, week_number },
            { amount }
        );
        res.status(200).json({ message: 'Savings updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating savings.' });
    }
});

// Admin: Delete savings for any member
router.post('/admin/delete', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_id, week_number } = req.body;
        if (!member_id || !week_number) {
            return res.status(400).json({ error: 'Member and week are required.' });
        }

        await Savings.findOneAndDelete({ member_id, week_number });
        res.status(200).json({ message: 'Savings deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting savings.' });
    }
});

module.exports = router;
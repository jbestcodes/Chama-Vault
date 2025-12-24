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

        // Find admin's group from group_memberships or fallback to old structure
        let groupId = null;
        const adminMembership = admin?.group_memberships?.find(m => m.is_admin);
        if (adminMembership) {
            groupId = adminMembership.group_id;
        } else if (admin?.group_id) {
            // Fallback to old structure
            groupId = admin.group_id;
        }

        if (!groupId) {
            console.log('No admin group found for admin:', adminId);
            return res.status(400).json({ error: 'No admin group assigned.' });
        }

        console.log('Fetching members for group:', groupId);
        
        // Query members using both old and new structures
        const members = await Member.find({
            $or: [
                { group_id: groupId }, // Old structure
                { 'group_memberships.group_id': groupId, 'group_memberships.status': 'approved' } // New structure
            ]
        })
            .select('_id full_name phone status created_at group_memberships')
            .lean();
        
        // Filter to ensure we only get approved members and handle mixed structures
        const approvedMembers = members.filter(member => {
            // If using new structure, check membership status
            if (member.group_memberships && member.group_memberships.length > 0) {
                const membership = member.group_memberships.find(m => m.group_id.toString() === groupId.toString());
                return membership && membership.status === 'approved';
            }
            // If using old structure, check status field
            return member.status === 'approved' || member.status === 'active';
        });
        
        // Add id field for frontend compatibility
        const membersWithId = approvedMembers.map(m => ({
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

        // Find admin's group from group_memberships or fallback to old structure
        let groupId = null;
        const adminMembership = admin?.group_memberships?.find(m => m.is_admin);
        if (adminMembership) {
            groupId = adminMembership.group_id;
        } else if (admin?.group_id) {
            // Fallback to old structure
            groupId = admin.group_id;
        }

        if (!groupId) return res.status(400).json({ error: 'No admin group assigned.' });

        // Get all registered members in group
        const members = await Member.find(
            { 'group_memberships.group_id': groupId, 'group_memberships.status': 'approved' },
            { id: '$_id', full_name: 1, phone: 1 }
        ).sort({ full_name: 1 });

        // Get all distinct weeks for this group (including non-members)
        const memberIds = members.map(m => m._id);
        
        // Get all savings for registered members
        const registeredSavings = await Savings.find({ 
            member_id: { $in: memberIds } 
        });
        
        // Get all savings for non-members in this group
        const nonMemberSavings = await Savings.find({ 
            is_non_member: true,
            group_id: groupId 
        });
        
        // Combine all savings
        const allSavings = [...registeredSavings, ...nonMemberSavings];
        
        // Get distinct weeks from all savings
        const weeks = [...new Set(allSavings.map(s => s.week_number))].sort((a, b) => a - b);

        // Create virtual member entries for non-members
        const nonMembers = [];
        const nonMemberMap = new Map();
        
        nonMemberSavings.forEach(saving => {
            if (!nonMemberMap.has(saving.member_id)) {
                nonMemberMap.set(saving.member_id, {
                    _id: saving.member_id,
                    id: saving.member_id,
                    full_name: saving.member_name + ' (Not Registered)',
                    phone: 'N/A',
                    is_non_member: true
                });
            }
        });
        
        nonMembers.push(...nonMemberMap.values());

        // Combine registered members and non-members
        const allMembers = [...members.map(m => ({
            _id: m._id,
            id: m._id,
            full_name: m.full_name,
            phone: m.phone,
            is_non_member: false
        })), ...nonMembers];

        // Build matrix (convert member_id to string for frontend lookup)
        const matrix = {};
        weeks.forEach(week => { matrix[week] = {}; });
        allSavings.forEach(saving => {
            if (!matrix[saving.week_number]) matrix[saving.week_number] = {};
            matrix[saving.week_number][saving.member_id.toString()] = saving.amount;
        });

        // Calculate group total (including non-members)
        const groupTotal = allSavings.reduce((sum, saving) => sum + Number(saving.amount || 0), 0);

        res.json({
            members: allMembers,
            weeks,
            matrix,
            groupTotal,
            registeredCount: members.length,
            nonMemberCount: nonMembers.length,
            totalMemberCount: allMembers.length
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

        // Total members in group (count approved and active members - 'active' is legacy)
        const memberCount = await Member.countDocuments({ 
            group_id: groupId, 
            status: { $in: ['approved', 'active'] }
        });

        // Total savings for all members in group
        const allMembers = await Member.find({ 
            group_id: groupId, 
            status: { $in: ['approved', 'active'] }
        });
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
        const { member_id, week_number, amount, non_member_name, non_member_phone, non_member_email } = req.body;
        
        // Allow admin to add savings for non-member (member not registered in app)
        if (non_member_name && !member_id) {
            if (!week_number || !amount) {
                return res.status(400).json({ error: 'Week number and amount are required for non-member savings.' });
            }
            
            const adminId = req.user.id;
            const admin = await Member.findById(adminId);
            const groupId = admin?.group_id;
            
            if (!groupId) {
                return res.status(400).json({ error: 'No group assigned.' });
            }
            
            // Create a virtual member ID using a special format for non-members
            // This allows tracking their savings without requiring app registration
            const virtualMemberId = `non-member-${groupId}-${non_member_name.toLowerCase().replace(/\s+/g, '-')}`;
            
            const newSavings = new Savings({
                member_id: virtualMemberId,
                week_number,
                amount,
                member_name: non_member_name, // Store the actual name
                is_non_member: true,
                group_id: groupId,
                non_member_phone: non_member_phone, // Store for future matching
                non_member_email: non_member_email  // Store for future matching
            });
            
            await newSavings.save();
            return res.status(201).json({ 
                message: `Savings added successfully for ${non_member_name}`,
                non_member: true
            });
        }
        
        // Regular member savings
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

// Get all non-members in group
router.get('/non-members', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Find admin's group from group_memberships or fallback to old structure
        let groupId = null;
        const adminMembership = admin?.group_memberships?.find(m => m.is_admin);
        if (adminMembership) {
            groupId = adminMembership.group_id;
        } else if (admin?.group_id) {
            // Fallback to old structure
            groupId = admin.group_id;
        }
        
        if (!groupId) {
            return res.status(400).json({ error: 'No admin group assigned.' });
        }

        // Get all non-member savings for this group
        const nonMemberSavings = await Savings.find({ 
            is_non_member: true,
            group_id: groupId 
        });

        // Extract unique non-members
        const nonMemberMap = new Map();
        nonMemberSavings.forEach(saving => {
            if (!nonMemberMap.has(saving.member_id)) {
                // Calculate total savings for this non-member
                const totalSavings = nonMemberSavings
                    .filter(s => s.member_id === saving.member_id)
                    .reduce((sum, s) => sum + Number(s.amount || 0), 0);
                
                nonMemberMap.set(saving.member_id, {
                    id: saving.member_id,
                    member_id: saving.member_id,
                    full_name: saving.member_name,
                    phone: saving.non_member_phone || 'Not provided',
                    email: saving.non_member_email || 'Not provided',
                    total_savings: totalSavings,
                    is_non_member: true
                });
            }
        });

        const nonMembers = Array.from(nonMemberMap.values());

        res.json({ 
            non_members: nonMembers,
            count: nonMembers.length
        });
    } catch (error) {
        console.error('Get non-members error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add non-member to group
router.post('/non-members/add', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { full_name, phone, week_number, amount } = req.body;
        const adminId = req.user.id;
        
        if (!full_name || full_name.trim() === '') {
            return res.status(400).json({ error: 'Full name is required.' });
        }

        const admin = await Member.findById(adminId);

        // Find admin's group from group_memberships or fallback to old structure
        let groupId = null;
        const adminMembership = admin?.group_memberships?.find(m => m.is_admin);
        if (adminMembership) {
            groupId = adminMembership.group_id;
        } else if (admin?.group_id) {
            // Fallback to old structure
            groupId = admin.group_id;
        }
        
        if (!groupId) {
            return res.status(400).json({ error: 'No admin group assigned.' });
        }

        // Create virtual member ID
        const virtualMemberId = `non-member-${groupId}-${full_name.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Check if non-member already exists
        const existingNonMember = await Savings.findOne({ 
            member_id: virtualMemberId,
            is_non_member: true 
        });
        
        if (existingNonMember) {
            return res.status(400).json({ error: 'This non-member already exists in your group.' });
        }

        // If amount and week_number provided, add the savings
        if (amount && week_number) {
            const newSaving = new Savings({
                member_id: virtualMemberId,
                group_id: groupId,
                amount: Number(amount),
                week_number: Number(week_number),
                is_non_member: true,
                member_name: full_name,
                non_member_phone: phone || null
            });
            
            await newSaving.save();
            
            res.json({ 
                message: `Savings of KSh ${amount} added successfully for non-member "${full_name}" in week ${week_number}.`,
                non_member: {
                    id: virtualMemberId,
                    member_id: virtualMemberId,
                    full_name: full_name,
                    is_non_member: true
                }
            });
        } else {
            res.json({ 
                message: `Non-member "${full_name}" added successfully. You can now add their savings.`,
                non_member: {
                    id: virtualMemberId,
                    member_id: virtualMemberId,
                    full_name: full_name,
                    is_non_member: true
                }
            });
        }
    } catch (error) {
        console.error('Add non-member error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove non-member and all their savings
router.post('/non-members/remove', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_id } = req.body;
        const adminId = req.user.id;
        
        if (!member_id) {
            return res.status(400).json({ error: 'Member ID is required.' });
        }

        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        
        if (!groupId) {
            return res.status(400).json({ error: 'No group assigned.' });
        }

        // Delete all savings for this non-member
        const result = await Savings.deleteMany({ 
            member_id: member_id,
            is_non_member: true,
            group_id: groupId 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Non-member not found or has no savings.' });
        }

        res.json({ 
            message: 'Non-member and all their savings removed successfully.',
            deleted_savings: result.deletedCount
        });
    } catch (error) {
        console.error('Remove non-member error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manually match non-member with registered member
router.post('/non-members/match', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { non_member_id, registered_member_id } = req.body;
        const adminId = req.user.id;
        
        if (!non_member_id || !registered_member_id) {
            return res.status(400).json({ error: 'Both non-member ID and registered member ID are required.' });
        }

        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        
        if (!groupId) {
            return res.status(400).json({ error: 'No group assigned.' });
        }

        // Verify registered member exists and is in the same group
        const registeredMember = await Member.findOne({ 
            _id: registered_member_id,
            group_id: groupId
        });

        if (!registeredMember) {
            return res.status(404).json({ error: 'Registered member not found in your group.' });
        }

        // Update all non-member savings to point to registered member
        const result = await Savings.updateMany(
            {
                member_id: non_member_id,
                is_non_member: true,
                group_id: groupId
            },
            {
                $set: {
                    matched_member_id: registered_member_id,
                    matched_at: new Date(),
                    member_id: registered_member_id,
                    is_non_member: false
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'No non-member savings found to match.' });
        }

        res.json({ 
            message: `Successfully matched ${result.modifiedCount} savings records to ${registeredMember.full_name}`,
            matched_savings: result.modifiedCount,
            member: {
                id: registeredMember._id,
                full_name: registeredMember.full_name,
                phone: registeredMember.phone,
                email: registeredMember.email
            }
        });
    } catch (error) {
        console.error('Match non-member error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get potential matches for a non-member
router.get('/non-members/:non_member_id/potential-matches', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { non_member_id } = req.params;
        const adminId = req.user.id;
        
        const admin = await Member.findById(adminId);
        const groupId = admin?.group_id;
        
        if (!groupId) {
            return res.status(400).json({ error: 'No group assigned.' });
        }

        // Get the non-member's info
        const nonMemberSaving = await Savings.findOne({ 
            member_id: non_member_id,
            is_non_member: true,
            group_id: groupId
        });

        if (!nonMemberSaving) {
            return res.status(404).json({ error: 'Non-member not found.' });
        }

        // Find potential matches by phone or email
        const potentialMatches = [];
        
        if (nonMemberSaving.non_member_phone) {
            const phoneMatches = await Member.find({ 
                phone: nonMemberSaving.non_member_phone,
                group_id: groupId
            }).select('_id full_name phone email');
            potentialMatches.push(...phoneMatches);
        }

        if (nonMemberSaving.non_member_email) {
            const emailMatches = await Member.find({ 
                email: nonMemberSaving.non_member_email,
                group_id: groupId
            }).select('_id full_name phone email');
            potentialMatches.push(...emailMatches);
        }

        // Remove duplicates
        const uniqueMatches = Array.from(
            new Map(potentialMatches.map(m => [m._id.toString(), m])).values()
        );

        res.json({ 
            non_member: {
                id: non_member_id,
                name: nonMemberSaving.member_name,
                phone: nonMemberSaving.non_member_phone,
                email: nonMemberSaving.non_member_email
            },
            potential_matches: uniqueMatches,
            count: uniqueMatches.length
        });
    } catch (error) {
        console.error('Get potential matches error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
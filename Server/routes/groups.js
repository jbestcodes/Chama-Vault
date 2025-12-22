const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth'); // ✅

const Group = require('../models/Group');
const Member = require('../models/Member'); 
const brevoEmailService = require('../services/brevoEmailService');

// Update group settings endpoint
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const { interest_rate, minimum_loan_savings } = req.body;
        
        // Find member's group
        const member = await Member.findById(req.user.id);
        
        if (!member || !member.group_id) {
            return res.status(404).json({ error: 'Member not in any group' });
        }
        
        const groupId = member.group_id;
        
        // Verify user is admin of this group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        if (group.admin_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only group admins can update settings' });
        }
        
        // Validate inputs
        if (interest_rate !== undefined && (interest_rate < 0 || interest_rate > 100)) {
            return res.status(400).json({ error: 'Interest rate must be between 0 and 100' });
        }
        
        if (minimum_loan_savings !== undefined && minimum_loan_savings < 0) {
            return res.status(400).json({ error: 'Minimum savings cannot be negative' });
        }
        
        // Update group settings
        const updateData = {};
        if (interest_rate !== undefined) updateData.interest_rate = interest_rate;
        if (minimum_loan_savings !== undefined) updateData.minimum_loan_savings = minimum_loan_savings;
        
        await Group.findByIdAndUpdate(groupId, updateData);
        
        res.json({ 
            message: 'Group settings updated successfully',
            interest_rate: interest_rate,
            minimum_loan_savings: minimum_loan_savings
        });
        
    } catch (error) {
        console.error('Update group settings error:', error);
        res.status(500).json({ error: 'Failed to update group settings' });
    }
});

// Get group settings endpoint
router.get('/settings', authenticateToken, async (req, res) => {
    try {
        // Find member's group
        const member = await Member.findById(req.user.id);
        
        if (!member || !member.group_id) {
            return res.status(404).json({ error: 'Member not in any group' });
        }
        
        const groupId = member.group_id;
        
        const group = await Group.findById(groupId).select('interest_rate minimum_loan_savings');
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        res.json({
            interest_rate: group.interest_rate || 5.0,
            minimum_loan_savings: group.minimum_loan_savings || 500.00
        });
        
    } catch (error) {
        console.error('Get group settings error:', error);
        res.status(500).json({ error: 'Failed to fetch group settings' });
    }
});

// Get pending members
router.get('/pending-members', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const pendingMembers = await Member.find({ 
            group_id: member.group_id, 
            status: 'pending' 
        }).select('full_name phone created_at');

        res.json({ pending_members: pendingMembers });
    } catch (error) {
        console.error('Error fetching pending members:', error);
        res.status(500).json({ error: 'Failed to fetch pending members' });
    }
});

// Approve member
router.put('/approve-member/:memberId', authenticateToken, async (req, res) => {
    try {
        const adminMember = await Member.findById(req.user.id);
        if (!adminMember || !adminMember.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const targetMember = await Member.findById(req.params.memberId);
        if (!targetMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (targetMember.group_id.toString() !== adminMember.group_id.toString()) {
            return res.status(403).json({ error: 'Can only approve members in your group' });
        }

        targetMember.status = 'approved';
        await targetMember.save();

        // Send approval email
        if (targetMember.email && targetMember.email_verified) {
            const group = await Group.findById(targetMember.group_id);
            try {
                await brevoEmailService.sendAccountApprovalEmail(
                    targetMember.email,
                    targetMember.full_name,
                    group ? group.group_name : 'your group'
                );
            } catch (emailError) {
                console.error('Error sending approval email:', emailError);
            }
        }

        res.json({ 
            message: 'Member approved successfully',
            member_name: targetMember.full_name
        });

    } catch (error) {
        console.error('Error approving member:', error);
        res.status(500).json({ error: 'Failed to approve member' });
    }
});

// Reject member
router.put('/reject-member/:memberId', authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const adminMember = await Member.findById(req.user.id);
        if (!adminMember || !adminMember.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const targetMember = await Member.findById(req.params.memberId);
        if (!targetMember) {
            return res.status(404).json({ error: 'Member not found' });
        }

        targetMember.status = 'denied';
        if (reason) targetMember.rejection_reason = reason;
        await targetMember.save();

        res.json({ 
            message: 'Member rejected',
            member_name: targetMember.full_name
        });

    } catch (error) {
        console.error('Error rejecting member:', error);
        res.status(500).json({ error: 'Failed to reject member' });
    }
});

module.exports = router;
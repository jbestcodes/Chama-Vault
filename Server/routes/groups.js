const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth'); // ✅

const Group = require('../models/Group');
const Member = require('../models/Member'); 
const brevoEmailService = require('../services/brevoEmailService');

// List all members in the admin's group (including admin)
router.get('/members', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member || !member.group_id) {
            return res.status(403).json({ error: 'Not in a group' });
        }
        const members = await Member.find({ group_id: member.group_id }).select('full_name phone email status is_admin createdAt');
        res.json({ members });
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ error: 'Failed to fetch group members' });
    }
});

// Admin: Delete a member from the group
router.delete('/member/:memberId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const admin = await Member.findById(req.user.id);
        const target = await Member.findById(req.params.memberId);
        if (!admin || !admin.is_admin) return res.status(403).json({ error: 'Admin access required' });
        if (!target) return res.status(404).json({ error: 'Member not found' });
        if (String(target.group_id) !== String(admin.group_id)) return res.status(403).json({ error: 'Can only delete members in your group' });
        if (String(target._id) === String(admin._id)) return res.status(400).json({ error: 'Admin cannot delete themselves' });
        await target.deleteOne();
        res.json({ message: 'Member deleted' });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

// Update group settings endpoint
router.put('/settings', authenticateToken, async (req, res) => {
    try {
        const { interest_rate, minimum_loan_savings, contribution_settings, account_type, account_number } = req.body;
        
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
        
        // Validate contribution_settings
        if (contribution_settings) {
            if (contribution_settings.amount !== undefined && contribution_settings.amount < 0) {
                return res.status(400).json({ error: 'Contribution amount cannot be negative' });
            }
            if (contribution_settings.frequency && !['weekly', 'monthly'].includes(contribution_settings.frequency)) {
                return res.status(400).json({ error: 'Frequency must be weekly or monthly' });
            }
            if (contribution_settings.due_day !== undefined) {
                if (contribution_settings.frequency === 'weekly' && (contribution_settings.due_day < 1 || contribution_settings.due_day > 7)) {
                    return res.status(400).json({ error: 'For weekly, due_day must be 1-7 (Monday-Sunday)' });
                }
                if (contribution_settings.frequency === 'monthly' && (contribution_settings.due_day < 1 || contribution_settings.due_day > 31)) {
                    return res.status(400).json({ error: 'For monthly, due_day must be 1-31' });
                }
            }
        }
        
        // Update group settings
        const updateData = {};
        if (interest_rate !== undefined) updateData.interest_rate = interest_rate;
        if (minimum_loan_savings !== undefined) updateData.minimum_loan_savings = minimum_loan_savings;
        if (contribution_settings) updateData.contribution_settings = contribution_settings;
        if (account_type !== undefined) updateData.account_type = account_type;
        if (account_number !== undefined) updateData.account_number = account_number;

        await Group.findByIdAndUpdate(groupId, updateData);

        res.json({ 
            message: 'Group settings updated successfully',
            interest_rate: interest_rate,
            minimum_loan_savings: minimum_loan_savings,
            contribution_settings: contribution_settings,
            account_type: account_type,
            account_number: account_number
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
        
        const group = await Group.findById(groupId).select('interest_rate minimum_loan_savings contribution_settings account_type account_number');
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        res.json({
            interest_rate: group.interest_rate || 5.0,
            minimum_loan_savings: group.minimum_loan_savings || 500.00,
            contribution_settings: group.contribution_settings || {
                amount: 1000,
                frequency: 'monthly',
                due_day: 1,
                reminder_days_before: 1,
                penalty_amount: 0,
                grace_period_days: 0,
                auto_reminders: true
            },
            account_type: group.account_type || '',
            account_number: group.account_number || ''
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
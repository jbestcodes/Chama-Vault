const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Group = require('../models/Group');
const Invitation = require('../models/Invitation');
const brevoEmailService = require('../services/brevoEmailService');
const { authenticateToken } = require('../middleware/auth');
const { requireGroupInvite } = require('../middleware/subscription');

// Generate unique invite code
const generateInviteCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Send group invitation via email (any member can invite)
router.post('/send-invite', authenticateToken, async (req, res) => {
    try {
        const { email, recipientName } = req.body;
        
        if (!email || !recipientName) {
            return res.status(400).json({ error: 'Email and recipient name are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const inviter = await Member.findById(req.user.id).populate('group_id');
        if (!inviter || !inviter.group_id) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is already a member
        const existingMember = await Member.findOne({ email: email.toLowerCase() });
        if (existingMember) {
            return res.status(400).json({ error: 'This person is already registered on Jaza Nyumba' });
        }

        // Check for existing pending invitation
        const existingInvite = await Invitation.findOne({
            email: email.toLowerCase(),
            group_id: inviter.group_id._id,
            status: 'pending'
        });

        if (existingInvite) {
            return res.status(400).json({ error: 'An invitation has already been sent to this email address' });
        }

        // Generate invite code
        const inviteCode = generateInviteCode();

        // Create invitation
        const invitation = new Invitation({
            group_id: inviter.group_id._id,
            invited_by: inviter._id,
            email: email.toLowerCase(),
            recipient_name: recipientName,
            invite_code: inviteCode,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        await invitation.save();

        // Generate invitation link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/register?inviteCode=${inviteCode}&email=${encodeURIComponent(email)}&groupName=${encodeURIComponent(inviter.group_id.group_name)}`;

        // Send email invitation
        try {
            await brevoEmailService.sendGroupInvitationEmail(
                email,
                recipientName,
                inviter.group_id.group_name,
                inviteCode,
                inviter.full_name,
                inviteLink
            );

            res.json({
                message: 'Invitation sent successfully via email',
                inviteCode: inviteCode,
                expiresAt: invitation.expires_at,
                inviteLink: inviteLink
            });
        } catch (emailError) {
            // Delete the invitation if email failed to send
            await Invitation.findByIdAndDelete(invitation._id);
            res.status(500).json({ error: 'Failed to send invitation email' });
        }

    } catch (error) {
        console.error('Send invite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sent invitations
router.get('/my-invites', authenticateToken, async (req, res) => {
    try {
        const invitations = await Invitation.find({ 
            invited_by: req.user.id 
        }).sort({ created_at: -1 });

        res.json({ invitations });

    } catch (error) {
        console.error('Get invites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel invitation
router.delete('/cancel-invite/:inviteId', authenticateToken, async (req, res) => {
    try {
        const { inviteId } = req.params;
        
        const invitation = await Invitation.findOne({
            _id: inviteId,
            invited_by: req.user.id,
            status: 'pending'
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found or already processed' });
        }

        invitation.status = 'cancelled';
        await invitation.save();

        res.json({ message: 'Invitation cancelled successfully' });

    } catch (error) {
        console.error('Cancel invite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify invite code (used during registration)
router.post('/verify-invite', async (req, res) => {
    try {
        const { inviteCode, email } = req.body;
        
        if (!inviteCode) {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        // If email is provided, match both; otherwise just match code
        const query = {
            invite_code: inviteCode.toUpperCase(),
            status: 'pending',
            expires_at: { $gt: new Date() }
        };
        
        if (email) {
            query.email = email.toLowerCase();
        }

        const invitation = await Invitation.findOne(query).populate('group_id');

        if (!invitation) {
            return res.status(404).json({ error: 'Invalid or expired invitation code' });
        }

        res.json({
            valid: true,
            groupName: invitation.group_id.group_name,
            inviterName: invitation.invited_by?.full_name,
            expiresAt: invitation.expires_at
        });

    } catch (error) {
        console.error('Verify invite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get group's invitation stats (admin only)
router.get('/group-stats', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const stats = await Invitation.aggregate([
            { $match: { group_id: member.group_id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            pending: 0,
            accepted: 0,
            cancelled: 0,
            expired: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
        });

        res.json({ stats: formattedStats });

    } catch (error) {
        console.error('Group stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
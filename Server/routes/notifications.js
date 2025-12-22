const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const brevoEmailService = require('../services/brevoEmailService');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Admin approve member
router.post('/approve-member/:memberId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { memberId } = req.params;
        const member = await Member.findById(memberId);
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (member.status !== 'pending') {
            return res.status(400).json({ error: 'Member is not pending approval' });
        }

        // Approve member
        member.status = 'approved';
        await member.save();

        // Send approval email
        if (member.email && member.email_verified) {
            const group = await Group.findById(member.group_id);
            await brevoEmailService.sendAccountApprovalEmail(
                member.email,
                member.full_name, 
                group ? group.group_name : 'your group'
            );
        }

        res.json({ message: 'Member approved and notified via email' });

    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin approve loan
router.post('/approve-loan/:loanId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { loanId } = req.params;
        const loan = await Loan.findById(loanId).populate('member_id');
        
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.status !== 'pending') {
            return res.status(400).json({ error: 'Loan is not pending approval' });
        }

        // Approve loan
        loan.status = 'approved';
        loan.approved_date = new Date();
        await loan.save();

        // Send approval email
        if (loan.member_id.email && loan.member_id.email_verified) {
            const group = await Group.findById(loan.member_id.group_id);
            try {
                await brevoEmailService.sendLoanApprovalEmail(
                    loan.member_id.email,
                    loan.member_id.full_name,
                    loan.amount,
                    loan.interest_rate,
                    group ? group.group_name : 'your group'
                );
            } catch (emailError) {
                console.error('Error sending loan approval email:', emailError);
            }
        }

        res.json({ message: 'Loan approved and member notified via email' });

    } catch (error) {
        console.error('Loan approval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin deny loan
router.post('/deny-loan/:loanId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { loanId } = req.params;
        const { reason } = req.body;
        
        const loan = await Loan.findById(loanId).populate('member_id');
        
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.status !== 'pending') {
            return res.status(400).json({ error: 'Loan is not pending approval' });
        }

        // Deny loan
        loan.status = 'denied';
        loan.denial_reason = reason;
        await loan.save();

        // Send denial email
        if (loan.member_id.email && loan.member_id.email_verified) {
            const group = await Group.findById(loan.member_id.group_id);
            try {
                await brevoEmailService.sendLoanDenialEmail(
                    loan.member_id.email,
                    loan.member_id.full_name,
                    reason || 'Contact admin for details',
                    group ? group.group_name : 'your group'
                );
            } catch (emailError) {
                console.error('Error sending loan denial email:', emailError);
            }
        }

        res.json({ message: 'Loan denied and member notified via email' });

    } catch (error) {
        console.error('Loan denial error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update group contribution settings
router.put('/group-settings/:groupId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { contribution_settings } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Update contribution settings
        if (contribution_settings) {
            group.contribution_settings = { ...group.contribution_settings, ...contribution_settings };
        }

        await group.save();

        res.json({ 
            message: 'Group settings updated successfully',
            settings: group.contribution_settings 
        });

    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send bulk SMS to group members
router.post('/send-group-message/:groupId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get all approved members in the group
        const members = await Member.find({ 
            group_id: groupId, 
            status: 'approved',
            email_verified: true 
        });

        const group = await Group.findById(groupId);
        const emails = members.filter(m => m.email).map(member => member.email);
        
        // Send bulk emails
        const results = await brevoEmailService.sendBulkGroupMessage(
            emails,
            message,
            group ? group.group_name : 'your group',
            members.map(m => m.full_name)
        );

        res.json({ 
            message: 'Bulk email sent',
            sent_to: emails.length,
            results 
        });

    } catch (error) {
        console.error('Bulk SMS error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get SMS notification preferences
router.get('/sms-preferences', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ preferences: member.sms_notifications });

    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update SMS notification preferences
router.put('/sms-preferences', authenticateToken, async (req, res) => {
    try {
        const { sms_notifications } = req.body;
        
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        member.sms_notifications = { ...member.sms_notifications, ...sms_notifications };
        await member.save();

        res.json({ 
            message: 'SMS preferences updated',
            preferences: member.sms_notifications 
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Milestone = require('../models/Milestone');
const Invitation = require('../models/Invitation');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const jwtSecret = process.env.JWT_SECRET;

// Add this at the top of your routes
if (!jwtSecret) {
    console.error('❌ JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

// Update auth.js registration with better normalization
const normalizeGroupName = (name) => {
    return name
        .trim()                    // Remove spaces
        .toLowerCase()             // Convert to lowercase
        .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
        .replace(/[^\w\s]/g, ''); // Remove special characters except spaces
};

// Register route
router.post('/register', async (req, res) => {
    const { full_name, phone, password, group_name, invite_code, role } = req.body;
    const useRole = role && role.toLowerCase() === 'admin' ? 'admin' : 'member';

    if (!full_name || !phone || !password || !group_name) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const normalizedGroupName = group_name.trim().toLowerCase();

        // Check if member already exists
        const existingMember = await Member.findOne({ phone });
        if (existingMember) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        // Find or create group
        let group = await Group.findOne({ group_name: normalizedGroupName });
        
        if (!group) {
            if (useRole !== 'admin') {
                return res.status(400).json({ error: 'Group does not exist. Only admins can create groups.' });
            }
            
            // Admin creates new group
            group = new Group({ 
                group_name: normalizedGroupName,
                interest_rate: 5.0,
                minimum_loan_savings: 500.00
            });
            await group.save();
        }

        // Determine status based on role and invite
        let status = 'pending'; // Default: needs approval
        
        if (useRole === 'admin') {
            status = 'approved'; // Admins auto-approved
        } else if (invite_code) {
            // Check if valid invitation exists
            const invitation = await Invitation.findOne({ 
                group_id: group._id, 
                phone: phone,
                status: 'pending',
                expires_at: { $gt: new Date() }
            });
            
            if (invitation) {
                status = 'approved'; // Invited members auto-approved
                invitation.status = 'accepted';
                await invitation.save();
            }
        }

        // Create member
        const hashedPassword = await bcrypt.hash(password, 10);
        const newMember = new Member({
            full_name,
            phone,
            password: hashedPassword,
            group_id: group._id,
            role: useRole,
            is_admin: useRole === 'admin',
            status: status
        });

        await newMember.save();

        // Update group admin if this is admin
        if (useRole === 'admin') {
            await Group.findByIdAndUpdate(group._id, { admin_id: newMember._id });
        }

        res.status(201).json({ 
            message: status === 'approved' ? 'Registration successful!' : 'Registration submitted. Awaiting admin approval.',
            status: status
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password are required' });
    }

    try {
        const member = await Member.findOne({ phone });
        if (!member) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check member status
        if (member.status === 'denied') {
            return res.status(403).json({ 
                error: 'Your membership was denied. Please contact admin or apply to a different group.',
                rejection_reason: member.rejection_reason
            });
        }

        if (member.status === 'pending') {
            return res.status(403).json({ error: 'Your membership is still pending admin approval.' });
        }

        const isValidPassword = await bcrypt.compare(password, member.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token for approved members only
        const token = jwt.sign(
            { id: member._id, phone: member.phone, is_admin: member.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            member: {
                id: member._id,
                full_name: member.full_name,
                phone: member.phone,
                role: member.role,
                is_admin: member.is_admin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin login
router.post('/admin/login', async (req, res) => {
    const { phone, password } = req.body;
    
    try {
        const admin = await Member.findOne({ phone, is_admin: true });
        if (!admin) {
            return res.status(401).json({ error: 'Admin not found or not authorized' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        const payload = { id: admin._id, full_name: admin.full_name, is_admin: true, role: admin.role };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        
        return res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                full_name: admin.full_name,
                is_admin: true,
                role: admin.role
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
    const { phone } = req.body;
    
    try {
        const user = await Member.findOne({ phone });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        res.json({ message: 'Password reset link generated', resetLink });
    } catch (error) {
        res.status(500).json({ message: `Error generating reset link` });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await Member.findOneAndUpdate(
            { phone: decoded.phone },
            { password: hashedPassword }
        );
        
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Invalid or expired token' });
    }
});

// Update member profile
router.put('/update-profile', authenticateToken, async (req, res) => {
    const memberId = req.user.id;
    const { full_name, phone } = req.body;
    
    try {
        await Member.findByIdAndUpdate(memberId, { full_name, phone });
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile.' });
    }
});

// Update milestone
router.put('/milestone/:id', authenticateToken, async (req, res) => {
    const memberId = req.user.id;
    const milestoneId = req.params.id;
    const { milestone_name, target_amount } = req.body;
    
    try {
        await Milestone.findOneAndUpdate(
            { _id: milestoneId, member_id: memberId },
            { milestone_name, target_amount }
        );
        res.json({ message: 'Milestone updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating milestone.' });
    }
});

// Approve member
router.post('/approve-member', authenticateToken, async (req, res) => {
    const { member_id } = req.body;
    
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    
    try {
        await Member.findByIdAndUpdate(member_id, { status: 'approved' });
        res.json({ message: 'Member approved.' });
    } catch (error) {
        res.status(500).json({ error: 'Error approving member.' });
    }
});

// Deny member
router.post('/deny-member', authenticateToken, async (req, res) => {
    const { member_id } = req.body;
    
    try {
        await Member.findByIdAndDelete(member_id);
        res.json({ message: 'Member denied and removed.' });
    } catch (error) {
        res.status(500).json({ error: 'Error denying member.' });
    }
});

// Get SMS preferences
router.get('/members/sms-preferences', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        res.json({ 
            smsPreferences: member.sms_preferences || {
                contribution_reminders: true,
                loan_updates: true,
                repayment_reminders: true,
                group_updates: true,
                account_updates: true
            }
        });
    } catch (error) {
        console.error('Error fetching SMS preferences:', error);
        res.status(500).json({ error: 'Failed to fetch SMS preferences' });
    }
});

// Update SMS preferences
router.put('/members/sms-preferences', authenticateToken, async (req, res) => {
    try {
        const { smsPreferences } = req.body;
        
        if (!smsPreferences || typeof smsPreferences !== 'object') {
            return res.status(400).json({ error: 'Invalid SMS preferences data' });
        }
        
        const member = await Member.findById(req.user.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Update SMS preferences
        member.sms_preferences = {
            ...member.sms_preferences,
            ...smsPreferences,
            account_updates: true // Always keep account updates enabled for security
        };
        
        await member.save();
        
        res.json({ 
            message: 'SMS preferences updated successfully',
            smsPreferences: member.sms_preferences
        });
    } catch (error) {
        console.error('Error updating SMS preferences:', error);
        res.status(500).json({ error: 'Failed to update SMS preferences' });
    }
});

// Delete member
router.delete('/delete-member/:id', authenticateToken, async (req, res) => {
    const memberId = req.params.id;
    
    if (req.user.id == memberId) {
        return res.status(400).json({ error: "You cannot delete your own admin account." });
    }
    
    try {
        await Member.findByIdAndDelete(memberId);
        res.json({ message: 'Member deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting member.' });
    }
});

module.exports = router;
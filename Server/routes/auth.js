require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const Group = require('../models/Group');
const Milestone = require('../models/Milestone');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const jwtSecret = process.env.JWT_SECRET;

// Add this at the top of your routes
if (!jwtSecret) {
    console.error('❌ JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

// Register route
router.post('/register', async (req, res) => {
    const { full_name, phone, password, group_name, role } = req.body;
    const useRole = role && role.toLowerCase() === 'admin' ? 'admin' : 'member';

    if (!full_name || !phone || !password || !group_name) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const normalizedGroupName = group_name.trim().toLowerCase();

        // Find or create group
        let group = await Group.findOne({ group_name: normalizedGroupName });
        if (!group) {
            group = new Group({ group_name: normalizedGroupName });
            await group.save();
        }

        // Check if admin already exists for this group
        if (useRole === 'admin') {
            const existingAdmin = await Member.findOne({ role: 'admin', group_id: group._id });
            if (existingAdmin) {
                return res.status(400).json({ error: 'Group already has an admin' });
            }
        }

        // Check if phone already exists
        const existingMember = await Member.findOne({ phone });
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingMember) {
            // If admin pre-added them (no password yet)
            if (!existingMember.password) {
                existingMember.password = hashedPassword;
                existingMember.status = 'approved'; // Auto-approve admin-added members
                await existingMember.save();
                return res.status(201).json({ message: 'Registration successful. You can now login.' });
            } else {
                // Member already has password (duplicate registration)
                return res.status(400).json({ error: 'Account already exists. Please login.' });
            }
        } else {
            const newMember = new Member({
                full_name,
                phone,
                password: hashedPassword,
                group_id: group._id,
                group_name: normalizedGroupName,
                role: useRole,
                status: useRole === 'admin' ? 'approved' : 'pending',
                is_admin: useRole === 'admin'
            });
            await newMember.save();
            return res.status(201).json({ message: 'Registration successful.' });
        }
    } catch (error) {
        console.error('Error registering member:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }

    try {
        const member = await Member.findOne({ phone });
        
        // Check if member exists
        if (!member) {
            return res.status(401).json({ error: 'Account does not exist. Please register first.' });
        }
        
        // Check if account is approved
        if (member.status !== 'approved') {
            return res.status(401).json({ error: 'Account not approved yet. Please wait for admin approval.' });
        }

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        const token = jwt.sign(
            {
                id: member._id,
                phone: member.phone,
                is_admin: member.is_admin,
                role: member.role,
                group_id: member.group_id 
            },
            jwtSecret,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            role: member.role,
            full_name: member.full_name,
            group_id: member.group_id 
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
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
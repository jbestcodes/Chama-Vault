require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET; // get JWT secret from environment variables

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
}

// Register route
router.post('/register', async (req, res) => {
    const db = req.db; 
    const { full_name, phone, password, group_name, role } = req.body;
    const useRole = role && role.toLowerCase() === 'admin' ? 'admin' : 'member';

    // Check required fields
    if (!full_name || !phone || !password || !group_name) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const normalizedGroupName = group_name.trim().toLowerCase();

        const [groupRows] = await db.execute(
            'SELECT group_id FROM savings_groups WHERE LOWER(TRIM(group_name)) = ?',
            [normalizedGroupName]
        );
        let group_id;
        if (groupRows.length === 0) {
            // Insert new group
            const [result] = await db.execute(
                'INSERT INTO savings_groups (group_name) VALUES (?)',
                [normalizedGroupName]
            );
            group_id = result.insertId;
        } else {
            group_id = groupRows[0].group_id;
        }

        // Check if admin already exists for this group
        if (useRole === 'admin') {
            const [existingAdmin] = await db.execute(
                'SELECT * FROM members WHERE role = ? AND group_id = ?',
                ['admin', group_id]
            );
            if (existingAdmin.length > 0) {
                return res.status(400).json({ error: 'Group already has an admin' });
            }
        }

        // Check if phone already exists
        const [existingMember] = await db.execute(
            'SELECT * FROM members WHERE phone = ?',
            [phone]
        );

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        if (existingMember.length > 0) {
            await db.execute(
                'UPDATE members SET password = ?, status = ? WHERE phone = ?',
                [hashedPassword, 'approved', phone] // <-- now 'approved'
            );
            return res.status(201).json({ message: 'Registration successful.' });
        } else {
            await db.execute(
                'INSERT INTO members (full_name, phone, password, group_id, group_name, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [full_name, phone, hashedPassword, group_id, normalizedGroupName, useRole, useRole === 'admin' ? 'approved' : 'pending']
            );
            return res.status(201).json({ message: 'Registration successful.' });
        }
    } catch (error) {
        console.error('Error registering member:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const db = req.db;
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }
    try {
        const [results] = await db.execute(
            'SELECT * FROM members WHERE phone = ?',
            [phone]
        );
        if (results.length === 0 || results[0].status !== 'approved') {
            return res.status(401).json({ error: 'Account not approved yet.' });
        }
        const member = results[0];

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        const token = jwt.sign(
            { id: member.id, phone: member.phone, is_admin: member.is_admin, role: member.role },
            jwtSecret,
            { expiresIn: '1h' }
        );
        // Add role to the response here
        return res.status(200).json({ message: 'Login successful', token, role: member.role });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Admin login
router.post('/admin/login', async (req, res) => {
    const { phone, password } = req.body;
    const db = req.db; // get the database connection from the request
    try {
        const [rows] = await db.execute(
            'SELECT * FROM members WHERE phone = ? AND is_admin = 1',
            [phone]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Admin not found or not authorized' });
        }
        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }
        const payload = { id: admin.id, full_name: admin.full_name, is_admin: true, role: admin.role };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        return res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin.id,
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

//Request password reset
router.post('/request-password-reset', async (req, res) => {
    const db = req.db;
    const { phone } = req.body;
    try {
        const [userRows] = await db.execute('SELECT * FROM members WHERE phone = ?', [phone]);
        const user = userRows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Send reset link via sms or email (for now, just return it)
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        res.json({ message: 'Password reset link generated', resetLink });
    } catch (error) {
        res.status(500).json({ message: `Error generating reset link` });
    }
});

//Reset password
router.post('/reset-password/:token', async (req, res) => {
    const db = req.db;
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute(
            'UPDATE members SET password = ? WHERE phone = ?',
            [hashedPassword, decoded.phone]
        );
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Invalid or expired token' });
    }
});

// Update member profile
router.put('/update-profile', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;
    const { full_name, phone } = req.body;
    try {
        await db.execute(
            'UPDATE members SET full_name = ?, phone = ? WHERE id = ?',
            [full_name, phone, memberId]
        );
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile.' });
    }
});

// Update milestone
router.put('/milestone/:id', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;
    const milestoneId = req.params.id;
    const { milestone_name, target_amount } = req.body;
    try {
        await db.execute(
            'UPDATE milestones SET milestone_name = ?, target_amount = ? WHERE id = ? AND member_id = ?',
            [milestone_name, target_amount, milestoneId, memberId]
        );
        res.json({ message: 'Milestone updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating milestone.' });
    }
});

// Approve member
router.post('/approve-member', authenticateToken, async (req, res) => {
    const db = req.db;
    const { member_id } = req.body;
    // Only admin can approve
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await db.execute('UPDATE members SET status = ? WHERE id = ?', ['approved', member_id]);
    res.json({ message: 'Member approved.' });
});

// Deny member
router.post('/deny-member', authenticateToken, async (req, res) => {
    const db = req.db;
    const { member_id } = req.body;
    try {
        // Delete the member from the database
        await db.execute('DELETE FROM members WHERE id = ?', [member_id]);
        res.json({ message: 'Member denied and removed.' });
    } catch (error) {
        res.status(500).json({ error: 'Error denying member.' });
    }
});

// Delete member
router.delete('/delete-member/:id', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.params.id;
    // Prevent admin from deleting themselves
    if (req.user.id == memberId) {
        return res.status(400).json({ error: "You cannot delete your own admin account." });
    }
    try {
        await db.execute('DELETE FROM members WHERE id = ?', [memberId]);
        res.json({ message: 'Member deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting member.' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connectDB = require('../db.js');

// REGISTER new member
router.post('/register', async (req, res) => {
    const { full_name, phone_number, password } = req.body;
    try {
        const db = await connectDB();
        const [existing] = await db.query('SELECT * FROM members WHERE phone_number = ?', [phone_number]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Member already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO members (full_name, phone_number, password) VALUES (?, ?, ?)',
            [full_name, phone_number, hashedPassword]
        );
        res.status(201).json({ message: 'Member registered successfully', memberId: result.insertId });
    } catch (err) {
        console.error('Error registering member:', err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});

// LOGIN member
router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return res.status(400).json({ message: 'Phone number and password are required' });
    }
    try {
        const db = await connectDB();
        const [results] = await db.query('SELECT * FROM members WHERE phone_number = ?', [phoneNumber]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.full_name,
                phoneNumber: user.phone_number
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Database error', error: err });
    }
});

module.exports = router;
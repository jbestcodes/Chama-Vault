require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET; // get JWT secret from environment variables

// Register route
router.post('/register', async (req, res) => {
    // correctly get data from the request payload
    const db = req.db; 
    const { full_name, phone, password, group_id } = req.body;
    // simple check to ensure all fields are provided
if (!full_name || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
}
    try {
        //step 1: Check if the phone number already exists
        const [existingMember] = await req.db.execute(
            'SELECT * FROM members WHERE phone = ?',
            [phone]
        );
        if (existingMember.length > 0) {
            return res.status(409).json({ error: 'Phone number already registered' });
        }
        // step 2: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO members (full_name, phone, password, group_id) VALUES (?, ?, ?, ?)',
            [full_name, phone, hashedPassword, group_id]
        );
        res.status(201).json({ message: 'Member registered successfully' });
    } catch (error) {
        console.error('Error registering member:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});
    // Login route
router.post('/login', async (req, res) => {
    try {
        const db = req.db; // get the database connection from the request
        const { phone, password } = req.body;
if (!phone || !password) {
    return res.status(400).json({ error: 'Phone number and password are required' });
}
const[results] = await db.execute( 'SELECT * FROM members WHERE phone = ?',
            [phone]
        );
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }
        const member = results[0];

        // step 3: Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // step 4: Generate a JWT token and send it back to the client
        const token = jwt.sign({ id: member.id, phone: member.phone, is_admin: member.is_admin }, jwtSecret, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});
    
        
        //admin login
        router.post('/admin/login', async (req, res) => {
        const { phone, password } = req.body;
        const db = req.db; // get the database connection from the request
        try {
            const[rows] = await db.execute(
                'SELECT * FROM members WHERE phone = ? AND is_admin = true',
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
            const payload = { id: admin.id, full_name: admin.full_name, is_admin: true };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Admin login successful', 
                token,
            admin: {
                id: admin.id,
                full_name: admin.full_name,
                is_admin: true,
            },
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

module.exports = router;
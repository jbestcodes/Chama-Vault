const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    // correctly get data from the request payload
    const { full_name, phone, password } = req.body;
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
            'INSERT INTO members (full_name, phone, password) VALUES (?, ?, ?)',
            [full_name, phone, hashedPassword]
        );
        res.status(201).json({ message: 'Member registered successfully' });
    } catch (error) {
        console.error('Error registering member:', error.message);
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
        const [results] = await req.db.execute(
            'SELECT * FROM members WHERE phone = ?',
            [phone]
        );
        if (results.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        const member = results[0];
        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json({message: 'Login successful', member: { id: member.id, full_name: member.full_name, phone: member.phone } });
    } catch (error) {
        console.error('Error log in error:', error.message);
        res.status(500).json({ error: 'Internal server error' }); 
    }
});

module.exports = router;

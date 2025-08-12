const express = require('express');
const router = express.Router();
const {authenticateToken} = require('../middleware/auth');

//Admin create a new group
router.post('/', authenticateToken, async (req, res) => {
    const db = req.db;
    const { group_name } = req.body;
    if (!req.user.is_admin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    if (!group_name) {
        return res.status(400).json({ message: 'Group name is required.' });
    }
    try {
        await db.query('INSERT INTO savings_groups (name) VALUES (?)', [group_name]);
        res.status(201).json({ message: 'Group created successfully.' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
module.exports = router;
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Group = require('../models/Group');

// Admin create a new group
router.post('/', authenticateToken, async (req, res) => {
    const { group_name } = req.body;
    
    if (!req.user.is_admin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    
    if (!group_name) {
        return res.status(400).json({ message: 'Group name is required.' });
    }
    
    try {
        // Check if group already exists
        const existingGroup = await Group.findOne({ group_name: group_name.trim().toLowerCase() });
        if (existingGroup) {
            return res.status(400).json({ message: 'Group already exists.' });
        }
        
        // Create new group
        const newGroup = new Group({
            group_name: group_name.trim().toLowerCase()
        });
        
        await newGroup.save();
        res.status(201).json({ message: 'Group created successfully.' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
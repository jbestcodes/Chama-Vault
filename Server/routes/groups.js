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

// Update group settings endpoint
router.put('/settings/:groupId', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { interest_rate, minimum_loan_savings } = req.body;
        
        // Verify user is admin of this group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        if (group.admin_id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Only group admins can update settings' });
        }
        
        // Validate inputs
        if (interest_rate !== undefined && (interest_rate < 0 || interest_rate > 100)) {
            return res.status(400).json({ error: 'Interest rate must be between 0 and 100' });
        }
        
        if (minimum_loan_savings !== undefined && minimum_loan_savings < 0) {
            return res.status(400).json({ error: 'Minimum savings cannot be negative' });
        }
        
        // Update group settings
        const updateData = {};
        if (interest_rate !== undefined) updateData.interest_rate = interest_rate;
        if (minimum_loan_savings !== undefined) updateData.minimum_loan_savings = minimum_loan_savings;
        
        await Group.findByIdAndUpdate(groupId, updateData);
        
        res.json({ 
            message: 'Group settings updated successfully',
            interest_rate: interest_rate,
            minimum_loan_savings: minimum_loan_savings
        });
        
    } catch (error) {
        console.error('Update group settings error:', error);
        res.status(500).json({ error: 'Failed to update group settings' });
    }
});

// Get group settings endpoint
router.get('/settings/:groupId', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const group = await Group.findById(groupId).select('interest_rate minimum_loan_savings');
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        
        res.json({
            interest_rate: group.interest_rate || 5.0,
            minimum_loan_savings: group.minimum_loan_savings || 500.00
        });
        
    } catch (error) {
        console.error('Get group settings error:', error);
        res.status(500).json({ error: 'Failed to fetch group settings' });
    }
});

module.exports = router;
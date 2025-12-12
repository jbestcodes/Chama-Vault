const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('../middleware/auth');
const Group = require('../models/Group');
const Member = require('../models/Member');
const GroupRule = require('../models/GroupRule');

// Create a new group rule (Admin only)
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { 
            category, title, description, enforcement_level, 
            has_penalty, penalty_amount, penalty_percentage, penalty_description,
            priority, ai_keywords, include_in_ai_responses 
        } = req.body;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user is admin
        if (!member.is_admin && member.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        // Validate required fields
        if (!category || !title || !description) {
            return res.status(400).json({ error: 'Category, title, and description are required' });
        }
        
        // Create the rule
        const rule = new GroupRule({
            group_id: member.group_id,
            category,
            title,
            description,
            enforcement_level: enforcement_level || 'rule',
            has_penalty: has_penalty || false,
            penalty_amount,
            penalty_percentage,
            penalty_description,
            priority: priority || 0,
            ai_keywords,
            include_in_ai_responses: include_in_ai_responses !== false, // Default true
            created_by: member._id
        });
        
        await rule.save();
        
        res.status(201).json({
            message: 'Group rule created successfully',
            rule
        });
        
    } catch (error) {
        console.error('Create group rule error:', error);
        res.status(500).json({ error: 'Failed to create group rule' });
    }
});

// Get all rules for a group
router.get('/group/:groupId', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { category, active_only = 'true' } = req.query;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user belongs to this group
        if (member.group_id.toString() !== groupId) {
            return res.status(403).json({ error: 'Access denied: not a member of this group' });
        }
        
        const query = { group_id: groupId };
        if (category) query.category = category;
        if (active_only === 'true') query.is_active = true;
        
        const rules = await GroupRule.find(query)
            .populate('created_by', 'first_name last_name')
            .populate('updated_by', 'first_name last_name')
            .populate('approved_by', 'first_name last_name')
            .sort({ priority: -1, created_at: -1 });
        
        res.json({
            success: true,
            rules,
            total: rules.length
        });
        
    } catch (error) {
        console.error('Get group rules error:', error);
        res.status(500).json({ error: 'Failed to get group rules' });
    }
});

// Get a specific rule
router.get('/:ruleId', authenticateToken, async (req, res) => {
    try {
        const { ruleId } = req.params;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const rule = await GroupRule.findById(ruleId)
            .populate('created_by', 'first_name last_name')
            .populate('updated_by', 'first_name last_name')
            .populate('approved_by', 'first_name last_name');
            
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        
        // Check if user belongs to the same group
        if (member.group_id.toString() !== rule.group_id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json({
            success: true,
            rule
        });
        
    } catch (error) {
        console.error('Get group rule error:', error);
        res.status(500).json({ error: 'Failed to get group rule' });
    }
});

// Update a group rule (Admin only)
router.put('/:ruleId', authenticateToken, async (req, res) => {
    try {
        const { ruleId } = req.params;
        const updates = req.body;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user is admin
        if (!member.is_admin && member.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const rule = await GroupRule.findById(ruleId);
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        
        // Check if user belongs to the same group
        if (member.group_id.toString() !== rule.group_id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Update the rule
        Object.assign(rule, updates);
        rule.updated_by = member._id;
        
        await rule.save();
        
        res.json({
            message: 'Group rule updated successfully',
            rule
        });
        
    } catch (error) {
        console.error('Update group rule error:', error);
        res.status(500).json({ error: 'Failed to update group rule' });
    }
});

// Delete a group rule (Admin only)
router.delete('/:ruleId', authenticateToken, async (req, res) => {
    try {
        const { ruleId } = req.params;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user is admin
        if (!member.is_admin && member.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const rule = await GroupRule.findById(ruleId);
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        
        // Check if user belongs to the same group
        if (member.group_id.toString() !== rule.group_id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        await GroupRule.findByIdAndDelete(ruleId);
        
        res.json({
            message: 'Group rule deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete group rule error:', error);
        res.status(500).json({ error: 'Failed to delete group rule' });
    }
});

// Get rules for AI context (used internally by AI service)
router.get('/ai-context/:groupId', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { keywords, category } = req.query;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user belongs to this group
        if (member.group_id.toString() !== groupId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const keywordArray = keywords ? keywords.split(',').map(k => k.trim()) : [];
        const rules = await GroupRule.getAIRules(groupId, keywordArray, category);
        
        // Mark referenced rules
        if (rules.length > 0) {
            await Promise.all(
                rules.slice(0, 5).map(async rule => {
                    if (rule._id) {
                        const ruleDoc = await GroupRule.findById(rule._id);
                        if (ruleDoc) await ruleDoc.markReferenced();
                    }
                })
            );
        }
        
        res.json({
            success: true,
            rules: rules.slice(0, 10), // Limit to top 10 most relevant
            total_found: rules.length
        });
        
    } catch (error) {
        console.error('Get AI rules error:', error);
        res.status(500).json({ error: 'Failed to get AI rules' });
    }
});

// Get rule categories and statistics
router.get('/stats/:groupId', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user belongs to this group
        if (member.group_id.toString() !== groupId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const stats = await GroupRule.aggregate([
            { $match: { group_id: new mongoose.Types.ObjectId(groupId) } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: 1 },
                    active: { $sum: { $cond: ['$is_active', 1, 0] } },
                    with_penalties: { $sum: { $cond: ['$has_penalty', 1, 0] } },
                    avg_priority: { $avg: '$priority' },
                    ai_enabled: { $sum: { $cond: ['$include_in_ai_responses', 1, 0] } }
                }
            },
            { $sort: { total: -1 } }
        ]);
        
        const totalRules = await GroupRule.countDocuments({ group_id: groupId });
        const activeRules = await GroupRule.countDocuments({ group_id: groupId, is_active: true });
        
        res.json({
            success: true,
            stats: {
                total_rules: totalRules,
                active_rules: activeRules,
                by_category: stats
            }
        });
        
    } catch (error) {
        console.error('Get rule stats error:', error);
        res.status(500).json({ error: 'Failed to get rule statistics' });
    }
});

module.exports = router;
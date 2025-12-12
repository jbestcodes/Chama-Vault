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
});\n\n// Get all rules for a group\nrouter.get('/group/:groupId', authenticateToken, async (req, res) => {\n    try {\n        const { groupId } = req.params;\n        const { category, active_only = 'true' } = req.query;\n        \n        const member = await Member.findById(req.user.memberId);\n        if (!member) {\n            return res.status(404).json({ error: 'Member not found' });\n        }\n        \n        // Check if user belongs to this group\n        if (member.group_id.toString() !== groupId) {\n            return res.status(403).json({ error: 'Access denied: not a member of this group' });\n        }\n        \n        const query = { group_id: groupId };\n        if (category) query.category = category;\n        if (active_only === 'true') query.is_active = true;\n        \n        const rules = await GroupRule.find(query)\n            .populate('created_by', 'first_name last_name')\n            .populate('updated_by', 'first_name last_name')\n            .populate('approved_by', 'first_name last_name')\n            .sort({ priority: -1, created_at: -1 });\n        \n        res.json({\n            success: true,\n            rules,\n            total: rules.length\n        });\n        \n    } catch (error) {\n        console.error('Get group rules error:', error);\n        res.status(500).json({ error: 'Failed to get group rules' });\n    }\n});\n\n// Get a specific rule\nrouter.get('/:ruleId', authenticateToken, async (req, res) => {\n    try {\n        const { ruleId } = req.params;\n        \n        const member = await Member.findById(req.user.memberId);\n        if (!member) {\n            return res.status(404).json({ error: 'Member not found' });\n        }\n        \n        const rule = await GroupRule.findById(ruleId)\n            .populate('created_by', 'first_name last_name')\n            .populate('updated_by', 'first_name last_name')\n            .populate('approved_by', 'first_name last_name');\n            \n        if (!rule) {\n            return res.status(404).json({ error: 'Rule not found' });\n        }\n        \n        // Check if user belongs to the same group\n        if (member.group_id.toString() !== rule.group_id.toString()) {\n            return res.status(403).json({ error: 'Access denied' });\n        }\n        \n        res.json({\n            success: true,\n            rule\n        });\n        \n    } catch (error) {\n        console.error('Get group rule error:', error);\n        res.status(500).json({ error: 'Failed to get group rule' });\n    }\n});\n\n// Update a group rule (Admin only)\nrouter.put('/:ruleId', authenticateToken, async (req, res) => {\n    try {\n        const { ruleId } = req.params;\n        const updates = req.body;\n        \n        const member = await Member.findById(req.user.memberId);\n        if (!member) {\n            return res.status(404).json({ error: 'Member not found' });\n        }\n        \n        // Check if user is admin\n        if (!member.is_admin && member.role !== 'admin') {\n            return res.status(403).json({ error: 'Admin access required' });\n        }\n        \n        const rule = await GroupRule.findById(ruleId);\n        if (!rule) {\n            return res.status(404).json({ error: 'Rule not found' });\n        }\n        \n        // Check if user belongs to the same group\n        if (member.group_id.toString() !== rule.group_id.toString()) {\n            return res.status(403).json({ error: 'Access denied' });\n        }\n        \n        // Update the rule\n        Object.assign(rule, updates);\n        rule.updated_by = member._id;\n        \n        await rule.save();\n        \n        res.json({\n            message: 'Group rule updated successfully',\n            rule\n        });\n        \n    } catch (error) {\n        console.error('Update group rule error:', error);\n        res.status(500).json({ error: 'Failed to update group rule' });\n    }\n});\n\n// Delete a group rule (Admin only)\nrouter.delete('/:ruleId', authenticateToken, async (req, res) => {\n    try {\n        const { ruleId } = req.params;\n        \n        const member = await Member.findById(req.user.memberId);\n        if (!member) {\n            return res.status(404).json({ error: 'Member not found' });\n        }\n        \n        // Check if user is admin\n        if (!member.is_admin && member.role !== 'admin') {\n            return res.status(403).json({ error: 'Admin access required' });\n        }\n        \n        const rule = await GroupRule.findById(ruleId);\n        if (!rule) {\n            return res.status(404).json({ error: 'Rule not found' });\n        }\n        \n        // Check if user belongs to the same group\n        if (member.group_id.toString() !== rule.group_id.toString()) {\n            return res.status(403).json({ error: 'Access denied' });\n        }\n        \n        await GroupRule.findByIdAndDelete(ruleId);\n        \n        res.json({\n            message: 'Group rule deleted successfully'\n        });\n        \n    } catch (error) {\n        console.error('Delete group rule error:', error);\n        res.status(500).json({ error: 'Failed to delete group rule' });\n    }\n});\n\n// Get rules for AI context (used internally by AI service)\nrouter.get('/ai-context/:groupId', authenticateToken, async (req, res) => {\n    try {\n        const { groupId } = req.params;\n        const { keywords, category } = req.query;\n        \n        const member = await Member.findById(req.user.memberId);\n        if (!member) {\n            return res.status(404).json({ error: 'Member not found' });\n        }\n        \n        // Check if user belongs to this group\n        if (member.group_id.toString() !== groupId) {\n            return res.status(403).json({ error: 'Access denied' });\n        }\n        \n        const keywordArray = keywords ? keywords.split(',').map(k => k.trim()) : [];\n        const rules = await GroupRule.getAIRules(groupId, keywordArray, category);\n        \n        // Mark referenced rules\n        if (rules.length > 0) {\n            await Promise.all(\n                rules.slice(0, 5).map(async rule => {\n                    if (rule._id) {\n                        const ruleDoc = await GroupRule.findById(rule._id);\n                        if (ruleDoc) await ruleDoc.markReferenced();\n                    }\n                })\n            );\n        }\n        \n        res.json({\n            success: true,\n            rules: rules.slice(0, 10), // Limit to top 10 most relevant\n            total_found: rules.length\n        });\n        \n    } catch (error) {\n        console.error('Get AI rules error:', error);\n        res.status(500).json({ error: 'Failed to get AI rules' });\n    }\n});\n\n// Get rule categories and statistics\nrouter.get('/stats/:groupId', authenticateToken, async (req, res) => {\n    try {\n        const { groupId } = req.params;\n        \n        const member = await Member.findById(req.user.memberId);\n        if (!member) {\n            return res.status(404).json({ error: 'Member not found' });\n        }\n        \n        // Check if user belongs to this group\n        if (member.group_id.toString() !== groupId) {\n            return res.status(403).json({ error: 'Access denied' });\n        }\n        \n        const stats = await GroupRule.aggregate([\n            { $match: { group_id: mongoose.Types.ObjectId(groupId) } },\n            {\n                $group: {\n                    _id: '$category',\n                    total: { $sum: 1 },\n                    active: { $sum: { $cond: ['$is_active', 1, 0] } },\n                    with_penalties: { $sum: { $cond: ['$has_penalty', 1, 0] } },\n                    avg_priority: { $avg: '$priority' },\n                    ai_enabled: { $sum: { $cond: ['$include_in_ai_responses', 1, 0] } }\n                }\n            },\n            { $sort: { total: -1 } }\n        ]);\n        \n        const totalRules = await GroupRule.countDocuments({ group_id: groupId });\n        const activeRules = await GroupRule.countDocuments({ group_id: groupId, is_active: true });\n        \n        res.json({\n            success: true,\n            stats: {\n                total_rules: totalRules,\n                active_rules: activeRules,\n                by_category: stats\n            }\n        });\n        \n    } catch (error) {\n        console.error('Get rule stats error:', error);\n        res.status(500).json({ error: 'Failed to get rule statistics' });\n    }\n});\n\nmodule.exports = router;
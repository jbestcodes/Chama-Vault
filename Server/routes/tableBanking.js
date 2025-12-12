const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Group = require('../models/Group');
const Member = require('../models/Member');
const TableBankingCycle = require('../models/TableBankingCycle');
const Contribution = require('../models/Contribution');

// Get admin dashboard data
router.get('/admin-dashboard', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Get the group where user is admin
        const group = await Group.findOne({ 
            _id: member.group_id, 
            group_type: 'table_banking' 
        });
        
        if (!group) {
            return res.status(404).json({ error: 'Table banking group not found' });
        }

        // Check if user is admin of this group
        if (!member.is_admin && member.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get current active cycle
        const currentCycle = await TableBankingCycle.findOne({
            group_id: group._id,
            status: 'active'
        }).sort({ cycle_number: -1 });

        // Get all group members with their performance data
        const members = await Member.find({ group_id: group._id });
        
        // Calculate performance for each member
        for (let member of members) {
            member.performance = await Contribution.getMemberPerformance(member._id, group._id);
        }

        // Get recent contributions
        let contributions = [];
        if (currentCycle) {
            contributions = await Contribution.find({
                group_id: group._id,
                cycle_id: currentCycle._id
            }).populate('member_id', 'full_name phone')
              .sort({ due_date: -1 });
        }

        res.json({
            group,
            currentCycle,
            members,
            contributions
        });

    } catch (error) {
        console.error('Table banking dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Start new cycle
router.post('/start-cycle', authenticateToken, async (req, res) => {
    try {
        const { contributionAmount, frequency, startDate } = req.body;
        
        const member = await Member.findById(req.user.memberId);
        if (!member || !member.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const group = await Group.findOne({ 
            _id: member.group_id, 
            group_type: 'table_banking' 
        });
        
        if (!group) {
            return res.status(404).json({ error: 'Table banking group not found' });
        }

        // Check if there's already an active cycle
        const existingCycle = await TableBankingCycle.findOne({
            group_id: group._id,
            status: 'active'
        });

        if (existingCycle) {
            return res.status(400).json({ error: 'An active cycle already exists' });
        }

        // Get all group members
        const groupMembers = await Member.find({ group_id: group._id });
        
        // Create member order (shuffle for fairness)
        const shuffledMembers = groupMembers
            .filter(m => m.status === 'approved')
            .sort(() => Math.random() - 0.5);

        const memberOrder = shuffledMembers.map((member, index) => ({
            member_id: member._id,
            position: index + 1,
            payout_date: null, // Will be calculated based on frequency
            has_received: false,
            amount_received: 0
        }));

        // Get the last cycle number
        const lastCycle = await TableBankingCycle.findOne({
            group_id: group._id
        }).sort({ cycle_number: -1 });

        const cycleNumber = lastCycle ? lastCycle.cycle_number + 1 : 1;

        // Create new cycle
        const newCycle = new TableBankingCycle({
            group_id: group._id,
            cycle_number: cycleNumber,
            contribution_amount: contributionAmount,
            frequency,
            start_date: new Date(startDate),
            member_order: memberOrder,
            status: 'active',
            current_recipient_position: 1,
            total_expected_per_round: contributionAmount * groupMembers.length
        });

        await newCycle.save();

        // Create initial contribution records for the first round
        const firstDueDate = new Date(startDate);
        for (let memberData of memberOrder) {
            const contribution = new Contribution({
                group_id: group._id,
                cycle_id: newCycle._id,
                member_id: memberData.member_id,
                expected_amount: contributionAmount,
                due_date: firstDueDate,
                status: 'pending'
            });
            await contribution.save();
        }

        res.json({
            message: 'New table banking cycle started successfully',
            cycle: newCycle
        });

    } catch (error) {
        console.error('Start cycle error:', error);
        res.status(500).json({ error: 'Failed to start new cycle' });
    }
});

// Record contribution
router.post('/record-contribution', authenticateToken, async (req, res) => {
    try {
        const { memberId, amount, status, cycleId, notes } = req.body;
        
        const admin = await Member.findById(req.user.memberId);
        if (!admin || !admin.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Find the contribution record
        const contribution = await Contribution.findOne({
            member_id: memberId,
            cycle_id: cycleId,
            status: { $in: ['pending', 'partially_paid'] }
        });

        if (!contribution) {
            return res.status(404).json({ error: 'Contribution record not found' });
        }

        // Update contribution
        contribution.paid_amount = amount;
        contribution.paid_date = new Date();
        contribution.status = status;
        contribution.notes = notes;
        contribution.recorded_by = admin._id;

        await contribution.save();

        res.json({
            message: 'Contribution recorded successfully',
            contribution
        });

    } catch (error) {
        console.error('Record contribution error:', error);
        res.status(500).json({ error: 'Failed to record contribution' });
    }
});

// Get member dashboard (for regular members)
router.get('/member-dashboard', authenticateToken, async (req, res) => {
    try {
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const group = await Group.findOne({ 
            _id: member.group_id, 
            group_type: 'table_banking' 
        });
        
        if (!group) {
            return res.status(404).json({ error: 'Table banking group not found' });
        }

        // Get current cycle
        const currentCycle = await TableBankingCycle.findOne({
            group_id: group._id,
            status: 'active'
        });

        if (!currentCycle) {
            return res.json({
                group,
                currentCycle: null,
                message: 'No active cycle'
            });
        }

        // Get member's position in the cycle
        const memberOrder = currentCycle.member_order.find(
            order => order.member_id.toString() === member._id.toString()
        );

        // Get member's contribution history
        const contributions = await Contribution.find({
            member_id: member._id,
            group_id: group._id
        }).sort({ due_date: -1 });

        // Get member performance
        const performance = await Contribution.getMemberPerformance(member._id, group._id);

        // Get all members with masked phone numbers
        const allMembers = await Member.find({ group_id: group._id })
            .select('full_name phone');
        
        const membersWithMaskedPhones = allMembers.map(m => ({
            _id: m._id,
            full_name: m.full_name,
            phone: m.phone.slice(0, 3) + '*'.repeat(m.phone.length - 6) + m.phone.slice(-3)
        }));

        res.json({
            group,
            currentCycle,
            memberOrder,
            contributions,
            performance,
            members: membersWithMaskedPhones
        });

    } catch (error) {
        console.error('Member dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch member dashboard data' });
    }
});

// Progress to next recipient
router.post('/progress-cycle', authenticateToken, async (req, res) => {
    try {
        const admin = await Member.findById(req.user.memberId);
        if (!admin || !admin.is_admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { cycleId, currentRecipientId, amountReceived } = req.body;

        const cycle = await TableBankingCycle.findById(cycleId);
        if (!cycle) {
            return res.status(404).json({ error: 'Cycle not found' });
        }

        // Mark current recipient as having received money
        const memberOrder = cycle.member_order.find(
            order => order.member_id.toString() === currentRecipientId
        );

        if (memberOrder) {
            memberOrder.has_received = true;
            memberOrder.amount_received = amountReceived;
        }

        // Move to next recipient
        cycle.current_recipient_position += 1;

        // Check if cycle is complete
        if (cycle.current_recipient_position > cycle.member_order.length) {
            cycle.status = 'completed';
            cycle.end_date = new Date();
        }

        await cycle.save();

        res.json({
            message: 'Cycle progressed successfully',
            cycle
        });

    } catch (error) {
        console.error('Progress cycle error:', error);
        res.status(500).json({ error: 'Failed to progress cycle' });
    }
});

module.exports = router;
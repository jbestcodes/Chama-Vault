//routes/loan repayments
const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const Member = require('../models/Member');

// Record a repayment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { loan_id, amount, payment_date } = req.body;
        if (!loan_id || !amount || !payment_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create repayment as pending
        const newRepayment = new LoanRepayment({
            loan_id,
            amount,
            paid_date: payment_date,
            status: 'pending'
        });

        await newRepayment.save();
        res.status(201).json({ message: 'Repayment request sent to admin for approval' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all loans for the logged-in member
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id;
        const loans = await Loan.find({ member_id: memberId });
        
        // Add repayments to each loan
        for (const loan of loans) {
            const repayments = await LoanRepayment.find({ loan_id: loan._id });
            loan.repayments = repayments;
        }
        
        res.json(loans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all loans for the admin's group
router.get('/group', authenticateToken, isAdmin, async (req, res) => {
    try {
        const groupId = req.user.group_id;
        
        // Find all members in the group, then find their loans
        const members = await Member.find({ group_id: groupId });
        const memberIds = members.map(member => member._id);
        
        const loans = await Loan.find({ member_id: { $in: memberIds } });
        
        // Add repayments to each loan
        for (const loan of loans) {
            const repayments = await LoanRepayment.find({ loan_id: loan._id });
            loan.repayments = repayments;
        }
        
        res.json(loans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /repayments/pending
router.get('/pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const repayments = await LoanRepayment.find({ status: 'pending' })
            .populate({
                path: 'loan_id',
                select: 'member_id amount',
                populate: {
                    path: 'member_id',
                    select: 'full_name'
                }
            });
        
        // Format the response to match the old structure
        const formattedRepayments = repayments.map(repayment => ({
            id: repayment._id,
            loan_id: repayment.loan_id._id,
            amount: repayment.amount,
            paid_date: repayment.paid_date,
            status: repayment.status,
            member_id: repayment.loan_id.member_id._id,
            loan_amount: repayment.loan_id.amount,
            member_name: repayment.loan_id.member_id.full_name
        }));
        
        res.json(formattedRepayments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /repayments/approve
router.post('/approve', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { repayment_id } = req.body;
        
        // Get repayment details
        const repayment = await LoanRepayment.findById(repayment_id);
        if (!repayment || repayment.status !== 'pending') {
            return res.status(404).json({ message: 'Repayment not found or already processed' });
        }
        
        // Get loan details
        const loan = await Loan.findById(repayment.loan_id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        
        // Check if repayment amount exceeds outstanding balance
        if (Number(repayment.amount) > loan.total_due) {
            return res.status(400).json({ message: 'Repayment amount exceeds outstanding loan balance.' });
        }
        
        // Calculate new total due
        let new_total_due = loan.total_due - Number(repayment.amount);
        if (new_total_due < 0) new_total_due = 0;
        
        // Determine new loan status
        let newStatus = loan.status;
        if (new_total_due === 0) newStatus = 'paid';
        
        // Update repayment status and timestamp
        await LoanRepayment.findByIdAndUpdate(repayment_id, {
            status: 'approved',
            confirmed_at: new Date()
        });
        
        // Update loan
        await Loan.findByIdAndUpdate(loan._id, {
            total_due: new_total_due,
            status: newStatus
        });
        
        res.json({ message: 'Repayment approved and applied' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /repayments/reject
router.post('/reject', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { repayment_id } = req.body;
        
        await LoanRepayment.findByIdAndUpdate(repayment_id, {
            status: 'rejected'
        });
        
        res.json({ message: 'Repayment rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Rate loan repayment timing (Admin only)
router.post('/rate-timing/:repaymentId', authenticateToken, async (req, res) => {
    try {
        const { repaymentId } = req.params;
        const { timing_rating, rating_notes, expected_due_date } = req.body;
        
        // Validate rating
        if (!['early', 'on_time', 'late'].includes(timing_rating)) {
            return res.status(400).json({ error: 'Invalid timing rating. Must be: early, on_time, or late' });
        }
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user is admin
        if (!member.is_admin && member.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        // Find the repayment
        const repayment = await LoanRepayment.findById(repaymentId).populate({
            path: 'loan_id',
            populate: {
                path: 'member_id',
                select: 'group_id'
            }
        });
        
        if (!repayment) {
            return res.status(404).json({ error: 'Repayment not found' });
        }
        
        // Check if user is admin of the same group as the borrower
        if (repayment.loan_id.member_id.group_id.toString() !== member.group_id.toString()) {
            return res.status(403).json({ error: 'Admin access required for this group' });
        }
        
        // Update the repayment with timing rating
        repayment.timing_rating = timing_rating;
        repayment.rating_notes = rating_notes;
        repayment.rating_date = new Date();
        repayment.rated_by = member._id;
        
        // Set expected due date if provided
        if (expected_due_date) {
            repayment.expected_due_date = new Date(expected_due_date);
        }
        
        await repayment.save();
        
        res.json({
            message: 'Loan repayment timing rated successfully',
            repayment: {
                _id: repayment._id,
                timing_rating: repayment.timing_rating,
                rating_notes: repayment.rating_notes,
                rating_date: repayment.rating_date,
                days_late: repayment.days_late
            }
        });
        
    } catch (error) {
        console.error('Rate loan repayment timing error:', error);
        res.status(500).json({ error: 'Failed to rate loan repayment timing' });
    }
});

// Get loan timing analytics for a group
router.get('/timing-analytics/:groupId', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const member = await Member.findById(req.user.memberId);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        // Check if user belongs to this group and is admin
        if (member.group_id.toString() !== groupId || (!member.is_admin && member.role !== 'admin')) {
            return res.status(403).json({ error: 'Admin access required for this group' });
        }
        
        // Get loan timing analytics for this group
        const analytics = await LoanRepayment.getLoanTimingAnalytics({
            'loan_id': {
                $in: await Loan.find({
                    member_id: { 
                        $in: await Member.find({ group_id: groupId }).select('_id') 
                    }
                }).select('_id')
            }
        });
        
        res.json({
            success: true,
            analytics
        });
        
    } catch (error) {
        console.error('Get loan timing analytics error:', error);
        res.status(500).json({ error: 'Failed to get loan timing analytics' });
    }
});

// Get member loan repayment performance
router.get('/member-performance/:memberId', authenticateToken, async (req, res) => {
    try {
        const { memberId } = req.params;
        
        const requestingMember = await Member.findById(req.user.memberId);
        if (!requestingMember) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const targetMember = await Member.findById(memberId);
        if (!targetMember) {
            return res.status(404).json({ error: 'Target member not found' });
        }
        
        // Check if requesting member is admin of the same group or requesting their own data
        if (requestingMember._id.toString() !== memberId && 
            (requestingMember.group_id.toString() !== targetMember.group_id.toString() || 
             (!requestingMember.is_admin && requestingMember.role !== 'admin'))) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get member loan repayment performance
        const performance = await LoanRepayment.getMemberLoanPerformance(memberId);
        
        res.json({
            success: true,
            member: {
                _id: targetMember._id,
                name: `${targetMember.first_name} ${targetMember.last_name}`
            },
            loan_performance: performance
        });
        
    } catch (error) {
        console.error('Get member loan performance error:', error);
        res.status(500).json({ error: 'Failed to get member loan performance' });
    }
});

// Get combined member performance (contributions + loan repayments)
router.get('/combined-performance/:memberId', authenticateToken, async (req, res) => {
    try {
        const { memberId } = req.params;
        
        const requestingMember = await Member.findById(req.user.memberId);
        if (!requestingMember) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const targetMember = await Member.findById(memberId);
        if (!targetMember) {
            return res.status(404).json({ error: 'Target member not found' });
        }
        
        // Check permissions
        if (requestingMember._id.toString() !== memberId && 
            (requestingMember.group_id.toString() !== targetMember.group_id.toString() || 
             (!requestingMember.is_admin && requestingMember.role !== 'admin'))) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get both contribution and loan performance
        const Contribution = require('../models/Contribution');
        
        const [contributionPerformance, loanPerformance] = await Promise.all([
            Contribution.getMemberTimingPerformance(memberId, targetMember.group_id),
            LoanRepayment.getMemberLoanPerformance(memberId)
        ]);
        
        // Calculate overall performance score
        let overallScore = 0;
        let totalWeight = 0;
        
        if (contributionPerformance.total_rated > 0) {
            overallScore += contributionPerformance.score * contributionPerformance.total_rated;
            totalWeight += contributionPerformance.total_rated;
        }
        
        if (loanPerformance.total_rated > 0) {
            overallScore += loanPerformance.score * loanPerformance.total_rated;
            totalWeight += loanPerformance.total_rated;
        }
        
        const combinedScore = totalWeight > 0 ? overallScore / totalWeight : 0;
        
        let overallRating;
        if (combinedScore >= 2.5) overallRating = 'excellent';
        else if (combinedScore >= 2.0) overallRating = 'good';
        else if (combinedScore >= 1.5) overallRating = 'fair';
        else if (totalWeight > 0) overallRating = 'poor';
        else overallRating = 'no_data';
        
        res.json({
            success: true,
            member: {
                _id: targetMember._id,
                name: `${targetMember.first_name} ${targetMember.last_name}`
            },
            contribution_performance: contributionPerformance,
            loan_performance: loanPerformance,
            combined_performance: {
                overall_rating: overallRating,
                overall_score: combinedScore,
                total_activities: totalWeight
            }
        });
        
    } catch (error) {
        console.error('Get combined performance error:', error);
        res.status(500).json({ error: 'Failed to get combined performance' });
    }
});

module.exports = router;
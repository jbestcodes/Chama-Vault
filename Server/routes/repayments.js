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

module.exports = router;
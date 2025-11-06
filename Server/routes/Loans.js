//routes/loans.js
const express = require('express');
const router = express.Router();
const moment = require('moment');
const Loan = require('../models/Loan');
const LoanRepayment = require('../models/LoanRepayment');
const Member = require('../models/Member');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Create a new loan (admin direct creation)
router.post('/', async (req, res) => {
    try {
        const { member_id, amount, interest_rate, fees, due_date, installment_number } = req.body;
        if (!member_id || !amount || !interest_rate || !due_date || !installment_number) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Calculate total due
        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);

        // Create new loan
        const newLoan = new Loan({
            member_id,
            amount,
            interest_rate,
            fees: fees || 0,
            due_date,
            total_due,
            installment_number
        });

        await newLoan.save();
        
        res.status(201).json({
            message: 'Loan created successfully',
            loan: {
                id: newLoan._id,
                member_id,
                amount,
                interest_rate,
                fees,
                due_date,
                total_due,
                installment_number
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Member requests a loan (status: 'requested')
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const member_id = req.user.id;
        const { amount, reason } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        // Create loan request
        const newLoan = new Loan({
            member_id,
            amount,
            status: 'requested',
            reason: reason || null
        });

        await newLoan.save();
        res.status(201).json({ message: 'Loan request sent', loan_id: newLoan._id });
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

// Get all loans for the admin's group (with populate)
router.get('/group', authenticateToken, isAdmin, async (req, res) => {
    try {
        const groupId = req.user.group_id;
        
        // Find all members in the group, then find their loans
        const members = await Member.find({ group_id: groupId });
        const memberIds = members.map(member => member._id);
        
        const loans = await Loan.find({ member_id: { $in: memberIds } }).populate('member_id');
        
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

// Admin offers loan terms (status: 'offered')
router.post('/offer', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { loan_id, amount, interest_rate, fees, due_date, installment_number } = req.body;
        if (!loan_id || !amount || !interest_rate || !due_date || !installment_number) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check loan status before offering
        const loan = await Loan.findById(loan_id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        
        if (["active", "rejected"].includes(loan.status)) {
            return res.status(400).json({ message: 'Cannot offer terms on an already accepted or rejected loan.' });
        }

        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);
        const firstDueDate = moment(due_date);
        const lastDueDate = firstDueDate.clone().add(installment_number - 1, 'months').format('YYYY-MM-DD');
        const installment_amount = (Number(total_due) / Number(installment_number)).toFixed(2);
        
        await Loan.findByIdAndUpdate(loan_id, {
            amount,
            interest_rate,
            fees: fees || 0,
            due_date,
            last_due_date: lastDueDate,
            total_due,
            installment_number,
            installment_amount,
            status: 'offered'
        });
        
        res.json({ message: 'Loan offer sent to member' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Member accepts or rejects the loan offer
router.post('/offer-action', authenticateToken, async (req, res) => {
    try {
        const member_id = req.user.id;
        const { loan_id, action } = req.body; // action: 'accept' or 'reject'
        if (!loan_id || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        // Only allow the member who requested the loan to accept/reject
        const loan = await Loan.findOne({ _id: loan_id, member_id: member_id });
        if (!loan) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const newStatus = action === 'accept' ? 'active' : 'rejected';
        await Loan.findByIdAndUpdate(loan_id, { status: newStatus });
        
        res.json({ message: `Loan ${action}ed` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get loan details (admin or member who requested the loan)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const loanId = req.params.id;
        const memberId = req.user.id;
        
        // Check if the loan exists and if the requester is authorized to view it
        const loan = await Loan.findOne({
            _id: loanId,
            $or: [
                { member_id: memberId },
                ...(req.user.isAdmin ? [{}] : []) // If admin, allow access to any loan
            ]
        });
        
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // Also fetch the repayment schedule for the loan
        const repayments = await LoanRepayment.find({ loan_id: loan._id });
        loan.repayments = repayments;
        
        res.json(loan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update loan details (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const loanId = req.params.id;
        const { amount, interest_rate, fees, due_date, installment_number, status } = req.body;
        if (!amount || !interest_rate || !due_date || !installment_number || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);
        
        await Loan.findByIdAndUpdate(loanId, {
            amount,
            interest_rate,
            fees: fees || 0,
            due_date,
            total_due,
            installment_number,
            status
        });
        
        res.json({ message: 'Loan updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a loan (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const loanId = req.params.id;
        
        // First, delete all repayments associated with the loan
        await LoanRepayment.deleteMany({ loan_id: loanId });
        
        // Then, delete the loan itself
        await Loan.findByIdAndDelete(loanId);
        
        res.json({ message: 'Loan deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
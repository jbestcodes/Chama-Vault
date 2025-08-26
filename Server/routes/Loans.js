//routes/loans.js
const express = require('express');
const router = express.Router();

// create a new loan (admin direct creation)
router.post('/', async (req, res) => {
    const db = req.db;
    try {
        const { member_id, amount, interest_rate, fees, due_date, installment_number } = req.body;
        if (!member_id || !amount || !interest_rate || !due_date || !installment_number) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // calculate total due
        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);

        // insert loan
        const [result] = await db.query(
            'INSERT INTO loans (member_id, amount, interest_rate, fees, due_date, total_due, installment_number) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [member_id, amount, interest_rate, fees || 0, due_date, total_due, installment_number]
        );
        res.status(201).json({
            message: 'Loan created successfully',
            loan: {
                id: result.insertId,
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
router.post('/request', require('../middleware/auth').authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const member_id = req.user.id;
        const { amount, reason } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }
        // Insert loan request with status 'requested'
        const [result] = await db.query(
            'INSERT INTO loans (member_id, amount, status, created_at, reason) VALUES (?, ?, ?, NOW(), ?)',
            [member_id, amount, 'requested', reason || null]
        );
        res.status(201).json({ message: 'Loan request sent', loan_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all loans for the logged-in member
router.get('/my', require('../middleware/auth').authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const memberId = req.user.id;
        const [loans] = await db.query('SELECT * FROM loans WHERE member_id = ?', [memberId]);
        for (const loan of loans) {
            const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
            loan.repayments = repayments;
        }
        res.json(loans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all loans for the admin's group (with JOIN)
router.get('/group', require('../middleware/auth').authenticateToken, require('../middleware/auth').isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const groupId = req.user.group_id;
        // Join loans with members to get all loans for this group
        const [loans] = await db.query(
            `SELECT loans.* FROM loans
             JOIN members ON loans.member_id = members.id
             WHERE members.group_id = ?`, [groupId]
        );
        for (const loan of loans) {
            const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
            loan.repayments = repayments;
        }
        res.json(loans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin offers loan terms (status: 'offered')
router.post('/offer', require('../middleware/auth').authenticateToken, require('../middleware/auth').isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const { loan_id, amount, interest_rate, fees, due_date, installment_number } = req.body;
        if (!loan_id || !amount || !interest_rate || !due_date || !installment_number) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);
        await db.query(
            'UPDATE loans SET amount=?, interest_rate=?, fees=?, due_date=?, total_due=?, installment_number=?, status=? WHERE id=?',
            [amount, interest_rate, fees || 0, due_date, total_due, installment_number, 'offered', loan_id]
        );
        res.json({ message: 'Loan offer sent to member' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Member accepts or rejects the loan offer
router.post('/offer-action', require('../middleware/auth').authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const member_id = req.user.id;
        const { loan_id, action } = req.body; // action: 'accept' or 'reject'
        if (!loan_id || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid request' });
        }
        // Only allow the member who requested the loan to accept/reject
        const [rows] = await db.query('SELECT * FROM loans WHERE id=? AND member_id=?', [loan_id, member_id]);
        if (rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const newStatus = action === 'accept' ? 'pending' : 'rejected';
        await db.query('UPDATE loans SET status=? WHERE id=?', [newStatus, loan_id]);
        res.json({ message: `Loan ${action}ed` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get loan details (admin or member who requested the loan)
router.get('/:id', require('../middleware/auth').authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const loanId = req.params.id;
        const memberId = req.user.id;
        // Check if the loan exists and if the requester is authorized to view it
        const [loans] = await db.query('SELECT * FROM loans WHERE id=? AND (member_id=? OR ?)', [loanId, memberId, req.user.isAdmin]);
        if (loans.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        const loan = loans[0];
        // Also fetch the repayment schedule for the loan
        const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
        loan.repayments = repayments;
        res.json(loan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update loan details (admin only)
router.put('/:id', require('../middleware/auth').authenticateToken, require('../middleware/auth').isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const loanId = req.params.id;
        const { amount, interest_rate, fees, due_date, installment_number, status } = req.body;
        if (!amount || !interest_rate || !due_date || !installment_number || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);
        await db.query(
            'UPDATE loans SET amount=?, interest_rate=?, fees=?, due_date=?, total_due=?, installment_number=?, status=? WHERE id=?',
            [amount, interest_rate, fees || 0, due_date, total_due, installment_number, status, loanId]
        );
        res.json({ message: 'Loan updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a loan (admin only)
router.delete('/:id', require('../middleware/auth').authenticateToken, require('../middleware/auth').isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const loanId = req.params.id;
        // First, delete all repayments associated with the loan
        await db.query('DELETE FROM loan_repayments WHERE loan_id = ?', [loanId]);
        // Then, delete the loan itself
        await db.query('DELETE FROM loans WHERE id = ?', [loanId]);
        res.json({ message: 'Loan deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
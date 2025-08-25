//routes/loans.js
const express = require('express');
const router = express.Router();

const db = require('../db'); 

// create a new loan
router.post('/', async (req, res) => {
    try {
        const { group_id, member_id, amount, interest_rate, fees, due_date, installment_number } = req.body;
        if (!group_id || !member_id || !amount || !interest_rate || !due_date || !installment_number) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // calculate total due
        const total_due = Number(amount) + (Number(amount) * Number(interest_rate) / 100) + (fees ? Number(fees) : 0);

        // insert loan
        const [result] = await db.query(
            'INSERT INTO loans (group_id, member_id, amount, interest_rate, fees, due_date, total_due, installment_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [group_id, member_id, amount, interest_rate, fees || 0, due_date, total_due, installment_number]
        );
        res.status(201).json({
            message: 'Loan created successfully',
            loan: {
                id: result.insertId,
                group_id,
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
    try {
        const member_id = req.user.id;
        const group_id = req.user.group_id;
        const { amount, reason } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }
        // Insert loan request with status 'requested'
        const [result] = await db.query(
            'INSERT INTO loans (group_id, member_id, amount, status, created_at, reason) VALUES (?, ?, ?, ?, NOW(), ?)',
            [group_id, member_id, amount, 'requested', reason || null]
        );
        res.status(201).json({ message: 'Loan request sent', loan_id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all loans for the logged-in member
router.get('/my', require('../middleware/auth').authenticateToken, async (req, res) => {
    const memberId = req.user.id;
    const [loans] = await db.query('SELECT * FROM loans WHERE member_id = ?', [memberId]);
    for (const loan of loans) {
        const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
        loan.repayments = repayments;
    }
    res.json(loans);
});

// Get all loans for the admin's group
router.get('/group', require('../middleware/auth').authenticateToken, require('../middleware/auth').isAdmin, async (req, res) => {
    const groupId = req.user.group_id;
    console.log("req.user in /api/loans/group:", req.user);
    const conn = await db();
    const [loans] = await conn.query('SELECT * FROM loans WHERE group_id = ?', [groupId]);
    for (const loan of loans) {
        const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
        loan.repayments = repayments;
    }
    await conn.release();
    res.json(loans);
});

// Admin offers loan terms (status: 'offered')
router.post('/offer', require('../middleware/auth').authenticateToken, require('../middleware/auth').isAdmin, async (req, res) => {
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

module.exports = router;
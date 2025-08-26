//routes/loan repayments
const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Record a repayment
router.post('/', authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const { loan_id, amount, payment_date } = req.body;
        if (!loan_id || !amount || !payment_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Insert repayment as pending
        await db.query(
            'INSERT INTO loan_repayments (loan_id, amount, paid_date, status) VALUES (?, ?, ?, ?)',
            [loan_id, amount, payment_date, 'pending']
        );
        res.status(201).json({ message: 'Repayment request sent to admin for approval' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all loans for the logged-in member
router.get('/my', authenticateToken, async (req, res) => {
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

// Get all loans for the admin's group
router.get('/group', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const groupId = req.user.group_id;
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

// GET /repayments/pending
router.get('/pending', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const [repayments] = await db.query(
            `SELECT lr.*, l.member_id, l.amount AS loan_amount
             FROM loan_repayments lr
             JOIN loans l ON lr.loan_id = l.id
             WHERE lr.status = 'pending'`
        );
        res.json(repayments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /repayments/approve
router.post('/approve', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const { repayment_id } = req.body;
        // Get repayment details
        const [[repayment]] = await db.query('SELECT * FROM loan_repayments WHERE id = ?', [repayment_id]);
        if (!repayment || repayment.status !== 'pending') {
            return res.status(404).json({ message: 'Repayment not found or already processed' });
        }
        // Deduct from loan
        const [[loan]] = await db.query('SELECT * FROM loans WHERE id = ?', [repayment.loan_id]);
        if (Number(repayment.amount) > loan.total_due) {
            return res.status(400).json({ message: 'Repayment amount exceeds outstanding loan balance.' });
        }
        let new_total_due = loan.total_due - Number(repayment.amount);
        if (new_total_due < 0) new_total_due = 0;
        let newStatus = loan.status;
        if (new_total_due === 0) newStatus = 'paid';
        // Update repayment status, timestamp, and loan
        await db.query(
            'UPDATE loan_repayments SET status = ?, confirmed_at = NOW() WHERE id = ?',
            ['approved', repayment_id]
        );
        await db.query(
            'UPDATE loans SET total_due = ?, status = ? WHERE id = ?',
            [new_total_due, newStatus, loan.id]
        );
        res.json({ message: 'Repayment approved and applied' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /repayments/reject
router.post('/reject', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const { repayment_id } = req.body;
        await db.query('UPDATE loan_repayments SET status = ? WHERE id = ?', ['rejected', repayment_id]);
        res.json({ message: 'Repayment rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
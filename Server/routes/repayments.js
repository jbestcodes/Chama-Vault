//routes/loan repayments
const express = require('express');
const router = express.Router();
const db = require('../db'); 
const { authenticateToken, isAdmin } = require('../middleware/auth'); 

// Record a repayment
router.post('/', async (req, res) => {
    try {
        const { loan_id, amount, payment_date } = req.body;
        if (!loan_id || !amount || !payment_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get loan details
        const [loanRows] = await db.query('SELECT * FROM loans WHERE id = ?', [loan_id]);
        if (loanRows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        const loan = loanRows[0];

        if (loan.status === 'paid')
            return res.status(400).json({ message: 'Loan is already fully paid' });

        // Deduct repayment from total due
        let new_total_due = loan.total_due - Number(amount);
        if (new_total_due < 0) new_total_due = 0;

        // Insert repayment record
        await db.query('INSERT INTO loan_repayments (loan_id, amount, paid_date) VALUES (?, ?, ?)', [loan_id, amount, payment_date]);

        // Update loan status if fully paid
        let newStatus = loan.status;
        if (new_total_due === 0) {
            newStatus = 'paid';
            // Optionally, set last_due_date to payment_date
            await db.query('UPDATE loans SET total_due = ?, status = ?, last_due_date = ? WHERE id = ?', [new_total_due, newStatus, payment_date, loan_id]);
        } else {
            await db.query('UPDATE loans SET total_due = ?, status = ? WHERE id = ?', [new_total_due, newStatus, loan_id]);
        }

        res.status(201).json({ message: 'Repayment recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Example: GET /api/loans/my
router.get('/my', authenticateToken, async (req, res) => {
  const db = req.db;
  const memberId = req.user.id;
  const [loans] = await db.query('SELECT * FROM loans WHERE member_id = ?', [memberId]);
  for (const loan of loans) {
    const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
    loan.repayments = repayments;
  }
  res.json(loans);
});

// Example: GET /api/loans/group
router.get('/group', authenticateToken, isAdmin, async (req, res) => {
  const db = req.db;
  const groupId = req.user.group_id;
  const [loans] = await db.query('SELECT * FROM loans WHERE group_id = ?', [groupId]);
  for (const loan of loans) {
    const [repayments] = await db.query('SELECT * FROM loan_repayments WHERE loan_id = ?', [loan.id]);
    loan.repayments = repayments;
  }
  res.json(loans);
});

module.exports = router;
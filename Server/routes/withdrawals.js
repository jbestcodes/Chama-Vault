const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Member: Request withdrawal
router.post('/request', authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const { amount, reason, request_type, loan_id } = req.body;
        const member_id = req.user.id;

        // Validate input
        if (!amount || !reason || !request_type) {
            return res.status(400).json({
                success: false,
                message: 'Amount, reason, and request type are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        // Check member's total savings
        const [savingsRows] = await db.query(
            'SELECT COALESCE(SUM(amount), 0) as total_savings FROM savings WHERE member_id = ?',
            [member_id]
        );
        const totalSavings = Number(savingsRows[0]?.total_savings || 0);

        if (amount > totalSavings) {
            return res.status(400).json({
                success: false,
                message: `Insufficient savings. You have $${totalSavings.toFixed(2)} available`
            });
        }

        // If it's a loan payment, verify the loan exists and amount is valid
        if (request_type === 'loan_payment' && loan_id) {
            const [loanRows] = await db.query(
                'SELECT * FROM loans WHERE id = ? AND member_id = ? AND status IN ("active", "approved")',
                [loan_id, member_id]
            );

            if (loanRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Active loan not found'
                });
            }

            const loan = loanRows[0];
            if (amount > loan.total_due) {
                return res.status(400).json({
                    success: false,
                    message: `Payment amount exceeds loan balance of $${loan.total_due}`
                });
            }
        }

        // Create withdrawal request
        const [result] = await db.query(
            `INSERT INTO withdrawal_requests 
             (member_id, amount, reason, request_type, loan_id, status, created_at) 
             VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
            [member_id, amount, reason, request_type, loan_id || null]
        );

        res.json({
            success: true,
            message: 'Withdrawal request submitted successfully. Waiting for admin approval.',
            request_id: result.insertId
        });

    } catch (error) {
        console.error('Withdrawal request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal request'
        });
    }
});

// Member: Get own withdrawal history
router.get('/my-requests', authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const member_id = req.user.id;

        const [requests] = await db.query(`
            SELECT 
                wr.*,
                l.amount as loan_original_amount,
                l.total_due as loan_remaining,
                admin.full_name as processed_by_name
            FROM withdrawal_requests wr
            LEFT JOIN loans l ON wr.loan_id = l.id
            LEFT JOIN members admin ON wr.processed_by = admin.id
            WHERE wr.member_id = ?
            ORDER BY wr.created_at DESC
        `, [member_id]);

        res.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('Get withdrawal requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal requests'
        });
    }
});

// Member: Get active loans for loan payment selection
router.get('/my-loans', authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const member_id = req.user.id;

        const [loans] = await db.query(`
            SELECT id, amount, total_due, monthly_payment, 
                   DATEDIFF(due_date, CURDATE()) as days_until_due
            FROM loans 
            WHERE member_id = ? AND status IN ('active', 'approved') AND total_due > 0
            ORDER BY due_date ASC
        `, [member_id]);

        res.json({
            success: true,
            loans
        });

    } catch (error) {
        console.error('Get member loans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching loans'
        });
    }
});

// Admin: Get all withdrawal requests
router.get('/admin/all', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const adminId = req.user.id;
        const { status } = req.query;
        
        // Get admin's group
        const [adminRows] = await db.query('SELECT group_id FROM members WHERE id = ?', [adminId]);
        const groupId = adminRows[0]?.group_id;
        if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

        let query = `
            SELECT 
                wr.*,
                m.full_name as member_name,
                m.phone as member_phone,
                l.amount as loan_original_amount,
                l.total_due as loan_remaining,
                admin.full_name as processed_by_name,
                COALESCE(savings_total.total_savings, 0) as member_total_savings
            FROM withdrawal_requests wr
            JOIN members m ON wr.member_id = m.id
            LEFT JOIN loans l ON wr.loan_id = l.id
            LEFT JOIN members admin ON wr.processed_by = admin.id
            LEFT JOIN (
                SELECT member_id, COALESCE(SUM(amount), 0) as total_savings
                FROM savings 
                GROUP BY member_id
            ) savings_total ON wr.member_id = savings_total.member_id
            WHERE m.group_id = ?
        `;

        const params = [groupId];

        if (status && status !== 'all') {
            query += ' AND wr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY wr.created_at DESC';

        const [requests] = await db.query(query, params);

        res.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('Get all withdrawal requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal requests'
        });
    }
});

// Admin: Process withdrawal request
router.put('/admin/process/:requestId', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const { requestId } = req.params;
        const { status, admin_notes } = req.body;
        const admin_id = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected'
            });
        }

        // Get the withdrawal request
        const [requestRows] = await db.query(
            'SELECT * FROM withdrawal_requests WHERE id = ? AND status = "pending"',
            [requestId]
        );

        if (requestRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pending withdrawal request not found'
            });
        }

        const request = requestRows[0];

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Update the request status
            await db.query(
                `UPDATE withdrawal_requests 
                 SET status = ?, admin_notes = ?, processed_by = ?, updated_at = NOW()
                 WHERE id = ?`,
                [status, admin_notes || null, admin_id, requestId]
            );

            if (status === 'approved') {
                // Get current week number
                const [weekResult] = await db.query('SELECT WEEK(NOW()) as current_week');
                const currentWeek = weekResult[0].current_week;

                // Deduct from savings (negative entry)
                await db.query(
                    `INSERT INTO savings (member_id, week_number, amount, created_at)
                     VALUES (?, ?, ?, NOW())`,
                    [request.member_id, currentWeek, -request.amount]
                );

                // If it's a loan payment, create a repayment entry (integrating with your existing system)
                if (request.request_type === 'loan_payment' && request.loan_id) {
                    // Create loan repayment entry (using your existing table structure)
                    await db.query(
                        'INSERT INTO loan_repayments (loan_id, amount, paid_date, status, confirmed_at) VALUES (?, ?, NOW(), "approved", NOW())',
                        [request.loan_id, request.amount]
                    );

                    // Update loan balance (using your existing logic)
                    const [loanRows] = await db.query('SELECT * FROM loans WHERE id = ?', [request.loan_id]);
                    if (loanRows.length > 0) {
                        const loan = loanRows[0];
                        let newTotalDue = loan.total_due - Number(request.amount);
                        if (newTotalDue < 0) newTotalDue = 0;
                        
                        const newStatus = newTotalDue === 0 ? 'paid' : loan.status;
                        
                        await db.query(
                            'UPDATE loans SET total_due = ?, status = ? WHERE id = ?',
                            [newTotalDue, newStatus, request.loan_id]
                        );
                    }
                }
            }

            await db.query('COMMIT');

            res.json({
                success: true,
                message: `Withdrawal request ${status} successfully`
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Process withdrawal request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal request'
        });
    }
});

// Admin: Get withdrawal statistics
router.get('/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const adminId = req.user.id;
        
        // Get admin's group
        const [adminRows] = await db.query('SELECT group_id FROM members WHERE id = ?', [adminId]);
        const groupId = adminRows[0]?.group_id;
        if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

        // Get withdrawal statistics
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN wr.status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN wr.status = 'approved' THEN 1 END) as approved_requests,
                COUNT(CASE WHEN wr.status = 'rejected' THEN 1 END) as rejected_requests,
                COALESCE(SUM(CASE WHEN wr.status = 'approved' THEN wr.amount ELSE 0 END), 0) as total_approved_amount,
                COALESCE(SUM(CASE WHEN wr.status = 'pending' THEN wr.amount ELSE 0 END), 0) as pending_amount
            FROM withdrawal_requests wr
            JOIN members m ON wr.member_id = m.id
            WHERE m.group_id = ?
        `, [groupId]);

        res.json({
            success: true,
            stats: stats[0]
        });

    } catch (error) {
        console.error('Get withdrawal stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal statistics'
        });
    }
});

module.exports = router;
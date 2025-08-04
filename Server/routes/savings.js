const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/auth');

//route: get / api/savings
// description: Get all savings records for the authenticated user
router.get('/', async (req, res) => {
    console.log('Savings route accessed');
    const db = req.db;
    console.log('Database connection object:', db);
    if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    try {
        const [rows] = await db.query(
            `SELECT 
            m.id AS member_id,
            COALESCE(m.full_name, 'member') AS full_name,
            COALESCE(SUM(s.amount), 0) AS total_savings
            FROM members m
            LEFT JOIN savings s ON m.id = s.member_id
            GROUP BY m.id
            ORDER BY total_savings DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching savings records:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route: GET /api/savings/test
router.get('/test', (req, res) => {
    res.json({ message: 'Savings test route is working' });
});

// Route: GET /api/savings/summary
// Description: Get savings summary for the authenticated user
router.get('/summary', async (req, res) => {
    const db = req.db;
    if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    try {
        const [rows] = await db.query(
            `SELECT 
            m.id AS member_id,
            CONCAT(LEFT(m.full_name, 2), "****") AS masked_name,
            COALESCE(SUM(s.amount), 0) AS total_savings
            FROM members m
            LEFT JOIN savings s ON m.id = s.member_id
            GROUP BY m.id
            ORDER BY total_savings DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching savings summary:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Route: GET /api/savings/my-savings
// Description: Get savings records for the authenticated user
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const memberId = req.user.id; // Assuming user ID is stored in the token
        const [rows] = await req.db.query(
            'SELECT week_number, amount FROM savings WHERE member_id = ? ORDER BY week_number ASC',
            [memberId]
        );
        res.status(200).json({ savings: rows });
    } catch (error) {
        console.error('Error fetching my savings:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
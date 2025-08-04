const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
    console.log('Savings route hit!');
    const db = req.db;
    console.log('db connection object:', db);
    if (!db) {
        console.log('No database connection available');
        return res.status(500).json({ error: 'Database connection not available' });
    }
    try {
        const [rows] = await db.query(`
            SELECT
                m.id AS member_id,
                COALESCE(m.full_name, 'member') AS full_name,
                COALESCE(SUM(s.amount), 0) AS total_savings
            FROM members m
            LEFT JOIN savings s ON m.id = s.member_id
            GROUP BY m.id
            ORDER BY total_savings DESC
        `);
        console.log('Savings data retrieved successfully:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error retrieving savings data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/test', (req, res) => {
    res.json({ message: 'Savings test route works!' });
});

module.exports = router;
// Route: Get all savings
// This route retrieves all savings data for members, including total savings amounts
router.get('/summary', async (req, res) => {
    const db = req.db;
    if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    try {
        const [rows] = await db.query(`
            SELECT
                m.id AS member_id,
                CONCAT(LEFT(m.name, 2), '...') AS member_initials, 
                COALESCE(SUM(s.amount), 0) AS total_savings
            FROM members m
            LEFT JOIN savings s ON m.id = s.member_id
            GROUP BY m.id
            ORDER BY total_savings DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error retrieving savings summary:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
// view savings for logged-in member
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const memberId = req.user.id; // assuming user ID is stored in req.user by authMiddleware
        const [rows] = await req.db.query(
            'SELECT week_number, amount FROM savings WHERE member_id = ? ORDER BY week_number ASC',
            [memberId]
        );
        res.status(200).json({savings: rows});
    } catch (error) {
        console.error('Error retrieving member savings:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
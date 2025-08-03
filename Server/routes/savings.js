const express = require('express');
const router = express.Router();

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

module.exports = router;
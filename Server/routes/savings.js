const express = require('express');
const router = express.Router();
const  {authenticateToken, isAdmin}  = require('../middleware/auth');

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
            FROM members AS m
            LEFT JOIN savings AS s ON m.id = s.member_id
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
            FROM members AS m
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
//Admin-only route to get all savings records
router.get('/admin/dashboard', authenticateToken, isAdmin,(req, res) => {
    res.json({ message: 'Admin dashboard accessed successfully', user: req.user });
});
//Add new savings (Admin only)
router.post('/admin/add', authenticateToken, isAdmin, async (req, res) => {
    try {
        const db = req.db;
        const { member_id, week_number, amount } = req.body;
        //admin check
        if (!req.user || !req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        if (!week_number || !amount || !member_id) {
            return res.status(400).json({ error: 'Week number, amount, and member ID are required' });
        }
        await db.execute(
            'INSERT INTO savings (member_id, week_number, amount) VALUES (?, ?, ?)',
            [member_id, week_number, amount]
        );
        res.status(201).json({ message: 'New savings record added successfully' });
    } catch (error) {
        console.error('Error adding new savings record:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//update savings record (Admin only)
router.post('/admin/update', authenticateToken, isAdmin, async (req, res) => {
    try {
        const db = req.db;
        const { member_id, week_number, amount } = req.body;
        //admin check
        if (!req.user || !req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }
        if (!member_id || !week_number || !amount) {
            return res.status(400).json({ error: 'all fields are required' });
        }
        await db.execute(
            'UPDATE savings SET amount = ? WHERE member_id = ? AND week_number = ?',
            [amount, member_id, week_number]
        );
        res.status(201).json({ message: 'Savings record updated successfully' });
    } catch (error) {
        console.error('Error updating savings record:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//Route; Get member profile with savings, total and rank
router.get('/my-profile', authenticateToken, async (req, res) => {
    console.log('HIT /my-profile ROUTE');
    const db = req.db;
    if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    try {
        const memberId = req.user.id;
        // get member savings history
        const [savingsHistory] = await db.query(
            `SELECT s.id, s.amount, s.created_at
             FROM savings AS s
             WHERE s.member_id = ?
             ORDER BY s.created_at DESC`,
            [memberId]
        );
        // get total savings for this member
        const [[{ total_savings } = { total_savings: 0 }]] = await db.query(
            `SELECT COALESCE(SUM(s.amount),0) AS total_savings
             FROM savings AS s
             WHERE s.member_id = ?`,
            [memberId]
        );
        // get total savings for all members for ranking
        const [rankingData] = await db.query(
            `SELECT m.id AS member_id, m.full_name,
                    COALESCE(SUM(s.amount), 0) AS total_savings
             FROM members m
             LEFT JOIN savings s ON m.id = s.member_id
             GROUP BY m.id
             ORDER BY total_savings DESC`
        );
        // find this member's rank
        const userRank = rankingData.findIndex(member =>
            member.member_id === memberId) + 1;
        // anonymize leaderboard
        const anonymizedLeaderboard = rankingData.map(member => ({
            name: member.member_id === memberId ?
                member.full_name : `${member.full_name.charAt(0)}****`,
            total_savings: member.total_savings || 0,
        }));
        // send response
        res.json({
            savingsHistory,
            totalSavings: total_savings,
            rank: userRank,
            leaderboard: anonymizedLeaderboard,
        });
    } catch (error) {
        console.error('Error fetching member profile:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});
//Route: GET /api/savings/dashboard
// Description: Get dashboard summary (total savings, member count, last contribution)
router.get('/dashboard', authenticateToken, async (req, res) => {
    const db = req.db;
    try {
        const memberId = req.user.id; // Assuming user ID is stored in the token
        console.log(`Fetching dashboard for member ID:`, memberId);

        // Get total savings for the member
const [totalSavingsRows] = await db.query(
    `SELECT SUM(amount) AS total_savings
     FROM savings
     WHERE member_id = ?`,
[memberId]
);
        const totalSavings = totalSavingsRows[0]?.total_savings || 0;

        // Get total number of members
        const [memberCountRows] = await db.query(
            `SELECT COUNT(*) AS member_count FROM members`
        );
        const memberCount = memberCountRows[0]?.member_count || 0;

        //Get total savings for all members
const [totalSavingsAllRows] = await db.query(
    `SELECT SUM(amount) AS total_savings_all
     FROM savings`
);
        const totalSavingsAll = totalSavingsAllRows[0]?.total_savings_all || 0;

        // user rank based on total savings
const [rankingData] = await db.query(
`SELECT m.id AS member_id, m.full_name, SUM(s.amount) AS total_savings
FROM members AS m
LEFT JOIN savings AS s ON m.id = s.member_id
GROUP BY m.id
ORDER BY total_savings DESC`
);
        const userRank = rankingData.findIndex(member =>
            member.member_id === memberId) + 1;

        // Get last contribution date
        const [lastContributionRows] = await db.query(
            `SELECT MAX(created_at) AS last_contribution
             FROM savings
             WHERE member_id = ?`,
            [memberId]
        );
        const lastContribution = lastContributionRows[0]?.last_contribution || 'No contributions yet';

        res.json({
            totalSavings,
            memberCount,
            totalSavingsAll,
            userRank,
            lastContribution,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});

module.exports = router;
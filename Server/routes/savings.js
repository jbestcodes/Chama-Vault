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
        if (!req.user || req.user.role.toLowerCase() !== 'admin') {
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
        if (!req.user || req.user.role.toLowerCase() !== 'admin') {
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
    const db = req.db;
    if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
    }
    try {
        const memberId = req.user.id;

        // Fetch member info
        const [memberRows] = await db.query(
            'SELECT full_name, phone FROM members WHERE id = ?',
            [memberId]
        );
        const memberInfo = memberRows[0] || { full_name: '', phone: '' };

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
            full_name: memberInfo.full_name,
            phone: memberInfo.phone,
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
        const memberId = req.user.id;
        // Get the user's group_id and group_name
        const [userRows] = await db.query(
            'SELECT group_id, group_name FROM members WHERE id = ?',
            [memberId]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { group_id, group_name } = userRows[0];

        // Get total savings for the member
        const [totalSavingsRows] = await db.query(
            `SELECT SUM(amount) AS total_savings
             FROM savings
             WHERE member_id = ?`,
            [memberId]
        );
        const totalSavings = totalSavingsRows[0]?.total_savings || 0;

        // Get total number of members in the same group
        const [memberCountRows] = await db.query(
            `SELECT COUNT(*) AS member_count FROM members WHERE group_id = ?`,
            [group_id]
        );
        const memberCount = memberCountRows[0]?.member_count || 0;

        // Get total savings for all members in the same group
        const [totalSavingsAllRows] = await db.query(
            `SELECT SUM(s.amount) AS total_savings_all
             FROM savings s
             JOIN members m ON s.member_id = m.id
             WHERE m.group_id = ?`,
            [group_id]
        );
        const totalSavingsAll = totalSavingsAllRows[0]?.total_savings_all || 0;

        // User rank based on total savings within the group
        const [rankingData] = await db.query(
            `SELECT m.id AS member_id, m.full_name, COALESCE(SUM(s.amount), 0) AS total_savings
             FROM members m
             LEFT JOIN savings s ON m.id = s.member_id
             WHERE m.group_id = ?
             GROUP BY m.id
             ORDER BY total_savings DESC`,
            [group_id]
        );
        const userRank = rankingData.findIndex(member =>
            member.member_id === memberId) + 1;

        // Get last contribution date for the member
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
            group_id,
            group_name
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
        });
    }
});

// Add milestone for a member
router.post('/milestone', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;
    const { milestone_name, target_amount } = req.body;

    if (!milestone_name || !target_amount) {
        return res.status(400).json({ error: 'Milestone name and target amount are required.' });
    }

    try {
        await db.execute(
            'INSERT INTO milestones (member_id, milestone_name, target_amount) VALUES (?, ?, ?)',
            [memberId, milestone_name, target_amount]
        );
        res.status(201).json({ message: 'Milestone created successfully.' });
    } catch (error) {
        console.error('Error creating milestone:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Get member milestones and progress
router.get('/milestone', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;

    try {
        // Get all milestones for the member
        const [milestones] = await db.execute(
            'SELECT id, milestone_name, target_amount FROM milestones WHERE member_id = ?',
            [memberId]
        );

        // Get total savings for the member
        const [[{ total_savings } = { total_savings: 0 }]] = await db.execute(
            'SELECT COALESCE(SUM(amount),0) AS total_savings FROM savings WHERE member_id = ?',
            [memberId]
        );

        // Calculate progress for each milestone
        const milestonesWithProgress = milestones.map(milestone => ({
            ...milestone,
            progress: Math.min((total_savings / milestone.target_amount) * 100, 100),
            amount_saved: Math.min(total_savings, milestone.target_amount),
            amount_remaining: Math.max(milestone.target_amount - total_savings, 0)
        }));

        res.json({ milestones: milestonesWithProgress, total_savings });
    } catch (error) {
        console.error('Error fetching milestones:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Admin-only: Get all members
router.get('/members', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const [rows] = await db.query(
            'SELECT id, full_name, phone, role FROM members ORDER BY full_name ASC'
        );
        res.json({ members: rows });
    } catch (error) {
        console.error('Error fetching members:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin-only: Get all savings records with member info
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        const [rows] = await db.query(
            `SELECT s.id, s.amount, s.week_number, s.created_at, m.full_name, m.phone
             FROM savings s
             JOIN members m ON s.member_id = m.id
             ORDER BY s.created_at DESC`
        );
        res.json({ savings: rows });
    } catch (error) {
        console.error('Error fetching all savings:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin-only: Get savings matrix for all members and weeks
router.get('/matrix', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    try {
        // Get all weeks
        const [weeksRows] = await db.query(
            'SELECT DISTINCT week_number FROM savings ORDER BY week_number ASC'
        );
        const weeks = weeksRows.map(row => parseInt(row.week_number, 10)).sort((a, b) => a - b);

        // Get all members
        const [membersRows] = await db.query(
            'SELECT id, full_name FROM members ORDER BY full_name ASC'
        );

        // Get all savings records
        const [savingsRows] = await db.query(
            'SELECT member_id, week_number, SUM(amount) AS amount FROM savings GROUP BY member_id, week_number'
        );

        // Build matrix: { week: { memberId: amount } }
        const matrix = {};
        weeks.forEach(week => {
            matrix[week] = {};
            membersRows.forEach(member => {
                const record = savingsRows.find(
                    r => r.member_id === member.id && r.week_number === week
                );
                matrix[week][member.id] = record ? record.amount : 0;
            });
        });

        // Calculate member totals
        const memberTotals = {};
        membersRows.forEach(member => {
            memberTotals[member.id] = weeks.reduce(
                (sum, week) => sum + (matrix[week][member.id] || 0),
                0
            );
        });

        // Calculate week totals
        const weekTotals = {};
        weeks.forEach(week => {
            weekTotals[week] = membersRows.reduce(
                (sum, member) => sum + (matrix[week][member.id] || 0),
                0
            );
        });

        // Group total
        const groupTotal = Object.values(memberTotals).reduce((a, b) => a + b, 0);

        res.json({
            weeks,
            members: membersRows,
            matrix,
            memberTotals,
            weekTotals,
            groupTotal
        });
    } catch (error) {
        console.error('Error fetching savings matrix:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recommendation for member
router.get('/milestone/recommendation', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;

    // Get last month's savings
    const [[{ last_month_savings }]] = await db.execute(
        `SELECT COALESCE(SUM(amount),0) AS last_month_savings
         FROM savings
         WHERE member_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
         AND YEAR(created_at) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)`,
        [memberId]
    );

    // Get active milestone
    const [[milestone]] = await db.execute(
        `SELECT milestone_name, target_amount FROM milestones WHERE member_id = ? ORDER BY id DESC LIMIT 1`,
        [memberId]
    );

    // Get total savings
    const [[{ total_savings }]] = await db.execute(
        `SELECT COALESCE(SUM(amount),0) AS total_savings FROM savings WHERE member_id = ?`,
        [memberId]
    );

    let recommendation = "No milestone set.";
    if (milestone) {
        const remaining = milestone.target_amount - total_savings;
        recommendation = `Hey, you saved ${last_month_savings} last month. You need to save ${remaining > 0 ? remaining : 0} this month to hit your "${milestone.milestone_name}" milestone.`;
    }

    res.json({ recommendation });
});

module.exports = router;
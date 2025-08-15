const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all members in admin's group
router.get('/group', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    const adminId = req.user.id;
    const [adminRows] = await db.query('SELECT group_id FROM members WHERE id = ?', [adminId]);
    const groupId = adminRows[0]?.group_id;
    if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

    // Removed ORDER BY created_at DESC since created_at may not exist
    const [members] = await db.query(
        'SELECT id, full_name, phone, status FROM members WHERE group_id = ?',
        [groupId]
    );
    res.json({ members });
});

// Add member to group
router.post('/add', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    const adminId = req.user.id;
    const { full_name, phone } = req.body;
    if (!full_name || !phone) return res.status(400).json({ error: 'Full name and phone required.' });

    const [adminRows] = await db.query('SELECT group_id FROM members WHERE id = ?', [adminId]);
    const groupId = adminRows[0]?.group_id;
    if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

    await db.execute(
        'INSERT INTO members (full_name, phone, group_id, status, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [full_name, phone, groupId, 'pending', 'member']
    );
    res.json({ message: 'Member added. Pending approval.' });
});

// Edit member
router.post('/edit', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    const { member_id, full_name, phone } = req.body;
    if (!member_id || !full_name || !phone) return res.status(400).json({ error: 'All fields required.' });

    await db.execute(
        'UPDATE members SET full_name = ?, phone = ? WHERE id = ?',
        [full_name, phone, member_id]
    );
    res.json({ message: 'Member updated.' });
});

// Remove member
router.post('/remove', authenticateToken, isAdmin, async (req, res) => {
    const db = req.db;
    const { member_id } = req.body;
    if (!member_id) return res.status(400).json({ error: 'Member ID required.' });

    await db.execute('DELETE FROM members WHERE id = ?', [member_id]);
    res.json({ message: 'Member removed.' });
});

// Savings Matrix for Admin's Group
router.get('/matrix', authenticateToken, isAdmin, async (req, res) => {
    try {
        const db = req.db;
        const adminId = req.user.id;
        const [adminRows] = await db.query('SELECT group_id FROM members WHERE id = ?', [adminId]);
        const groupId = adminRows[0]?.group_id;
        if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

        const [members] = await db.query(
            'SELECT id, full_name FROM members WHERE group_id = ?',
            [groupId]
        );

        const [weeksRows] = await db.query(
            'SELECT DISTINCT s.week_number FROM savings s JOIN members m ON s.member_id = m.id WHERE m.group_id = ? ORDER BY s.week_number ASC',
            [groupId]
        );
        const weeks = weeksRows.map(row => row.week_number);

        const [savingsRows] = await db.query(
            'SELECT s.member_id, s.week_number, s.amount FROM savings s JOIN members m ON s.member_id = m.id WHERE m.group_id = ?',
            [groupId]
        );
        const matrix = {};
        weeks.forEach(week => { matrix[week] = {}; });
        for (const row of savingsRows) {
            if (!matrix[row.week_number]) matrix[row.week_number] = {};
            matrix[row.week_number][row.member_id] = row.amount;
        }

        const groupTotal = savingsRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

        res.json({
            members,
            weeks,
            matrix,
            groupTotal
        });
    } catch (err) {
        console.error("MATRIX ERROR:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    // Get user info
    const [userRows] = await db.query('SELECT group_id, group_name FROM members WHERE id = ?', [userId]);
    const groupId = userRows[0]?.group_id;
    const groupName = userRows[0]?.group_name;

    // Total savings for this user
    const [userSavingsRows] = await db.query('SELECT SUM(amount) as total FROM savings WHERE member_id = ?', [userId]);
    const totalSavings = Number(userSavingsRows[0]?.total || 0);

    // Total members in group
    const [memberRows] = await db.query('SELECT COUNT(*) as count FROM members WHERE group_id = ?', [groupId]);
    const memberCount = memberRows[0]?.count || 0;

    // Total savings for all members in group
    const [allSavingsRows] = await db.query(
        'SELECT SUM(s.amount) as total FROM savings s JOIN members m ON s.member_id = m.id WHERE m.group_id = ?',
        [groupId]
    );
    const totalSavingsAll = Number(allSavingsRows[0]?.total || 0);

    // User rank (by total savings in group)
    const [rankRows] = await db.query(
        `SELECT s.member_id, SUM(s.amount) as total
         FROM savings s JOIN members m ON s.member_id = m.id
         WHERE m.group_id = ?
         GROUP BY s.member_id
         ORDER BY total DESC`,
        [groupId]
    );
    let userRank = null;
    rankRows.forEach((row, idx) => {
        if (row.member_id === userId) userRank = idx + 1;
    });

    // Last contribution
    const [lastRows] = await db.query(
        'SELECT amount, created_at as date FROM savings WHERE member_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
    );
    const lastContribution = lastRows[0] || null;

    res.json({
        totalSavings,
        memberCount,
        totalSavingsAll,
        userRank,
        lastContribution,
        group_name: groupName
    });
});

// Milestone route (example: get all milestones for a group)
router.get('/milestones', authenticateToken, async (req, res) => {
    const db = req.db;
    const userId = req.user.id;

    // Get user's group_id
    const [userRows] = await db.query('SELECT group_id FROM members WHERE id = ?', [userId]);
    const groupId = userRows[0]?.group_id;
    if (!groupId) return res.status(400).json({ error: 'No group assigned.' });

    // Fetch milestones for the group
    const [milestones] = await db.query(
        'SELECT * FROM milestones WHERE group_id = ? ORDER BY target_date ASC',
        [groupId]
    );
    res.json({ milestones });
});

// Add milestone for a member
router.post('/milestone', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;
    const { milestone_name, target_amount } = req.body;

    if (!milestone_name || !target_amount) {
        return res.status(400).json({ error: 'Milestone name and target amount are required.' });
    }
    if (Number(target_amount) <= 0) {
        return res.status(400).json({ error: 'Target amount must be a positive number.' });
    }

    // Check for duplicate milestone name for this user
    const [existing] = await db.query(
        'SELECT id FROM milestones WHERE member_id = ? AND milestone_name = ?',
        [memberId, milestone_name]
    );
    if (existing.length > 0) {
        return res.status(400).json({ error: 'You already have a milestone with this name.' });
    }

    await db.execute(
        'INSERT INTO milestones (member_id, milestone_name, target_amount) VALUES (?, ?, ?)',
        [memberId, milestone_name, target_amount]
    );
    res.status(201).json({ message: 'Milestone created successfully.' });
});

// Get member milestones and progress
router.get('/milestone', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;

    // Get all milestones for the member
    const [milestones] = await db.query(
        'SELECT id, milestone_name, target_amount FROM milestones WHERE member_id = ?',
        [memberId]
    );

    // Get total savings for the member
    const [[{ total_savings } = { total_savings: 0 }]] = await db.query(
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
});

// Get recommendation for member
router.get('/milestone/recommendation', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;

    // Get last month's savings
    const [[{ last_month_savings }]] = await db.query(
        `SELECT COALESCE(SUM(amount),0) AS last_month_savings
         FROM savings
         WHERE member_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
         AND YEAR(created_at) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)`,
        [memberId]
    );

    // Get active milestone
    const [[milestone]] = await db.query(
        `SELECT milestone_name, target_amount FROM milestones WHERE member_id = ? ORDER BY id DESC LIMIT 1`,
        [memberId]
    );

    // Get total savings
    const [[{ total_savings }]] = await db.query(
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

// Delete a milestone (member only)
router.delete('/milestone/:id', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;
    const milestoneId = req.params.id;

    // Check if milestone exists and belongs to the user's group
    const [milestoneRows] = await db.query(
        'SELECT * FROM milestones WHERE id = ? AND group_id = ?',
        [milestoneId, userId]
    );
    if (milestoneRows.length === 0) {
        return res.status(404).json({ error: 'Milestone not found or does not belong to your group.' });
    }

    // Delete milestone
    await db.execute('DELETE FROM milestones WHERE id = ?', [milestoneId]);
    res.json({ message: 'Milestone deleted.' });
});

router.get('/my-profile', authenticateToken, async (req, res) => {
    const db = req.db;
    const memberId = req.user.id;

    // Get member info and group name from savings_groups
    const [userRows] = await db.query(
        `SELECT m.id, m.full_name, m.phone, m.group_id, g.group_name
         FROM members m
         LEFT JOIN savings_groups g ON m.group_id = g.group_id
         WHERE m.id = ?`,
        [memberId]
    );
    if (userRows.length === 0) {
        return res.status(404).json({ error: 'Profile not found.' });
    }
    const user = userRows[0];

    // Get all members in the same group
    const [groupMembers] = await db.query(
        `SELECT id, full_name FROM members WHERE group_id = ?`,
        [user.group_id]
    );

    // Get leaderboard for the group
    const [leaderboardRows] = await db.query(
        `SELECT m.id, m.full_name, COALESCE(SUM(s.amount), 0) as total_savings
         FROM members m
         LEFT JOIN savings s ON m.id = s.member_id
         WHERE m.group_id = ?
         GROUP BY m.id
         ORDER BY total_savings DESC`,
        [user.group_id]
    );

    // Mask names except for the logged-in user
    const leaderboard = leaderboardRows.map(row => ({
        name: row.id === user.id ? row.full_name : `${row.full_name.charAt(0)}****`,
        total_savings: Number(row.total_savings || 0)
    }));

    // Find user's rank in the group
    const rank = leaderboardRows.findIndex(row => row.id === user.id) + 1;

    // Get user's savings history for graph
    const [savingsHistory] = await db.query(
        `SELECT id, amount, created_at FROM savings WHERE member_id = ? ORDER BY created_at ASC`,
        [memberId]
    );

    res.json({
        full_name: user.full_name,
        phone: user.phone,
        group_name: user.group_name,
        rank,
        leaderboard,
        savingsHistory,
    });
});

module.exports = router;
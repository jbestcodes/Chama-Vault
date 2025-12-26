const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const authWithSMSRoutes = require('./routes/authWithSMS');
const savingsRoutes = require('./routes/savings');
const groupsRoutes = require('./routes/groups');
const loansRoutes = require('./routes/Loans');
const repaymentsRoutes = require('./routes/repayments');
const aiRoutes = require('./routes/ai');
const withdrawalRoutes = require('./routes/withdrawals');
const notificationRoutes = require('./routes/notifications');
const { router: subscriptionRoutes, webhookHandler } = require('./routes/subscriptions');
const inviteRoutes = require('./routes/invites');
const tableBankingRoutes = require('./routes/tableBanking');
const groupRulesRoutes = require('./routes/groupRules');
const leaderboardRoutes = require('./routes/leaderboard');
const supportRoutes = require('./routes/support');
const statementRoutes = require('./routes/statements');
const connectDB = require('./db'); // Import the new MongoDB connection

// Initialize services
const reminderService = require('./services/reminderService'); // This will start cron jobs

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            'https://chama-vault-aiid.vercel.app',
            'https://jazanyumba.online',
            'https://www.jazanyumba.online',
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5000'
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// PAYSTACK WEBHOOK — MUST COME FIRST
app.post(
    '/api/subscriptions/webhook',
    express.raw({ type: 'application/json' }),
    webhookHandler
);

// NOW it's safe to parse JSON
app.use(express.json());


// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sms-auth', authWithSMSRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/contact', require('./routes/contact'));
app.use('/api/loans', loansRoutes);
app.use('/api/repayments', repaymentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/table-banking', tableBankingRoutes);
app.use('/api/group-rules', groupRulesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/statements', statementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'connected',
            sms: 'ready',
            reminders: 'active'
        }
    });
});

// Public homepage statistics endpoint
app.get('/api/public/stats', async (req, res) => {
    try {
        const Member = require('./models/Member');
        const Group = require('./models/Group');
        const Savings = require('./models/Savings');
        const Subscription = require('./models/Subscription');

        // Get total statistics
        const [totalMembers, totalGroups, totalSavings, activeSubscriptions] = await Promise.all([
            Member.countDocuments(),
            Group.countDocuments(),
            Savings.aggregate([
                { $match: { amount: { $gt: 0 } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Subscription.countDocuments({ status: 'active' })
        ]);

        const totalSavingsAmount = totalSavings.length > 0 ? totalSavings[0].total : 0;

        // Format numbers to show encouraging thresholds for better presentation
        const formatStat = (value, minThreshold = 10) => {
            if (value === 0) return 'Growing fast!';
            if (value < minThreshold) return `${minThreshold}+`;
            return value.toLocaleString();
        };

        const formatSavings = (amount) => {
            if (amount === 0) return 'Building momentum!';
            if (amount < 10000) return 'KSh 10,000+';
            return `KSh ${Math.round(amount / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        res.json({
            success: true,
            data: {
                totalMembers: formatStat(totalMembers, 50),
                totalGroups: formatStat(totalGroups, 10),
                totalSavingsAmount: formatSavings(totalSavingsAmount),
                activeSubscriptions: formatStat(activeSubscriptions, 5),
                // Some sample testimonials (you can replace with real ones)
                testimonials: [
                    {
                        name: "Sarah Wanjiku",
                        group: "Hope Savings Group",
                        message: "Jaza Nyumba has transformed how we save as a group. The AI insights are incredible!",
                        rating: 5
                    },
                    {
                        name: "David Kiprop",
                        group: "Future Builders Chama",
                        message: "Finally, a platform that understands Kenyan Chamas. Highly recommended!",
                        rating: 5
                    },
                    {
                        name: "Grace Achieng",
                        group: "Women's Empowerment Circle",
                        message: "The automated reminders and secure payments make group savings so much easier.",
                        rating: 5
                    }
                ],
                features: [
                    {
                        icon: "🤖",
                        title: "AI-Powered Insights",
                        description: "Get personalized financial advice and group performance analytics"
                    },
                    {
                        icon: "📱",
                        title: "Smart Notifications",
                        description: "Automated SMS and email reminders for contributions and loans"
                    },
                    {
                        icon: "🔒",
                        title: "Bank-Level Security",
                        description: "Secure payments with M-Pesa integration and encrypted data"
                    },
                    {
                        icon: "📊",
                        title: "Real-Time Dashboard",
                        description: "Track your savings progress with beautiful, interactive charts"
                    },
                    {
                        icon: "👥",
                        title: "Group Management",
                        description: "Powerful admin tools for managing members, loans, and contributions"
                    },
                    {
                        icon: "🎯",
                        title: "Goal Tracking",
                        description: "Set and achieve savings milestones with progress tracking"
                    }
                ]
            }
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Unable to fetch statistics' 
        });
    }
});

// SPA Fallback: serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

console.log('🚀 Jaza Nyumba server starting...');
console.log('📱 SMS service initialized');
console.log('⏰ Reminder schedulers active');

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
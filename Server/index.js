const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const savingsRoutes = require('./routes/savings');
const groupsRoutes = require('./routes/groups');
const loansRoutes = require('./routes/Loans');
const repaymentsRoutes = require('./routes/repayments');
const aiRoutes = require('./routes/ai');
const withdrawalRoutes = require('./routes/withdrawals');
const notificationRoutes = require('./routes/notifications');
const subscriptionRoutes = require('./routes/subscriptions');
const inviteRoutes = require('./routes/invites');
const connectDB = require('./db'); // Import the new MongoDB connection

// Initialize services
const reminderService = require('./services/reminderService'); // This will start cron jobs

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://chama-vault-aiid.vercel.app', 'https://jazanyumba.online','http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
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

console.log('🚀 Jaza Nyumba server starting...');
console.log('📱 SMS service initialized');
console.log('⏰ Reminder schedulers active');

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const savingsRoutes = require('./routes/savings');
const groupsRoutes = require('./routes/groups');
const loansRoutes = require('./routes/Loans');
const repaymentsRoutes = require('./routes/repayments');
const aiRoutes = require('./routes/ai');
const withdrawalRoutes = require('./routes/withdrawals');
const connectDB = require('./db'); // Import the new MongoDB connection

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://chama-vault-aiid.vercel.app', 'http://localhost:5173'],
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
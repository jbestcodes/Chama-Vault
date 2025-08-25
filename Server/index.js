const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./routes/auth');
const savingsRoutes = require('./routes/savings');
const groupsRoutes = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 5000;

// Create a connection pool once
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(cors({
  origin: ['https://chama-vault-aiid.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Attach pool to req for use in routes
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/contact', require('./routes/contact'));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
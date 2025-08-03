const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./routes/auth');
const savingsRoutes = require('./routes/savings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
async function connectDB() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '28494217',
        database: 'Chama_Vault'
    });
}

app.use(async (req, res, next) => {
    try {
        req.db = await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/savings', savingsRoutes);
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
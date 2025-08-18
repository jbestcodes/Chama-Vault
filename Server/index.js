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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // Add this line if you have a custom port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: true } // Add this line for Railway SSL
});

app.use(cors());
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
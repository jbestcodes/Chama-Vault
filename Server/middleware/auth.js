const jwt = require('jsonwebtoken');
require('dotenv').config();


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expect "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user; // Attach the decoded user to the request
        next();
    });
};
//check if user is admin
function isAdmin(req, res, next) {
    // Assumes req.user is set by authenticateToken middleware
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admins only.' });
}

module.exports = { authenticateToken, isAdmin };

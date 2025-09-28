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

// Check if user is admin
function isAdmin(req, res, next) {
    // Assumes req.user is set by authenticateToken middleware
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Access denied. Admins only.' });
}

// Check if user can withdraw (admin or treasurer)
function canWithdraw(req, res, next) {
    if (req.user && req.user.role) {
        const role = req.user.role.toLowerCase();
        if (role === 'admin' || role === 'treasurer') {
            return next();
        }
    }
    return res.status(403).json({ 
        error: 'Access denied. Only administrators and treasurers can process withdrawals.' 
    });
}

// Check if user can approve withdrawals (admin only)
function canApproveWithdrawal(req, res, next) {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        return next();
    }
    return res.status(403).json({ 
        error: 'Access denied. Only administrators can approve withdrawals.' 
    });
}

// Check if user can request withdrawal (any authenticated user)
function canRequestWithdrawal(req, res, next) {
    // This just checks if user is authenticated (already done by authenticateToken)
    // Additional business logic can be added here if needed
    if (req.user) {
        return next();
    }
    return res.status(401).json({ 
        error: 'Authentication required to request withdrawals.' 
    });
}

// Check if user is member or higher
function isMember(req, res, next) {
    if (req.user && req.user.role) {
        const role = req.user.role.toLowerCase();
        const allowedRoles = ['member', 'treasurer', 'admin'];
        if (allowedRoles.includes(role)) {
            return next();
        }
    }
    return res.status(403).json({ 
        error: 'Access denied. Members only.' 
    });
}

// Check if user is treasurer or admin
function isTreasurerOrAdmin(req, res, next) {
    if (req.user && req.user.role) {
        const role = req.user.role.toLowerCase();
        if (role === 'treasurer' || role === 'admin') {
            return next();
        }
    }
    return res.status(403).json({ 
        error: 'Access denied. Treasurer or Administrator access required.' 
    });
}

module.exports = { 
    authenticateToken, 
    isAdmin, 
    canWithdraw, 
    canApproveWithdrawal, 
    canRequestWithdrawal,
    isMember,
    isTreasurerOrAdmin
};

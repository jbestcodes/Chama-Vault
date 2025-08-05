

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
const isAdmin = (req, res, next) => {
    //check after attaching user in authenticateToken
if (req.user && req.user.is_admin) {
        next(); // User is admin, proceed to the next middleware
}else {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};
module.exports = {authenticateToken, isAdmin};

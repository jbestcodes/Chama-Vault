const jwt = require('jsonwebtoken');
const authmiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'no token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'ivalid token format' });
    }
    try {
        const decoded = jwt.verify(token, 'your_secret_key'); //use a strong secret key
        req.user = decoded; // attach user info to request object
        next(); // proceed to the next middleware or route handler
    }catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};
module.exports = authmiddleware;


// middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../database');

// Middleware to authenticate user with session check
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token." });

        // Check if session is active
        db.get(`SELECT * FROM sessions WHERE token = ? AND expires_at > ?`, [token, new Date().toISOString()], (err, session) => {
            if (err || !session) {
                return res.status(403).json({ message: "Session expired or invalid." });
            }

            // Attach user info to request
            req.user = { id: decoded.id, role: decoded.role };
            next();
        });
    });
}

// Middleware to authorize based on roles
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRoles };

// middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../database');

// Middleware to authenticate user with session check
const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token; // Ensure cookie-parser is used in app.js
    if (!token) return res.status(401).json({ message: "Session expired or invalid." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Session expired or invalid." });
        req.user = user; // Attach the user info to the request
        next();
    });
};

// Middleware to authorize based on roles
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
}


const authorizeOwnership = (req, res, next) => {
    const userId = req.user?.id; 
    const resourceId = req.query.appId; 

    if (!userId || !resourceId) {
        return res.status(400).render('error', { errorMessage: "Invalid request. Missing required parameters." });
    }

    // Check if the user owns the application
    db.get(`SELECT * FROM applications WHERE id = ? AND user_id = ?`, [resourceId, userId], (err, application) => {
        if (err) {
            console.error("Error checking resource ownership:", err.message);
            return res.status(500).render('error', { errorMessage: "Internal server error. Please try again later." });
        }
        if (!application) {
            return res.status(403).render('error', { errorMessage: "Access denied. Either you do not own this resource or it does not exist." });
        }

        // Ownership verified, proceed to the next middleware or route handler
        next();
    });
};

module.exports = { authenticateToken, authorizeRoles, authorizeOwnership };

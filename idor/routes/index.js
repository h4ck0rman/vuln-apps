// routes/index.js
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();
const db = require('../database');
router.use('/auth', require('./auth'));

// Protected route for general users
router.get('/user', authenticateToken, (req, res) => {
    res.json({ message: `Hello, User ${req.user.id}!` });
});

// Insecure endpoint: View application details by application ID, including sensitive data (IDOR vulnerability)
router.get('/application/:appId', authenticateToken, (req, res) => {
    const appId = req.params.appId;

    // Fetch application data, including sensitive fields
    db.get(`SELECT * FROM applications`, (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: "Application not found" });
        }
        res.json(row); // Respond with application data, including sensitive information
    });
});

module.exports = router;

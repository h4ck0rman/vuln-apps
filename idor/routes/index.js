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

router.get('/view-application/:id', authenticateToken, (req, res) => {
    const applicationId = req.params.id;

    // Query the database for the application details
    db.get(`SELECT * FROM applications WHERE id = ?`, [applicationId], (err, application) => {
        if (err) {
            console.error("Error fetching application:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        if (!application) {
            return res.status(404).send("Application not found");
        }

        // Render the view-application page with application details
        res.render('view-application', { application });
    });
});



// Get all applications for the authenticated user
router.get('/applications/view', authenticateToken, (req, res) => {
    const userId = req.user.id;

    // Fetch all applications for the authenticated user
    db.all(`SELECT * FROM applications WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Error retrieving applications" });
        }
        res.json(rows); // Respond with the list of applications for the user
    });
});

module.exports = router;

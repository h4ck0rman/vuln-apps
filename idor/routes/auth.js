const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { validateRegistration } = require('../middleware/validation');
const router = express.Router();

// Utility to generate a JWT token
const generateToken = (user) => jwt.sign(
    { id: user.id, name: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
);

// ---------------------- REGISTER NEW USER ----------------------
router.post('/register-user', validateRegistration, async (req, res) => {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
        return res.status(400).json({ error: "All fields (username, password, email) are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'user'; // Default role

        // Insert user into the database
        db.run(
            `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
            [username, hashedPassword, email, role],
            function (err) {
                if (err) {
                    console.error("Error registering user:", err.message);
                    return res.status(400).json({ error: "User registration failed. Username or email may already exist." });
                }
                res.status(201).json({ message: "User registered successfully" });
            }
        );
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ---------------------- LOGIN USER ----------------------
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Both username and password are required" });
    }

    try {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
            if (err || !user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            const token = generateToken(user);
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/applications');
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ---------------------- LOGOUT USER ----------------------
router.post('/logout', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    // Validate token
    if (!token) {
        return res.status(400).json({ error: "No token provided" });
    }

    try {
        // Delete the session from the database
        db.run(`DELETE FROM sessions WHERE token = ?`, [token], function (err) {
            if (err) {
                console.error("Error logging out:", err.message);
                return res.status(500).json({ error: "Error logging out" });
            }
            res.json({ message: "Successfully logged out" });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;

// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { validateRegistration } = require('../middleware/validation');
const router = express.Router();

const generateToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
    const { username, password, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
        [username, hashedPassword, email, role],
        function (err) {
            if (err) return res.status(400).json({ error: "User registration failed" });
            res.status(201).json({ message: "User registered successfully" });
        }
    );
});

// Login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

        const token = generateToken(user);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Token expiration in 1 hour

        db.run(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`,
            [user.id, token, expiresAt.toISOString()],
            function (err) {
                if (err) return res.status(500).json({ error: "Error creating session" });
                res.json({ token });
            }
        );
    });
});

// Logout user (delete session)
router.post('/logout', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(400).json({ error: "No token provided" });

    db.run(`DELETE FROM sessions WHERE token = ?`, [token], function (err) {
        if (err) return res.status(500).json({ error: "Error logging out" });
        res.json({ message: "Successfully logged out" });
    });
});

module.exports = router;

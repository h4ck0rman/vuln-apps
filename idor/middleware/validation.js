// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateRegistration = [
    body('username').isString().isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    body('email').isEmail().normalizeEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateRegistration };

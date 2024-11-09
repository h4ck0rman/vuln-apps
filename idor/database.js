// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('app.db');

// Create `users` and `sessions` tables
db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        role TEXT
    )`);

    // Create Sessions table
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT,
        expires_at DATETIME,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Updated applications table to include sensitive information
    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        application_name TEXT,
        application_status TEXT,
        ssn TEXT, -- Sensitive field: Social Security Number
        bank_account TEXT, -- Sensitive field: Bank Account Number
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Sample data with sensitive information
    const stmt = db.prepare("INSERT INTO applications (user_id, application_name, application_status, ssn, bank_account) VALUES (?, ?, ?, ?, ?)");
    stmt.run(100000, "Loan Application", "Pending", "123-45-6789", "1111222233334444");
    stmt.run(100001, "Credit Card Application", "Approved", "987-65-4321", "5555666677778888");
    stmt.finalize();

});

module.exports = db;

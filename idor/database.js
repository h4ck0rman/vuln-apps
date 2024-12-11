const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('app.db');

// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON;');

// Drop existing tables and recreate them
db.serialize(() => {
    // Drop existing tables
    db.run(`DROP TABLE IF EXISTS applications`);
    db.run(`DROP TABLE IF EXISTS users`);

    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        role TEXT
    )`);

    // Create Applications table with UUID for IDs
    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY, -- UUID as TEXT
        user_id INTEGER,
        application_name TEXT,
        application_status TEXT,
        ssn TEXT,
        bank_account TEXT,
        full_name TEXT,
        phone_number TEXT,
        address TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Insert sample users
    const hashedPassword1 = bcrypt.hashSync('password1', 10);
    const hashedPassword2 = bcrypt.hashSync('password2', 10);
    const userStmt = db.prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
    userStmt.run("user1", hashedPassword1, "user1@example.com", "user");
    userStmt.run("user2", hashedPassword2, "user2@example.com", "user");
    userStmt.finalize();

    // Insert sample applications with UUIDs
    const appStmt = db.prepare(`INSERT INTO applications (
        id, user_id, application_name, application_status, ssn, bank_account, full_name, phone_number, address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    appStmt.run(uuidv4(), 1, "Loan Application", "Pending", "123-45-6789", "1111222233334444", "John Doe", "555-123-4567", "123 Main St, Springfield");
    appStmt.run(uuidv4(), 1, "Mortgage Application", "Approved", "123-45-6789", "4444333322221111", "John Doe", "555-123-4567", "123 Main St, Springfield");
    appStmt.run(uuidv4(), 2, "Credit Card Application", "Pending", "987-65-4321", "5555666677778888", "Jane Smith", "555-987-6543", "456 Elm St, Shelbyville");
    appStmt.run(uuidv4(), 2, "Personal Loan Application", "Rejected", "987-65-4321", "8888777766665555", "Jane Smith", "555-987-6543", "456 Elm St, Shelbyville");
    appStmt.finalize();
});

module.exports = db;

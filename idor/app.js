const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { authenticateToken, authorizeOwnership } = require('./middleware/auth');
const db = require('./database');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.use('/api', require('./routes'));

// Home route
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// Registration page
app.get("/register", (req, res) => {
    res.render("register");
});

// Protected route for applications
app.get('/applications', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const username = req.user.name;
    
    // Fetch all applications for the authenticated user
    db.all(`SELECT * FROM applications WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            console.error("Error retrieving applications:", err.message);
            return res.status(500).send("Error retrieving applications");
        }
        res.render('applications', { username, applications: rows }); // Pass applications to the EJS page
    });
});

app.get('/applications/view', authenticateToken, (req, res) => {
  const appId = req.query.appId; // Use 'appId' from the query parameter
  const username = req.user.name;

  // Query the database for the application details
  db.get(`SELECT * FROM applications WHERE id = ?`, [appId], (err, application) => {
      if (err) {
          console.error("Error fetching application:", err.message);
          return res.status(500).send("Internal Server Error");
      }
      if (!application) {
          return res.status(404).send("Application not found");
      }

      // Render the view-application page with application details
      res.render('view-application', { username, application });
  });
});


// Centralized error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

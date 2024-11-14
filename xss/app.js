const express = require('express');
const path = require('path');
const app = express();
const PORT = 8888;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware for logging requests
app.use((req, res, next) => {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}`;
    console.log(logEntry);
    next();
});

// Middleware to check if form data is valid
function validateForm(req, res, next) {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).render('error', { message: 'Name and Email are required!' });
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('form')
});

// Submit route with XSS vulnerability in the thank you page
app.post('/submit', (req, res) => {
    const { name, email } = req.body;
    res.redirect(`/thankyou?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`);
});

// Thank you page with reflected XSS vulnerability
app.get('/thankyou', (req, res) => {
    const { name, email } = req.query;
    res.render('thankyou', {name, email});
});

// Error page for invalid form submission
app.get('/main', (req, res) => {
    res.render('main');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})
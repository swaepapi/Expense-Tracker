const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // MySQL connection
const router = express.Router();
const session = require('express-session');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// --------------------- SIGNUP ROUTE ---------------------
// GET signup page
router.get('/signup', (req, res) => {
    res.render('signup'); // Render signup form (EJS)
});

// POST signup data
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('Error saving user to database');
        }
        // Redirect to login page after successful sign-up
        res.redirect('/login');
    });
});

// --------------------- LOGIN ROUTE ----------------------
// GET login page
router.get('/login', (req, res) => {
    res.render('login'); // Render login form (EJS)
});

// POST login data
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.send('No user found with this email');
        }

        const user = results[0];

        // Compare the entered password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send('Invalid password');
        }

        // Set session for the user
        req.session.userId = user.id;
        req.session.username = user.username;

        // Redirect to dashboard after successful login
        res.redirect('/dashboard');
    });
});

// --------------------- LOGOUT ROUTE ---------------------
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login'); // Redirect to login page after logout
    });
});

// --------------------- DASHBOARD ROUTE ---------------------
// GET dashboard page (only accessible if logged in)
router.get('/dashboard', isAuthenticated, (req, res) => {
    // Render the dashboard with user details
    res.render('dashboard', { username: req.session.username });
});

module.exports = router;

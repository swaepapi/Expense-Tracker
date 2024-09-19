const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database'); // Your database connection
const session = require('express-session');

// Set up express-session middleware in your app.js file like this:
// app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Route to render the signup page
router.get('/signup', (req, res) => {
    res.render('signup'); // Assumes you're using a template engine like EJS
});

// Route to render the login page
router.get('/login', (req, res) => {
    const successMessage = req.query.signupSuccess === 'true' ? 'Sign-up successful! Please log in.' : null;
    res.render('login', { successMessage }); // Pass successMessage to the login page
});

// Sign-up route (handles user registration)
router.post('/signup', async (req, res) => {
    const { email, name, password } = req.body;

    // Simple validation (you can extend this)
    if (!email || !name || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)';
        db.query(query, [email, name, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving user to the database.');
            }

            // Redirect to the login page with a success message
            res.redirect('/login?signupSuccess=true');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error during sign-up.');
    }
});

// Login route (handles user authentication)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database for the user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error querying the database.');
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(400).send('User not found.');
        }

        const user = results[0];

        try {
            // Compare the submitted password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).send('Invalid credentials.');
            }

            // Store user info in session upon successful login
            req.session.user = { id: user.id, name: user.name, email: user.email };

            // Redirect to the dashboard after login
            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error during login.');
        }
    });
});

// Dashboard route (only accessible to authenticated users)
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// Logout route to destroy the session
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out.');
        }

        res.redirect('/login');
    });
});

module.exports = router;

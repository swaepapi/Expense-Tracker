const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database'); // Your database connection
const session = require('express-session');
const { Expenses } = require('../models'); // Adjust the path based on your project structure



// Middleware to check if the user is authenticated (for dashboard access)
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Route to render the login page
router.get('/login', (req, res) => {
    const successMessage = req.query.signupSuccess === 'true' ? 'Sign-up successful! Please log in.' : null;
    res.render('login', { successMessage });  // Render the login.ejs file
});

// Route to render the signup page
router.get('/signup', (req, res) => {
    res.render('signup');  // Render the signup.ejs file
});



// Sign-up route (handles user registration)
router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    // Simple validation
    if (!email || !username || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        db.query(query, [email, username, hashedPassword], (err, result) => {
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
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Query the database for the user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'An error occurred while querying the database. Please try again later.' });
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' }); // Use 401 for unauthorized access
        }

        const user = results[0];

        try {
            // Compare the submitted password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password.' }); // Consistent messaging for unauthorized access
            }

            // Store user info in session upon successful login
            req.session.user = { id: user.id, username: user.username, email: user.email };

            // Redirect to the dashboard after login
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Error during password comparison:', error);
            return res.status(500).json({ message: 'An error occurred during login. Please try again later.' });
        }
    });
});


// Logout route
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



// Define the route for adding an expense form
router.get('/addexpense', (req, res) => {
    res.render('addexpense'); // Render the add expense form
});

// Route to handle adding an expense
router.post('/addexpense', async (req, res) => {
    try {
        const { date, amount, description } = req.body;

        // Insert the new expense into the database
        await Expenses.create({
            date: date,
            amount: amount,
            description: description
        });

        // Redirect to the expenses view page after adding the expense
        res.redirect('/view_expenses');
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).send('Error adding expense');
    }
});

// Route to view all expenses
router.get('/view_expenses', async (req, res) => {
    try {
        // Fetch all expenses from the database
        const expenses = await Expenses.findAll();

        // Render the view and pass the expenses data
        res.render('view_expenses', { expenses });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).send('Error fetching expenses');
    }
});



// Route to render the dashboard page (only accessible to authenticated users)
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        // Fetch all expenses for the current user from the database
        const expenses = await Expenses.findAll({ where: { id: req.session.user.id } });

        // Prepare the chart data from expenses (this assumes you have date, amount, description in the model)
        const chartData = expenses.map(expense => ({
            date: expense.date,
            amount: expense.amount,
            description: expense.description
        }));

        // Render the dashboard, passing both the user and chartData
        res.render('dashboard', { user: req.session.user, chartData });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).send('Error loading dashboard');
    }
});


  

module.exports = router;

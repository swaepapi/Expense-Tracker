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


// Route to handle user logout
router.get('/logout', (req, res) => {
    // Destroy the session (or do session-related cleanup)
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session during logout:', err);
            return res.status(500).send('Error logging out');
        }
        // Redirect the user to the login page after successful logout
        res.redirect('/login');
    });
});

// Define the route for adding an expense form
router.get('/addexpense', (req, res) => {
    res.render('addexpense'); // Render the add expense form
});

// Route to handle adding an expense
router.post('/addexpense', isAuthenticated, async (req, res) => {
    try {
        const { date, amount, description } = req.body;

        // Fetch the userId from the logged-in user's session
        const userId = req.session.user.id; 

        // Insert the new expense into the database, including the userId
        await Expenses.create({
            date: date,
            amount: amount,
            description: description,
            userId: userId  // Include the userId when creating the expense
        });

        // Redirect to the expenses view page after adding the expense
        res.redirect('/view_expenses');
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).send('Error adding expense');
    }
});


// Route to view all expenses for the logged-in user
router.get('/view_expenses', async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.session.user) {
            return res.status(401).send('Unauthorized: Please log in to view your expenses');
        }

        // Fetch expenses only for the current logged-in user
        const expenses = await Expenses.findAll({
            where: { userId: req.session.user.id },  // Filter by the logged-in user's ID
            order: [['date', 'ASC']]  // Optional: Order by date
        });

        // Check if there are any expenses for this user
        if (!expenses || expenses.length === 0) {
            return res.render('view_expenses', {
                user: req.session.user,
                expenses: [],
                message: 'No expenses found for this user.'
            });
        }

        // Render the view and pass the user's expenses
        res.render('view_expenses', {
            user: req.session.user,
            expenses
        });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).send('Error fetching expenses');
    }
});




// Route to render the dashboard page (only accessible to authenticated users)
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        // Fetch all expenses for the current user, ordered by date
        const expenses = await Expenses.findAll({
            where: { userId: req.session.user.id }, // Use userId to fetch the correct expenses
            order: [['date', 'ASC']] // Order by date in ascending order
        });

        // Check if expenses array is populated
        if (!expenses || expenses.length === 0) {
            return res.render('dashboard', {
                user: req.session.user,
                totalExpenses: 0,
                chartData: [], // Empty chart data if no expenses
                message: 'No expenses found for this user.'
            });
        }

        // Calculate the total expenses for the current user
        const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

        // Prepare chart data for both the line chart and pie chart
        const chartData = {
            lineChartData: expenses.map(expense => ({
                date: expense.date,
                amount: expense.amount,
            })),
            pieChartData: expenses.map(expense => ({
                description: expense.description,
                amount: expense.amount
            }))
        };

        // Render the dashboard, passing user details, total expenses, and chart data
        res.render('dashboard', {
            user: req.session.user,
            totalExpenses: totalExpenses || 0, // Handle case where totalExpenses is undefined
            chartData: chartData // Pass both line and pie chart data
        });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).send('Error loading dashboard');
    }
});



  

module.exports = router;

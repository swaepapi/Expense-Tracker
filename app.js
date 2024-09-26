const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const db = require('./config/database'); // Your database connection

const app = express();

// To handle JSON data
app.use(express.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views folder location
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware to handle form submissions
app.use(express.urlencoded({ extended: false }));

// Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up express-session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Import your routes
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Error handling middleware (optional, but recommended)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Set the port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


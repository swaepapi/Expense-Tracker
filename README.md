# Expense Tracker

## Overview

The **Expense Tracker** is a web-based application designed to help users manage and track their daily expenses efficiently. Built using modern technologies such as JavaScript, EJS, Node.js, Express, and MySQL, this application offers a seamless and user-friendly experience for budgeting and expense management.

## Features

- **User Authentication**: Secure user registration and login functionality to ensure data privacy.
- **Expense Management**: Add, edit, and delete expenses, categorized by type (e.g., food, transportation, entertainment).
- **Dashboard**: Visualize your spending habits through charts and graphs, providing insights into your financial health.
- **Expense Reports**: Generate reports for specific time periods to track spending patterns.
- **Responsive Design**: Accessible on any device, ensuring a consistent experience across desktops, tablets, and mobile phones.

## Technologies Used

### Frontend
- **JavaScript**: For dynamic client-side interactions and logic.
- **EJS (Embedded JavaScript)**: Templating engine for rendering HTML with embedded JavaScript code.
- **CSS**: Styling the application for a clean and intuitive user interface.

### Backend
- **Node.js**: Server-side JavaScript runtime used to build scalable network applications.
- **Express.js**: Fast, unopinionated, and minimalist web framework for Node.js, managing routes, middleware, and HTTP requests.
- **MySQL**: Relational database management system to store and retrieve user and expense data.

## Project Structure

```plaintext
/expense-tracker
|-- /config          # Configuration files (e.g., database connection)
|-- /controllers     # Request handling logic
|-- /models          # Database schemas and models
|-- /routes          # API and application routes
|-- /views           # EJS templates for rendering HTML
|-- /public          # Static files (CSS, JavaScript, images)
|-- /middleware      # Custom middleware functions
|-- app.js           # Main application entry point
|-- package.json     # Project dependencies and scripts

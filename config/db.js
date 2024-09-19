const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SQL@swaepapi24',
    database: 'expense_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database: expense_db');
});

module.exports = connection;

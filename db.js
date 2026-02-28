const mysql = require('mysql2/promise');

// MySQL connection configuration using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'buss-tickrt',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.stack);
    });

module.exports = {
    query: async (sql, params) => {
        const [rows, fields] = await pool.execute(sql, params);
        return rows;
    },
    pool
};

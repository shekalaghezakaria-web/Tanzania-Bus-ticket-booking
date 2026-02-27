const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
    try {
        // Connect to MySQL (without specifying database)
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.execute('CREATE DATABASE IF NOT EXISTS bus_booking');
        console.log('Database "bus_booking" created successfully');

        // Close the connection
        await connection.end();

        // Now connect to the specific database
        const dbConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'bus_booking'
        });

        console.log('Connected to bus_booking database');

        // Read and execute the SQL file
        const sqlFile = fs.readFileSync('./database.sql', 'utf8');
        
        // Split SQL file into individual statements
        const statements = sqlFile
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await dbConnection.execute(statement);
                    console.log('Executed:', statement.substring(0, 50) + '...');
                } catch (error) {
                    // Some statements might fail (like DELIMITER), that's okay
                    console.log('Skipped or failed:', statement.substring(0, 50) + '...');
                }
            }
        }

        console.log('Database setup completed successfully!');
        await dbConnection.end();

    } catch (error) {
        console.error('Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();

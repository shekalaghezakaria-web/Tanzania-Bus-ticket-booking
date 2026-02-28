const mysql = require('mysql2/promise');

async function checkDatabases() {
    try {
        console.log('🔍 Checking available databases...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('Available databases:');
        databases.forEach(db => console.log(`- ${db.Database}`));
        
        await connection.end();
        
    } catch (error) {
        console.error('🚨 Error checking databases:', error.message);
    }
}

checkDatabases();

const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportDatabase() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bus_booking'
        });

        console.log('Connected to database');

        // Get all tables
        const [tables] = await connection.execute('SHOW TABLES');
        
        let sql = '';
        
        // Export each table
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`Exporting table: ${tableName}`);
            
            // Get table structure
            const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
            
            // Get table data
            const [data] = await connection.execute(`SELECT * FROM ${tableName}`);
            
            sql += `-- Table: ${tableName}\n`;
            sql += `DROP TABLE IF EXISTS ${tableName};\n`;
            sql += `CREATE TABLE ${tableName} (\n`;
            
            // Add columns
            structure.forEach((col, index) => {
                sql += `  ${col.Field} ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`;
                if (index < structure.length - 1) sql += ',\n';
                else sql += '\n';
            });
            
            sql += `);\n\n`;
            
            // Add data
            if (data.length > 0) {
                sql += `-- Data for table: ${tableName}\n`;
                data.forEach(row => {
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (typeof val === 'number') return val;
                        return `'${val}'`;
                    });
                    sql += `INSERT INTO ${tableName} VALUES (${values.join(', ')});\n`;
                });
                sql += '\n';
            }
        }

        // Write to file
        fs.writeFileSync('database-export.sql', sql);
        console.log('Database exported to database-export.sql');
        
        await connection.end();
        
    } catch (error) {
        console.error('Error exporting database:', error);
    }
}

exportDatabase();

const mysql = require('mysql2/promise');

async function simpleSetup() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'bus_booking'
        });

        console.log('Connected to bus_booking database');

        // Create tables one by one
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS routes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                from_location VARCHAR(100) NOT NULL,
                to_location VARCHAR(100) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                distance_km INT,
                estimated_hours DECIMAL(3,1),
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS buses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                route_id INT,
                bus_name VARCHAR(100) NOT NULL,
                bus_type VARCHAR(50) DEFAULT 'Standard',
                departure_time TIME NOT NULL,
                arrival_time TIME,
                total_seats INT DEFAULT 40,
                available_seats INT DEFAULT 40,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS seats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bus_id INT,
                seat_number VARCHAR(5) NOT NULL,
                seat_type VARCHAR(20) DEFAULT 'Standard',
                is_booked TINYINT(1) DEFAULT 0,
                is_blocked TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_bus_seat (bus_id, seat_number),
                FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                bus_id INT,
                seat_number VARCHAR(5) NOT NULL,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                travel_date DATE,
                status VARCHAR(20) DEFAULT 'confirmed',
                payment_status VARCHAR(20) DEFAULT 'pending',
                total_amount DECIMAL(10,2) NOT NULL,
                confirmation_code VARCHAR(10) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
            )
        `);

        // Insert sample routes
        await connection.execute(`
            INSERT IGNORE INTO routes (from_location, to_location, price, distance_km, estimated_hours) VALUES
            ('Dar es Salaam', 'Mwanza', 85000, 1140, 12.5),
            ('Mwanza', 'Dar es Salaam', 85000, 1140, 12.5),
            ('Mbeya', 'Dar es Salaam', 75000, 850, 10),
            ('Dar es Salaam', 'Mbeya', 75000, 850, 10),
            ('Dodoma', 'Mbeya', 65000, 650, 8.5),
            ('Mbeya', 'Dodoma', 65000, 650, 8.5),
            ('Mbeya', 'Arusha', 70000, 750, 9),
            ('Arusha', 'Mbeya', 70000, 750, 9),
            ('Morogoro', 'Tanga', 45000, 280, 4.5),
            ('Tanga', 'Morogoro', 45000, 280, 4.5)
        `);

        // Insert sample buses
        await connection.execute(`
            INSERT IGNORE INTO buses (route_id, bus_name, bus_type, departure_time, arrival_time) VALUES
            (1, 'Kilimanjaro Express', 'Luxury', '08:00:00', '20:30:00'),
            (1, 'Meru Bus Service', 'Standard', '14:00:00', '02:30:00'),
            (2, 'Victoria Coach', 'Luxury', '06:30:00', '19:00:00')
        `);

        // Generate seats for each bus
        const [buses] = await connection.execute('SELECT id FROM buses');
        
        for (const bus of buses) {
            for (let row = 1; row <= 10; row++) {
                const seatRow = String(row).padStart(2, '0');
                await connection.execute(`
                    INSERT IGNORE INTO seats (bus_id, seat_number, seat_type) VALUES
                    (?, ?, 'Window'),
                    (?, ?, 'Window'),
                    (?, ?, 'Aisle'),
                    (?, ?, 'Aisle')
                `, [bus.id, `${seatRow}A`, bus.id, `${seatRow}B`, bus.id, `${seatRow}C`, bus.id, `${seatRow}D`]);
            }
        }

        console.log('Database setup completed successfully!');
        console.log(`Created ${buses.length} buses with 40 seats each`);
        
        await connection.end();

    } catch (error) {
        console.error('Database setup failed:', error.message);
        process.exit(1);
    }
}

simpleSetup();

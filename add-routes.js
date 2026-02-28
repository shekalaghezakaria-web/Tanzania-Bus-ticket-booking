const mysql = require('mysql2/promise');

async function addMoreRoutes() {
    try {
        console.log('🌍 Adding more routes to database...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'safaribus'
        });
        
        // Routes to add
        const routes = [
            { from_location: 'Dar es Salaam', to_location: 'Dodoma', price: 50000 },
            { from_location: 'Dar es Salaam', to_location: 'Arusha', price: 65000 },
            { from_location: 'Dar es Salaam', to_location: 'Tanga', price: 35000 },
            { from_location: 'Dar es Salaam', to_location: 'Morogoro', price: 40000 },
            { from_location: 'Dodoma', to_location: 'Arusha', price: 45000 },
            { from_location: 'Arusha', to_location: 'Tanga', price: 55000 },
            { from_location: 'Morogoro', to_location: 'Dodoma', price: 30000 }
        ];
        
        for (const route of routes) {
            console.log(`Adding route: ${route.from_location} to ${route.to_location}`);
            
            const [result] = await connection.execute(
                'INSERT INTO routes (from_location, to_location, price) VALUES (?, ?, ?)',
                [route.from_location, route.to_location, route.price]
            );
            
            const routeId = result.insertId;
            console.log(`✅ Route added with ID: ${routeId}`);
            
            // Add 2 buses for each route
            for (let i = 1; i <= 2; i++) {
                const busName = `${route.from_location} Express ${i}`;
                const departureTime = `${6 + i}:00:00`;
                
                const [busResult] = await connection.execute(
                    'INSERT INTO buses (bus_name, departure_time, route_id, price) VALUES (?, ?, ?, ?)',
                    [busName, departureTime, routeId, route.price]
                );
                
                const busId = busResult.insertId;
                console.log(`✅ Bus added: ${busName} (ID: ${busId})`);
                
                // Add 40 seats for each bus
                for (let row = 1; row <= 10; row++) {
                    for (let col = 1; col <= 4; col++) {
                        const seatNumber = `${row.toString().padStart(2, '0')}${String.fromCharCode(64 + col)}`;
                        const isBooked = Math.random() < 0.2 ? 1 : 0; // 20% chance of being booked
                        
                        await connection.execute(
                            'INSERT INTO seats (bus_id, seat_number, is_booked) VALUES (?, ?, ?)',
                            [busId, seatNumber, isBooked]
                        );
                    }
                }
                
                console.log(`✅ 40 seats added for bus ${busName}`);
            }
        }
        
        console.log('🎉 All routes and seats added successfully!');
        
        await connection.end();
        
    } catch (error) {
        console.error('🚨 Error adding routes:', error.message);
    }
}

addMoreRoutes();

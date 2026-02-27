const mysql = require('mysql2/promise');

async function addMoreBuses() {
    try {
        // Connect to database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'bus_booking'
        });

        console.log('Connected to bus_booking database');

        // Add more buses for each route
        const busesToAdd = [
            // Route 1: Dar es Salaam → Mwanza
            { route_id: 1, bus_name: 'Safari Express', bus_type: 'Luxury', departure_time: '06:00:00', arrival_time: '18:30:00' },
            { route_id: 1, bus_name: 'Tanzania Coach', bus_type: 'Standard', departure_time: '10:00:00', arrival_time: '22:30:00' },
            { route_id: 1, bus_name: 'Kilimanjaro Bus', bus_type: 'Luxury', departure_time: '16:00:00', arrival_time: '04:30:00' },
            { route_id: 1, bus_name: 'Mwanza Express', bus_type: 'Standard', departure_time: '20:00:00', arrival_time: '08:30:00' },
            
            // Route 2: Mwanza → Dar es Salaam
            { route_id: 2, bus_name: 'Victoria Express', bus_type: 'Luxury', departure_time: '07:00:00', arrival_time: '19:30:00' },
            { route_id: 2, bus_name: 'Lake Coach', bus_type: 'Standard', departure_time: '11:00:00', arrival_time: '23:30:00' },
            { route_id: 2, bus_name: 'Safari Link', bus_type: 'Luxury', departure_time: '15:00:00', arrival_time: '03:30:00' },
            { route_id: 2, bus_name: 'Northern Star', bus_type: 'Standard', departure_time: '19:00:00', arrival_time: '07:30:00' },
            
            // Route 3: Mbeya → Dar es Salaam
            { route_id: 3, bus_name: 'Southern Express', bus_type: 'Luxury', departure_time: '05:30:00', arrival_time: '15:30:00' },
            { route_id: 3, bus_name: 'Highland Coach', bus_type: 'Standard', departure_time: '09:00:00', arrival_time: '19:00:00' },
            { route_id: 3, bus_name: 'Mbeya Link', bus_type: 'Luxury', departure_time: '13:00:00', arrival_time: '23:00:00' },
            { route_id: 3, bus_name: 'Southern Star', bus_type: 'Standard', departure_time: '17:00:00', arrival_time: '03:00:00' },
            
            // Route 4: Dar es Salaam → Mbeya
            { route_id: 4, bus_name: 'Northern Express', bus_type: 'Luxury', departure_time: '06:30:00', arrival_time: '16:30:00' },
            { route_id: 4, bus_name: 'Central Coach', bus_type: 'Standard', departure_time: '10:30:00', arrival_time: '20:30:00' },
            { route_id: 4, bus_name: 'Highland Link', bus_type: 'Luxury', departure_time: '14:30:00', arrival_time: '00:30:00' },
            { route_id: 4, bus_name: 'Mbeya Star', bus_type: 'Standard', departure_time: '18:30:00', arrival_time: '04:30:00' },
            
            // Route 5: Dodoma → Mbeya
            { route_id: 5, bus_name: 'Central Express', bus_type: 'Luxury', departure_time: '07:00:00', arrival_time: '15:30:00' },
            { route_id: 5, bus_name: 'Capital Coach', bus_type: 'Standard', departure_time: '11:00:00', arrival_time: '19:30:00' },
            { route_id: 5, bus_name: 'Dodoma Link', bus_type: 'Luxury', departure_time: '15:00:00', arrival_time: '23:30:00' },
            
            // Route 6: Mbeya → Dodoma
            { route_id: 6, bus_name: 'Southern Central', bus_type: 'Luxury', departure_time: '08:00:00', arrival_time: '16:30:00' },
            { route_id: 6, bus_name: 'Highland Central', bus_type: 'Standard', departure_time: '12:00:00', arrival_time: '20:30:00' },
            { route_id: 6, bus_name: 'Mbeya Central', bus_type: 'Luxury', departure_time: '16:00:00', arrival_time: '00:30:00' },
            
            // Route 7: Mbeya → Arusha
            { route_id: 7, bus_name: 'Northern Southern', bus_type: 'Luxury', departure_time: '06:00:00', arrival_time: '15:00:00' },
            { route_id: 7, bus_name: 'Highland Northern', bus_type: 'Standard', departure_time: '10:00:00', arrival_time: '19:00:00' },
            { route_id: 7, bus_name: 'Mbeya Arusha', bus_type: 'Luxury', departure_time: '14:00:00', arrival_time: '23:00:00' },
            
            // Route 8: Arusha → Mbeya
            { route_id: 8, bus_name: 'Meru Express', bus_type: 'Luxury', departure_time: '07:30:00', arrival_time: '16:30:00' },
            { route_id: 8, bus_name: 'Kilimanjaro Link', bus_type: 'Standard', departure_time: '11:30:00', arrival_time: '20:30:00' },
            { route_id: 8, bus_name: 'Arusha Mbeya', bus_type: 'Luxury', departure_time: '15:30:00', arrival_time: '00:30:00' },
            
            // Route 9: Morogoro → Tanga
            { route_id: 9, bus_name: 'Coastal Express', bus_type: 'Luxury', departure_time: '08:00:00', arrival_time: '12:30:00' },
            { route_id: 9, bus_name: 'Eastern Coach', bus_type: 'Standard', departure_time: '12:00:00', arrival_time: '16:30:00' },
            { route_id: 9, bus_name: 'Morogoro Tanga', bus_type: 'Luxury', departure_time: '16:00:00', arrival_time: '20:30:00' },
            
            // Route 10: Tanga → Morogoro
            { route_id: 10, bus_name: 'Tanga Express', bus_type: 'Luxury', departure_time: '09:00:00', arrival_time: '13:30:00' },
            { route_id: 10, bus_name: 'Coastal Link', bus_type: 'Standard', departure_time: '13:00:00', arrival_time: '17:30:00' },
            { route_id: 10, bus_name: 'Eastern Star', bus_type: 'Luxury', departure_time: '17:00:00', arrival_time: '21:30:00' }
        ];

        console.log(`Adding ${busesToAdd.length} new buses...`);

        for (const bus of busesToAdd) {
            await connection.execute(`
                INSERT INTO buses (route_id, bus_name, bus_type, departure_time, arrival_time)
                VALUES (?, ?, ?, ?, ?)
            `, [bus.route_id, bus.bus_name, bus.bus_type, bus.departure_time, bus.arrival_time]);
            
            // Get the newly inserted bus ID
            const [result] = await connection.execute('SELECT LAST_INSERT_ID() as bus_id');
            const busId = result[0].bus_id;
            
            // Generate 40 seats for this bus
            for (let row = 1; row <= 10; row++) {
                const seatRow = String(row).padStart(2, '0');
                await connection.execute(`
                    INSERT IGNORE INTO seats (bus_id, seat_number, seat_type) VALUES
                    (?, ?, 'Window'),
                    (?, ?, 'Window'),
                    (?, ?, 'Aisle'),
                    (?, ?, 'Aisle')
                `, [busId, `${seatRow}A`, busId, `${seatRow}B`, busId, `${seatRow}C`, busId, `${seatRow}D`]);
            }
            
            console.log(`Added bus: ${bus.bus_name} for route ${bus.route_id} with 40 seats`);
        }

        // Check total buses now
        const [buses] = await connection.execute('SELECT COUNT(*) as total FROM buses');
        const [seats] = await connection.execute('SELECT COUNT(*) as total FROM seats');
        
        console.log(`\n✅ Success!`);
        console.log(`📊 Total buses now: ${buses[0].total}`);
        console.log(`🪑 Total seats now: ${seats[0].total}`);
        console.log(`🚌 Added ${busesToAdd.length} new buses with ${busesToAdd.length * 40} seats`);

        await connection.end();

    } catch (error) {
        console.error('Error adding buses:', error.message);
        process.exit(1);
    }
}

addMoreBuses();

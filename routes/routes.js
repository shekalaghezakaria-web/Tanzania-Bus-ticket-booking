const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all available routes
router.get('/', async (req, res) => {
    try {
        const routes = await db.query(`
            SELECT r.id, r.from_location, r.to_location, r.price,
                   COUNT(b.id) as bus_count
            FROM routes r
            LEFT JOIN buses b ON r.id = b.route_id
            GROUP BY r.id, r.from_location, r.to_location, r.price
            ORDER BY r.from_location, r.to_location
        `);

        res.json({ routes: routes[0] });

    } catch (error) {
        console.error('Routes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get buses for a specific route
router.get('/:routeId/buses', async (req, res) => {
    try {
        const { routeId } = req.params;

        const buses = await db.query(`
            SELECT b.id, b.bus_name, b.departure_time,
                   r.from_location, r.to_location, r.price
            FROM buses b
            JOIN routes r ON b.route_id = r.id
            WHERE b.route_id = ?
            ORDER BY b.departure_time
        `, [routeId]);

        res.json({ buses: buses[0] });

    } catch (error) {
        console.error('Buses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get available seats for a specific bus
router.get('/buses/:busId/seats', async (req, res) => {
    try {
        const { busId } = req.params;

        const seats = await db.query(`
            SELECT s.seat_number, s.is_booked
            FROM seats s
            WHERE s.bus_id = ?
            ORDER BY s.seat_number
        `, [busId]);

        // Get bus details
        const busDetails = await db.query(`
            SELECT b.id, b.bus_name, b.departure_time,
                   r.from_location, r.to_location, r.price
            FROM buses b
            JOIN routes r ON b.route_id = r.id
            WHERE b.id = ?
        `, [busId]);

        res.json({
            bus: busDetails[0][0],
            seats: seats[0],
            debug: {
                busDetails: busDetails,
                seats: seats,
                busId: busId
            }
        });

    } catch (error) {
        console.error('Seats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get route by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const route = await db.query(`
            SELECT r.*, COUNT(b.id) as bus_count
            FROM routes r
            LEFT JOIN buses b ON r.id = b.route_id
            WHERE r.id = ?
            GROUP BY r.id
        `, [id]);

        if (route[0].length === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }

        res.json({ route: route[0][0] });

    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

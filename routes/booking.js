const express = require('express');
const { verifyToken } = require('./middleware');
const db = require('../db');

const router = express.Router();

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const { bus_id, seat_number } = req.body;
        const user_id = req.user.userId;

        console.log('Booking request body:', req.body);
        console.log('User ID:', user_id);

        // Validate input
        if (!bus_id || !seat_number) {
            console.log('Validation failed:', { bus_id, seat_number });
            return res.status(400).json({ error: 'Bus ID and seat number are required' });
        }

        // Check if seat exists and is available
        const seatCheck = await db.query(
            'SELECT * FROM seats WHERE bus_id = ? AND seat_number = ?',
            [bus_id, seat_number]
        );

        if (seatCheck[0].length === 0) {
            return res.status(404).json({ error: 'Seat not found' });
        }

        if (seatCheck[0][0].is_booked) {
            return res.status(400).json({ error: 'Seat is already booked' });
        }

        // Create booking
        const booking = await db.query(`
            INSERT INTO bookings (user_id, bus_id, seat_number)
            VALUES (?, ?, ?)
        `, [user_id, bus_id, seat_number]);

        // Update seat status
        await db.query(
            'UPDATE seats SET is_booked = 1 WHERE bus_id = ? AND seat_number = ?',
            [bus_id, seat_number]
        );

        // Get booking details
        const bookingDetails = await db.query(`
            SELECT b.id, b.booking_date, b.status,
                   u.full_name, u.phone,
                   bus.bus_name, bus.departure_time,
                   r.from_location, r.to_location, r.price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN buses bus ON b.bus_id = bus.id
            JOIN routes r ON bus.route_id = r.id
            WHERE b.id = ?
        `, [booking[0].insertId]);

        res.status(201).json({
            message: 'Booking successful',
            booking: bookingDetails[0][0]
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const user_id = req.user.userId;

        const bookings = await db.query(`
            SELECT b.id, b.booking_date, b.status, b.seat_number,
                   bus.bus_name, bus.departure_time,
                   r.from_location, r.to_location, r.price
            FROM bookings b
            JOIN buses bus ON b.bus_id = bus.id
            JOIN routes r ON bus.route_id = r.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `, [user_id]);

        res.json({ bookings: bookings[0] });

    } catch (error) {
        console.error('My bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get booking details by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        const booking = await db.query(`
            SELECT b.id, b.booking_date, b.status, b.seat_number,
                   u.full_name, u.phone,
                   bus.bus_name, bus.departure_time,
                   r.from_location, r.to_location, r.price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN buses bus ON b.bus_id = bus.id
            JOIN routes r ON bus.route_id = r.id
            WHERE b.id = ?
        `, [id]);

        if (booking[0].length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ booking: booking[0][0] });

    } catch (error) {
        console.error('Booking details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel booking
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        // Get booking details
        const booking = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (booking[0].length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update seat status to available
        await db.query(
            'UPDATE seats SET is_booked = 0 WHERE bus_id = ? AND seat_number = ?',
            [booking[0][0].bus_id, booking[0][0].seat_number]
        );

        // Delete booking
        await db.query(
            'DELETE FROM bookings WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        res.json({ message: 'Booking cancelled successfully' });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all bookings (admin only - for demonstration)
router.get('/', async (req, res) => {
    try {
        const bookings = await db.query(`
            SELECT b.id, b.booking_date, b.status, b.seat_number,
                   u.full_name, u.phone,
                   bus.bus_name, bus.departure_time,
                   r.from_location, r.to_location, r.price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN buses bus ON b.bus_id = bus.id
            JOIN routes r ON bus.route_id = r.id
            ORDER BY b.booking_date DESC
            LIMIT 50
        `);

        res.json({ bookings: bookings[0] });

    } catch (error) {
        console.error('All bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

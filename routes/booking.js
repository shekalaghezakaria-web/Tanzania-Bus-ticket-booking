const express = require('express');
const { verifyToken } = require('./middleware');
const db = require('../db');

const router = express.Router();

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('🎫 Booking request received');
        console.log('👤 User:', req.user);
        console.log('📦 Request body:', req.body);
        console.log('📦 Request body type:', typeof req.body);
        console.log('📦 Request body keys:', Object.keys(req.body || {}));
        console.log('📦 Request headers:', req.headers);
        
        const { bus_id, seat_number, price, travel_date, route } = req.body;
        const user_id = req.user.userId;

        console.log('📊 Extracted data:', { user_id, bus_id, seat_number, price, travel_date, route });
        console.log('📊 Data types:', {
            user_id: typeof user_id,
            bus_id: typeof bus_id,
            seat_number: typeof seat_number,
            price: typeof price,
            travel_date: typeof travel_date,
            route: typeof route
        });

        // Check for undefined values specifically
        const undefinedFields = [];
        if (user_id === undefined) undefinedFields.push('user_id');
        if (bus_id === undefined) undefinedFields.push('bus_id');
        if (seat_number === undefined) undefinedFields.push('seat_number');
        if (price === undefined) undefinedFields.push('price');
        if (travel_date === undefined) undefinedFields.push('travel_date');
        if (route === undefined) undefinedFields.push('route');

        if (undefinedFields.length > 0) {
            console.error('❌ Undefined fields detected:', undefinedFields);
            return res.status(400).json({
                success: false,
                error: 'Undefined fields in request',
                details: undefinedFields
            });
        }

        // Validate required fields
        const validationErrors = [];
        
        if (!user_id) {
            validationErrors.push('User ID is required');
        }
        if (!bus_id) {
            validationErrors.push('Bus ID is required');
        }
        if (!seat_number) {
            validationErrors.push('Seat number is required');
        }
        if (!price) {
            validationErrors.push('Price is required');
        }
        if (!travel_date) {
            validationErrors.push('Travel date is required');
        }
        if (!route) {
            validationErrors.push('Route information is required');
        }
        
        // Validate data types
        if (bus_id && isNaN(Number(bus_id))) {
            validationErrors.push('Bus ID must be a number');
        }
        if (price && isNaN(Number(price))) {
            validationErrors.push('Price must be a number');
        }
        if (seat_number && typeof seat_number !== 'string') {
            validationErrors.push('Seat number must be a string');
        }
        
        if (validationErrors.length > 0) {
            console.log('❌ Validation failed:', validationErrors);
            return res.status(400).json({ 
                success: false,
                error: 'Validation failed',
                details: validationErrors
            });
        }

        console.log('✅ Validation passed');

        // Check if seat exists and is available for this specific travel date
        console.log('🔍 Checking seat availability for travel date...');
        
        // Check if seat exists
        const seatCheck = await db.query(
            'SELECT * FROM seats WHERE bus_id = ? AND seat_number = ?',
            [bus_id, seat_number]
        );

        console.log('🔍 Seat check result:', seatCheck);
        console.log('🔍 Seat check result type:', typeof seatCheck);
        console.log('🔍 Seat check result length:', seatCheck?.length);

        if (!seatCheck || seatCheck.length === 0) {
            console.log('❌ Seat not found');
            return res.status(404).json({ 
                success: false,
                error: 'Seat not found' 
            });
        }

        // Handle different response formats from the database
        let seatData;
        if (Array.isArray(seatCheck) && seatCheck.length > 0) {
            if (Array.isArray(seatCheck[0]) && seatCheck[0].length > 0) {
                seatData = seatCheck[0][0];
            } else {
                seatData = seatCheck[0];
            }
        } else {
            console.log('❌ Unexpected seat data format:', seatCheck);
            return res.status(500).json({ 
                success: false,
                error: 'Unexpected seat data format',
                debug: seatCheck
            });
        }
        
        console.log('🔍 Extracted seat data:', seatData);
        
        if (!seatData) {
            console.log('❌ No seat data found after extraction');
            return res.status(404).json({ 
                success: false,
                error: 'Seat not found' 
            });
        }
        
        if (seatData.is_booked) {
            console.log('❌ Seat is already permanently booked');
            return res.status(400).json({ 
                success: false,
                error: 'Seat is already booked' 
            });
        }

        // Check if seat is already booked for this specific travel date
        console.log('🔍 Checking if seat is booked for travel date:', travel_date);
        const existingBooking = await db.query(`
            SELECT * FROM bookings 
            WHERE bus_id = ? AND seat_number = ? AND travel_date = ?
        `, [bus_id, seat_number, travel_date]);

        console.log('🔍 Existing booking check:', existingBooking);

        if (existingBooking && existingBooking.length > 0 && existingBooking[0].length > 0) {
            console.log('❌ Seat is already booked for this travel date');
            return res.status(400).json({ 
                success: false,
                error: 'Seat is already booked for this travel date',
                message: 'Seat is already booked'
            });
        }

        console.log('✅ Seat is available for booking');

        // Create booking
        console.log('🎫 Creating booking with data:', { user_id, bus_id, seat_number, price, travel_date });
        
        // Final safety check before database insertion
        const safeBookingData = {
            user_id: user_id || null,
            bus_id: bus_id || null,
            seat_number: seat_number || null,
            price: price || 0,
            travel_date: travel_date || null
        };
        
        console.log('🛡️ Safe booking data:', safeBookingData);
        
        try {
            const booking = await db.query(`
                INSERT INTO bookings (user_id, bus_id, seat_number, total_amount, travel_date)
                VALUES (?, ?, ?, ?, ?)
            `, [safeBookingData.user_id, safeBookingData.bus_id, safeBookingData.seat_number, safeBookingData.price, safeBookingData.travel_date]);

            console.log('✅ Booking created:', booking);
            console.log('📋 Booking response type:', typeof booking);
            console.log('📋 Booking response keys:', Object.keys(booking || {}));
            
            // Get booking ID - handle different response formats
            let bookingId;
            if (booking && booking.insertId !== undefined) {
                bookingId = booking.insertId;
            } else if (booking && booking[0] && booking[0].insertId !== undefined) {
                bookingId = booking[0].insertId;
            } else if (booking && booking.length > 0 && booking[0] && booking[0].insertId) {
                bookingId = booking[0].insertId;
            } else {
                // Try to get the last inserted ID
                const lastInsert = await db.query('SELECT LAST_INSERT_ID() as id');
                console.log('📋 Last insert result:', lastInsert);
                bookingId = lastInsert[0] ? lastInsert[0][0].id : null;
            }
            
            console.log('📋 Final booking ID:', bookingId);
            
            if (!bookingId) {
                console.error('❌ No booking ID returned');
                return res.status(500).json({ 
                    success: false,
                    error: 'Failed to create booking - no ID returned',
                    debug: booking
                });
            }

            // Update seat status
            console.log('🔄 Updating seat status...');
            try {
                const seatUpdate = await db.query(
                    'UPDATE seats SET is_booked = 1 WHERE bus_id = ? AND seat_number = ?',
                    [bus_id, seat_number]
                );
                console.log('✅ Seat status updated:', seatUpdate);
            } catch (seatError) {
                console.error('❌ Seat update failed:', seatError);
                // Continue with booking even if seat update fails
            }

            // Get booking details (simplified)
            console.log('📋 Getting booking details...');
            try {
                const bookingDetails = await db.query(`
                    SELECT b.id, b.booking_date, b.status, b.seat_number, b.total_amount
                    FROM bookings b
                    WHERE b.id = ?
                `, [bookingId]);

                console.log('📋 Booking details:', bookingDetails);

                const bookingData = bookingDetails[0][0] || bookingDetails[0];
                
                console.log('✅ Booking completed successfully:', bookingData);
                
                res.status(201).json({
                    success: true,
                    message: 'Booking successful',
                    booking: bookingData
                });
            } catch (detailsError) {
                console.error('❌ Booking details failed:', detailsError);
                // Return basic booking info
                res.status(201).json({
                    success: true,
                    message: 'Booking successful',
                    booking: {
                        id: bookingId,
                        seat_number: seat_number,
                        total_amount: price,
                        travel_date: travel_date,
                        status: 'confirmed'
                    }
                });
            }

        } catch (bookingError) {
            console.error('❌ Booking creation failed:', bookingError);
            console.error('❌ Booking error details:', {
                message: bookingError.message,
                sqlMessage: bookingError.sqlMessage,
                sqlState: bookingError.sqlState,
                errno: bookingError.errno,
                code: bookingError.code
            });
            
            // Check for duplicate entry error
            if (bookingError.code === 'ER_DUP_ENTRY' || bookingError.errno === 1062) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Duplicate booking',
                    message: 'This seat is already booked for the selected travel date'
                });
            }
            
            return res.status(500).json({ 
                success: false,
                error: 'Failed to create booking',
                details: process.env.NODE_ENV === 'development' ? bookingError.message : 'Internal server error',
                sqlError: bookingError.sqlMessage
            });
        }

    } catch (error) {
        console.error('🚨 General booking error:', error);
        console.error('🚨 Error stack:', error.stack);
        console.error('🚨 Error details:', {
            message: error.message,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            errno: error.errno,
            code: error.code
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const user_id = req.user.userId;
        console.log('🔍 Fetching bookings for user:', user_id);

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

        console.log('📋 Bookings data:', bookings);

        res.json({ bookings: bookings });

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
            SELECT b.id, b.booking_date, b.status, b.seat_number, b.total_amount,
                   u.full_name, u.phone,
                   bus.bus_name, bus.departure_time,
                   r.from_location, r.to_location, r.price
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN buses bus ON b.bus_id = bus.id
            JOIN routes r ON bus.route_id = r.id
            WHERE b.id = ? AND b.user_id = ?
        `, [id, user_id]);

        if (!booking || booking.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ booking: booking[0] });

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

        res.json({ bookings: bookings });

    } catch (error) {
        console.error('All bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

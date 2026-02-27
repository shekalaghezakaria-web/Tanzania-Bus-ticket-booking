const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middleware');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = 'your-secret-key-here'; // Change this in production

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { full_name, phone } = req.body;

        // Validate input
        if (!full_name || !phone) {
            return res.status(400).json({ error: 'Full name and phone are required' });
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (existingUser[0].length > 0) {
            return res.status(400).json({ error: 'User with this phone number already exists' });
        }

        // Insert new user
        const newUser = await db.query(
            'INSERT INTO users (full_name, phone) VALUES (?, ?)',
            [full_name, phone]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser[0].insertId, phone: phone },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser[0].insertId,
                full_name: full_name,
                phone: phone
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Find user by phone
        const user = await db.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        if (user[0].length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user[0][0].id, phone: user[0][0].phone },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user[0][0].id,
                full_name: user[0][0].full_name,
                phone: user[0][0].phone
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, full_name, phone, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (user[0].length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user[0][0] });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

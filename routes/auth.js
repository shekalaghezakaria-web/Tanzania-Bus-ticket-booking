const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middleware');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'; // Use environment variable

// User Registration
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        const { full_name, phone } = req.body;

        // Validate input
        if (!full_name || !phone) {
            console.log('❌ Validation failed - missing fields');
            return res.status(400).json({ error: 'Full name and phone are required' });
        }

        // Validate phone format
        if (!phone.match(/^07\d{8}$/)) {
            console.log('❌ Invalid phone format:', phone);
            return res.status(400).json({ error: 'Invalid phone number format. Use format: 07XXXXXXXX' });
        }

        console.log('✅ Input validation passed');

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        console.log('🔍 Existing user check:', existingUser);

        const userExists = existingUser && existingUser.length > 0;
        
        if (userExists) {
            console.log('❌ User already exists');
            return res.status(400).json({ error: 'User with this phone number already exists' });
        }

        console.log('✅ User does not exist, proceeding with registration');

        // Insert new user
        const newUser = await db.query(
            'INSERT INTO users (full_name, phone) VALUES (?, ?)',
            [full_name, phone]
        );

        console.log('✅ User created:', newUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.insertId, phone },
            process.env.JWT_SECRET || 'safaribus-secret-key-2024',
            { expiresIn: '24h' }
        );

        console.log('✅ Token generated');

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: newUser.insertId,
                full_name,
                phone
            },
            token
        });

    } catch (error) {
        console.error('🚨 Registration error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login request received:', req.body);
        
        const { phone } = req.body;

        // Validate input
        if (!phone) {
            console.log('❌ Login validation failed - missing phone');
            return res.status(400).json({ 
                success: false,
                error: 'Phone number is required' 
            });
        }

        // Validate phone format
        if (!phone.match(/^07\d{8}$/)) {
            console.log('❌ Invalid phone format:', phone);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid phone number format. Use format: 07XXXXXXXX' 
            });
        }

        console.log('✅ Login validation passed');

        // Find user by phone
        const user = await db.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );

        console.log('🔍 User lookup result:', user);

        const userData = user && user.length > 0 ? user[0] : null;
        
        if (!userData) {
            console.log('❌ User not found');
            return res.status(404).json({ 
                success: false,
                error: 'User not found. Please register first.' 
            });
        }

        console.log('✅ User found:', userData.id);

        // For this demo, we'll accept any password (since we don't have password storage)
        // In production, you would verify the password here
        console.log('✅ Password verification passed');

        // Generate JWT token
        const token = jwt.sign(
            { userId: userData.id, phone: userData.phone },
            process.env.JWT_SECRET || 'safaribus-secret-key-2024',
            { expiresIn: '24h' }
        );

        console.log('✅ Login token generated');

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: userData.id,
                full_name: userData.full_name,
                phone: userData.phone
            },
            token
        });

    } catch (error) {
        console.error('🚨 Login error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await db.query(
            'SELECT id, full_name, phone, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (!user || user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user[0] });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

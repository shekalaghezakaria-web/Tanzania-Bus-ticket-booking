// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const routeRoutes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/routes', routeRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/routes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'routes.html'));
});

app.get('/seats', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'seats.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

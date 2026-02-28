// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const db = require('./db');

// Set JWT_SECRET environment variable
process.env.JWT_SECRET = process.env.JWT_SECRET || 'safaribus-secret-key-2024';

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const routeRoutes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5001;

// Global Error Handling
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 ${timestamp} - ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Server Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// SSL Certificate setup
const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
}

const certPath = path.join(certDir, 'server.crt');
const keyPath = path.join(certDir, 'server.key');

// Generate self-signed certificate if it doesn't exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('🔒 Generating SSL certificate...');
    try {
        const { execSync } = require('child_process');
        const opensslCmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=TZ/ST=Dar es Salaam/L=Dar es Salaam/O=SafariBus/CN=192.168.100.7"`;
        execSync(opensslCmd, { stdio: 'inherit' });
        console.log('✅ SSL certificate generated successfully!');
    } catch (error) {
        console.log('⚠️  OpenSSL not found, using HTTP only');
        console.log('💡 Install OpenSSL or use http://192.168.100.7:5000');
    }
}

// CORS configuration
const corsOptions = {
    origin: true, // Allow all origins
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

app.get('/redirect', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'redirect.html'));
});

// Health check endpoint - place before 404 handler
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'SafariBus API is running'
    });
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

// Start servers
const httpServer = http.createServer(app);

// Start HTTP server
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP Server running on port ${PORT}`);
    console.log(`📱 Mobile access: http://192.168.100.7:${PORT}`);
    console.log(`💻 Local access: http://localhost:${PORT}`);
});

// Start HTTPS server if certificate exists
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
        const httpsOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
        
        const httpsServer = https.createServer(httpsOptions, app);
        httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
            console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
            console.log(`📱 HTTPS Mobile access: https://192.168.100.7:${HTTPS_PORT}`);
            console.log(`💻 HTTPS Local access: https://localhost:${HTTPS_PORT}`);
            console.log(`⚠️  Accept SSL certificate in browser when prompted`);
        });
    } catch (error) {
        console.log('❌ Failed to start HTTPS server:', error.message);
    }
} else {
    console.log(`ℹ️  HTTPS server not started - no SSL certificate found`);
    console.log(`💡 Use HTTP: http://192.168.100.7:${PORT}`);
}

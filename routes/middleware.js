const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'; // Use environment variable

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    console.log('🔑 Extracted token:', token ? token.substring(0, 50) + '...' : 'none');

    if (!token) {
        console.log('❌ No token provided');
        const errorInfo = {
            error: 'No token provided',
            endpoint: req.path,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString()
        };
        console.error('🚨 Auth Error:', errorInfo);
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token decoded:', decoded);
        req.user = decoded;
        
        // Log successful authentication
        console.log('🔓 Auth Success:', {
            userId: decoded.userId,
            phone: decoded.phone,
            endpoint: req.path,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        const errorInfo = {
            error: 'Invalid token',
            message: error.message,
            endpoint: req.path,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString()
        };
        console.error('🚨 Token Error:', errorInfo);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { verifyToken };

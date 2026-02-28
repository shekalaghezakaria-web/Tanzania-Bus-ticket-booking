const https = require('https');
const fs = require('fs');
const path = require('path');

// Generate self-signed certificate for HTTPS
const { execSync } = require('child_process');

// Create certificates directory if it doesn't exist
const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
}

// Generate self-signed certificate (Windows compatible)
const certPath = path.join(certDir, 'server.crt');
const keyPath = path.join(certDir, 'server.key');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('Generating self-signed SSL certificate...');
    
    // Try to generate with OpenSSL (if available)
    try {
        execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=TZ/ST=Dar es Salaam/L=Dar es Salaam/O=SafariBus/OU=IT/CN=192.168.100.7"`, { stdio: 'inherit' });
        console.log('SSL certificate generated successfully!');
    } catch (error) {
        console.log('OpenSSL not found, creating simple HTTP server...');
        module.exports = { https: false, certPath: null, keyPath: null };
        return;
    }
}

module.exports = {
    https: true,
    certPath: certPath,
    keyPath: keyPath
};

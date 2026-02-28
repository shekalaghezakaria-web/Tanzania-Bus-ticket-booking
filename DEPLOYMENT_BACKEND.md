# SafariBus Backend Deployment Configuration

# 1. RENDER.COM DEPLOYMENT (Recommended)

## Backend API Deployment

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub/GitLab
3. Create New Web Service

### Step 2: Setup Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial SafariBus deployment"

# Create GitHub repository
gh repo create safari-bus-backend --public --push
```

### Step 3: Create render.yaml
```yaml
services:
  - type: web
    name: safari-bus-api
    env: node
    plan: free
    buildCommand: "npm install"
    startCommand: "npm start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: DB_HOST
        value: your-render-db-host
      - key: DB_USER
        value: your-db-user
      - key: DB_PASSWORD
        value: your-db-password
      - key: DB_NAME
        value: your-db-name
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://safaribus.onrender.com
```

### Step 4: Database Setup
1. On Render, create PostgreSQL database
2. Update database credentials in render.yaml
3. Convert MySQL queries to PostgreSQL if needed

## Alternative: Railway Deployment

### railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[services]]
name = "safari-bus-api"

[services.variables]
NODE_ENV = "production"
PORT = "5000"
JWT_SECRET = "your_secure_jwt_secret"
CORS_ORIGIN = "https://safaribus-production.up.railway.app"
```

## Alternative: Vercel Serverless

### api/index.js
```javascript
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Import your routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const routeRoutes = require('./routes/routes');

app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/routes', routeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
```

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "JWT_SECRET": "@jwt_secret",
    "DB_HOST": "@db_host",
    "DB_USER": "@db_user",
    "DB_PASSWORD": "@db_password",
    "DB_NAME": "@db_name"
  }
}
```

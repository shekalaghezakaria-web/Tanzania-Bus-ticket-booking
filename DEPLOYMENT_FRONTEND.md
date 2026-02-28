# SafariBus Frontend (PWA) Deployment

## Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://safari-bus-api.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://safari-bus-api.onrender.com"
  }
}
```

### Step 3: Update API Base URL in Frontend
```javascript
// In public/script.js
const API_BASE = process.env.REACT_APP_API_URL || 'https://safari-bus-api.onrender.com';
```

### Step 4: Deploy
```bash
vercel --prod
```

## Render Static Hosting

### Step 1: Create Static Site Service
1. On Render dashboard, click "New"
2. Choose "Static Site"
3. Connect your GitHub repository
4. Build settings:
   - Build Command: "echo 'No build needed'"
   - Publish Directory: "public"

### Step 2: Environment Variables
- REACT_APP_API_URL: https://safari-bus-api.onrender.com

## Netlify Deployment

### netlify.toml
```toml
[build]
  publish = "public"
  command = "echo 'No build needed'"

[[redirects]]
  from = "/api/*"
  to = "https://safari-bus-api.onrender.com/api/:splat"
  status = 200

[build.environment]
  REACT_APP_API_URL = "https://safari-bus-api.onrender.com"
```

## PWA Optimization

### Update manifest.json for Production
```json
{
  "name": "Safari Zangu",
  "short_name": "SafariZangu",
  "description": "Online Bus Ticket Booking App Tanzania",
  "start_url": "https://safaribus.onrender.com",
  "scope": "https://safaribus.onrender.com",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d6efd",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Updates
```javascript
// Update cache name for production
const CACHE_NAME = "safaribus-prod-v1";

// Update API base URL
const API_BASE = "https://safari-bus-api.onrender.com";
```

## Mobile Testing Checklist

- [ ] Service worker registers correctly
- [ ] PWA install prompt appears
- [ ] App works offline for cached pages
- [ ] API calls work on mobile network
- [ ] Booking flow completes successfully
- [ ] Push notifications (if implemented)
- [ ] App icon displays correctly
- [ ] Full-screen mode works

## Custom Domain Setup

### Step 1: Purchase Domain
- safaribus.co.tz (Tanzania domain)
- safaribus.com (International)

### Step 2: Configure DNS
```
A record: @ -> 76.76.21.21 (Vercel)
CNAME: www -> safaribus.vercel.app
```

### Step 3: SSL Certificate
- Automatic with Vercel/Render
- Free Let's Encrypt certificate

## Performance Optimization

### Image Optimization
```bash
# Install imagemin
npm install imagemin imagemin-mozjpeg imagemin-pngquant

# Optimize images
npx imagemin public/icons/* --out-dir=public/icons/optimized
```

### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze bundle size
npx webpack-bundle-analyzer dist/static/js/*.js
```

## Security Configuration

### CSP Headers
```javascript
// Add to server.js
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://safari-bus-api.onrender.com"
  );
  next();
});
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

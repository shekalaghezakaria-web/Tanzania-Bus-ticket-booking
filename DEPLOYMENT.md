# Safari Zangu - Deployment Guide

## 🚀 Production Deployment

### 1. Environment Setup

#### Required Environment Variables:
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=bus_booking
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://your-app-domain.com
```

### 2. Database Setup

#### MySQL Database:
1. Create MySQL database: `bus_booking`
2. Import the schema: `mysql -u username -p bus_booking < database.sql`
3. Run setup script: `node setup-database.js`
4. Add buses: `node add-more-buses.js`

### 3. Deployment Options

#### Option A: Render (Recommended)
1. Push code to GitHub
2. Connect GitHub to Render
3. Create Web Service
4. Set environment variables
5. Deploy automatically

#### Option B: Railway
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Set environment variables
5. Deploy: `railway up`

#### Option C: Heroku
1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Set environment variables
4. Push to Heroku: `git push heroku main`

### 4. PWA Features

The app includes:
- ✅ Service Worker for offline support
- ✅ Web App Manifest
- ✅ Responsive design
- ✅ Installable on mobile devices

### 5. Post-Deployment Checklist

- [ ] Database connection working
- [ ] All API endpoints functional
- [ ] Frontend pages loading
- [ ] User registration/login working
- [ ] Booking system functional
- [ ] PWA features working
- [ ] SSL certificate installed
- [ ] Domain configured

### 6. Monitoring

Check logs regularly:
```bash
# Render: Dashboard logs
# Railway: railway logs
# Heroku: heroku logs --tail
```

### 7. Security Notes

- Change JWT_SECRET in production
- Use strong database password
- Enable SSL/HTTPS
- Regular database backups
- Monitor for suspicious activity

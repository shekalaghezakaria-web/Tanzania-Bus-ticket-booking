# 🚀 Safari Zangu - Quick Deployment Guide

## 📋 Prerequisites
- Node.js 16+
- MySQL database
- GitHub account
- Render/Railway account

## ⚡ Quick Deploy to Render

### 1. Prepare Your Code
```bash
# Install dependencies
npm install

# Test locally
npm run dev
```

### 2. Push to GitHub
1. Create new repository on GitHub
2. Upload your code
3. Make sure all files are committed

### 3. Deploy to Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: safari-zangu
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 4. Set Environment Variables
In Render Dashboard → Environment:
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=bus_booking
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-app.onrender.com
```

### 5. Setup Database
1. Create MySQL database (use PlanetScale, ClearDB, or Railway MySQL)
2. Import schema: Run `database.sql` on your database
3. Add sample data: `node add-more-buses.js`

### 6. Test Your App
- Visit: `https://your-app.onrender.com`
- Test registration, login, booking
- Check all pages work

## 🎯 Success!
Your Safari Zangu app is now live! 🎉

## 📱 PWA Features
- Install on mobile: "Add to Home Screen"
- Works offline (basic)
- Responsive design

## 🔧 Troubleshooting
- Check Render logs for errors
- Verify database connection
- Ensure CORS origin matches your URL
- Check environment variables

## 📞 Support
- Check DEPLOYMENT.md for detailed guide
- Review logs in Render dashboard

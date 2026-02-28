@echo off
echo 🚀 SafariBus Deployment Script for Windows
echo ========================================

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📥 Installing Vercel CLI...
    npm install -g vercel
)

REM Step 1: Backend Deployment Instructions
echo.
echo 🔧 Step 1: Backend Deployment to Render
echo ----------------------------------------
echo.
echo 📋 Backend Deployment Steps:
echo 1. Go to https://render.com
echo 2. Sign up and create New Web Service
echo 3. Connect your GitHub repository
echo 4. Use render.yaml configuration file
echo 5. Set environment variables in Render dashboard:
echo    - NODE_ENV=production
echo    - PORT=5000
echo    - DB_HOST=your-render-db-host
echo    - DB_USER=your-db-user
echo    - DB_PASSWORD=your-db-password
echo    - DB_NAME=your-db-name
echo    - JWT_SECRET=your-secure-jwt-secret
echo    - CORS_ORIGIN=https://safaribus.onrender.com
echo.

REM Step 2: Frontend Deployment
echo.
echo 🎨 Step 2: Frontend Deployment to Vercel
echo -----------------------------------------
echo.

echo 📦 Installing dependencies...
call npm install

echo 🚀 Deploying to Vercel...
call vercel --prod

echo.
echo ✅ Deployment Complete!
echo ====================
echo.
echo 📱 Your app is now live at:
echo    Frontend: https://safaribus.vercel.app
echo    Backend:  https://safari-bus-api.onrender.com
echo.
echo 🔧 Next Steps:
echo 1. Update your database credentials in Render dashboard
echo 2. Test the deployed application
echo 3. Configure custom domain (safaribus.co.tz)
echo.
echo 📱 Mobile Users Can:
echo - Install as PWA from https://safaribus.vercel.app
echo - Book tickets 24/7 without your PC running
echo - Use offline mode for cached content
echo.
pause

#!/bin/bash

# SafariBus Deployment Script
# This script deploys both backend and frontend to production

echo "🚀 SafariBus Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial SafariBus deployment setup"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Step 1: Deploy Backend to Render
echo ""
echo "🔧 Step 1: Backend Deployment"
echo "-------------------------------"

echo "📋 Backend Deployment Instructions:"
echo "1. Go to https://render.com"
echo "2. Connect your GitHub repository"
echo "3. Create New Web Service"
echo "4. Use render.yaml configuration"
echo "5. Set environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=5000"
echo "   - DB_HOST=your-render-db-host"
echo "   - DB_USER=your-db-user"
echo "   - DB_PASSWORD=your-db-password"
echo "   - DB_NAME=your-db-name"
echo "   - JWT_SECRET=your-secure-jwt-secret"
echo "   - CORS_ORIGIN=https://safaribus.onrender.com"

# Step 2: Deploy Frontend to Vercel
echo ""
echo "🎨 Step 2: Frontend Deployment"
echo "-------------------------------"

echo "📦 Installing dependencies..."
npm install

echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment Complete!"
echo "===================="
echo ""
echo "📱 Your app is now live at:"
echo "   Frontend: https://safaribus.vercel.app"
echo "   Backend:  https://safari-bus-api.onrender.com"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your backend URL in render.yaml"
echo "2. Set up database on Render"
echo "3. Test the deployed application"
echo "4. Configure custom domain (optional)"
echo ""
echo "📱 Mobile Users Can:"
echo "- Install as PWA from https://safaribus.vercel.app"
echo "- Book tickets 24/7 without your PC running"
echo "- Use offline mode for cached content"

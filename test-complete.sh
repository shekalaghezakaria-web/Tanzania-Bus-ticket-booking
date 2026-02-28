#!/bin/bash

echo "🧪 SafariBus Complete Application Test"
echo "======================================"

# Test 1: Health Check
echo "1. Testing API Health..."
curl -s http://localhost:5000/api/health | head -1

# Test 2: Routes
echo -e "\n2. Testing Routes API..."
curl -s http://localhost:5000/api/routes | head -1

# Test 3: Registration
echo -e "\n3. Testing Registration..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","phone":"9876543210"}' | head -1

# Test 4: Login
echo -e "\n4. Testing Login..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","password":"any"}' | head -1

# Test 5: Frontend Loading
echo -e "\n5. Testing Frontend..."
curl -s -I http://localhost:5000 | head -1

echo -e "\n✅ All Tests Complete!"
echo "📱 Open http://localhost:5000 in browser to test full application"
echo "🔧 Check browser console for any JavaScript errors"

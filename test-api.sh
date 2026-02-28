#!/bin/bash

echo "🧪 SafariBus API Integration Test"
echo "================================"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:5000/api/health | head -1

# Test routes endpoint
echo -e "\n2. Testing routes endpoint..."
curl -s http://localhost:5000/api/routes | head -1

# Test registration
echo -e "\n3. Testing registration..."
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","phone":"1234567890"}' | head -1

# Test login
echo -e "\n4. Testing login..."
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"any"}' | head -1

echo -e "\n✅ API Test Complete!"
echo "📱 Open http://localhost:5000 to test the frontend"

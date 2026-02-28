// API Test Function - Add this to script.js for testing
async function testAllAPIEndpoints() {
    console.log('🧪 Testing all API endpoints...');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const health = await apiRequest('/health');
        console.log('✅ Health check:', health);
        
        // Test routes
        console.log('2. Testing routes endpoint...');
        const routes = await apiRequest('/routes');
        console.log('✅ Routes loaded:', routes.routes?.length || 0);
        
        // Test registration (if needed)
        console.log('3. Testing registration...');
        try {
            const regResponse = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    full_name: 'Test User',
                    phone: '1234567890'
                })
            });
            console.log('✅ Registration:', regResponse);
        } catch (error) {
            console.log('ℹ️ Registration may already exist:', error.message);
        }
        
        // Test login
        console.log('4. Testing login...');
        const loginResponse = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                phone: '1234567890',
                password: 'any' // Password not validated yet
            })
        });
        console.log('✅ Login successful:', loginResponse.user?.full_name);
        
        // Store token for authenticated requests
        if (loginResponse.token) {
            localStorage.setItem('token', loginResponse.token);
        }
        
        // Test my bookings
        console.log('5. Testing my bookings...');
        const bookings = await apiRequest('/booking/my-bookings');
        console.log('✅ My bookings:', bookings.bookings?.length || 0);
        
        console.log('🎉 All API endpoints are working!');
        return true;
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        return false;
    }
}

// Add this to the console for testing
window.testAPI = testAllAPIEndpoints;
console.log('🧪 API Test Function Available: Run testAPI() in console');

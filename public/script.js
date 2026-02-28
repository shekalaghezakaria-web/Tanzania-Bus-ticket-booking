// SafariBus Frontend Script - Complete Rewrite
console.log('🚌 SafariBus App Loading...');

// Global Error Capture System
window.addEventListener('error', function(event) {
    console.error('🚨 Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
    });
});

// Global variables
window.currentUser = window.currentUser || null;
window.selectedBus = window.selectedBus || null;
window.selectedSeat = window.selectedSeat || null;
window.currentBooking = window.currentBooking || null;

// API Configuration
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://safari-bus-api.onrender.com/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 Initializing SafariBus App...');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            window.currentUser = JSON.parse(userData);
            console.log('✅ User already logged in:', window.currentUser);
        } catch (error) {
            console.error('❌ Error parsing user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
        }
    }
    
    // Setup page-specific functionality
    setupPageSpecific();
    
    // Setup global listeners
    setupGlobalListeners();
}

function setupPageSpecific() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('📄 Current page:', currentPage);
    
    switch(currentPage) {
        case 'register.html':
            setupRegisterPage();
            break;
        case 'dashboard.html':
            setupDashboardPage();
            break;
        case 'routes.html':
            setupRoutesPage();
            break;
        case 'seats.html':
            setupSeatsPage();
            break;
        case 'confirmation.html':
            setupConfirmationPage();
            break;
        default:
            setupHomePage();
    }
}

function setupHomePage() {
    console.log('🏠 Setting up home page...');
}

function setupRegisterPage() {
    console.log('📝 Setting up register page...');
    const registerForm = document.getElementById('registerForm');
    const loginLink = document.getElementById('loginLink');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginModal();
        });
    }
}

function setupDashboardPage() {
    console.log('📊 Setting up dashboard page...');
    loadUserBookings();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const refreshBtn = document.getElementById('refreshBookings');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadUserBookings);
    }
}

function setupRoutesPage() {
    console.log('🛣️ Setting up routes page...');
    loadRoutes();
    
    // Add search functionality
    const searchBtn = document.getElementById('searchRoutes');
    const fromLocation = document.getElementById('fromLocation');
    const toLocation = document.getElementById('toLocation');
    
    if (searchBtn && fromLocation && toLocation) {
        searchBtn.addEventListener('click', function() {
            filterRoutes();
        });
        
        // Add enter key support
        fromLocation.addEventListener('change', filterRoutes);
        toLocation.addEventListener('change', filterRoutes);
    }
    
    // Add view toggle functionality
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            viewBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Change view
            const view = this.dataset.view;
            const routesList = document.getElementById('routesList');
            if (routesList) {
                routesList.className = view === 'list' ? 'routes-list list-view' : 'routes-list grid-view';
            }
        });
    });
}

function setupSeatsPage() {
    console.log('💺 Setting up seats page...');
    const urlParams = new URLSearchParams(window.location.search);
    const busId = urlParams.get('busId');
    
    if (busId) {
        loadBusDetails(busId);
        loadSeats(busId);
        
        // Add confirm seat button listener
        const confirmSeatBtn = document.getElementById('confirmSeat');
        if (confirmSeatBtn) {
            confirmSeatBtn.addEventListener('click', proceedToBooking);
        }
        
        // Add back to routes button listener
        const backToRoutesBtn = document.getElementById('backToRoutes');
        if (backToRoutesBtn) {
            backToRoutesBtn.addEventListener('click', function() {
                window.location.href = 'routes.html';
            });
        }
    } else {
        showError('No bus ID provided');
    }
}

function setupConfirmationPage() {
    console.log('🎫 Setting up confirmation page...');
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    if (bookingId) {
        loadBookingConfirmation(bookingId);
    } else {
        showError('No booking ID provided');
    }
}

function setupGlobalListeners() {
    console.log('🌐 Setting up global listeners...');
    setupModalCloseButtons();
    
    // Add login button event listener
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'block';
                console.log('✅ Login modal opened');
            }
        });
        console.log('✅ Login button event listener added');
    } else {
        console.log('❌ Login button not found');
    }
    
    // Add login form event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Login form event listener added');
    } else {
        console.log('❌ Login form not found');
    }
    
    // Add error dashboard shortcut
    document.addEventListener('keydown', function(event) {
        // Ctrl+Shift+E for error dashboard
        if (event.ctrlKey && event.shiftKey && event.key === 'E') {
            event.preventDefault();
            window.open('error-dashboard.html', '_blank');
        }
        // Ctrl+Shift+D for debug info
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            showDebugInfo();
        }
    });
}

function setupModalCloseButtons() {
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = { headers: { 'Content-Type': 'application/json' } };
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
    }
    const finalOptions = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };
    
    console.log(`🌐 Making ${finalOptions.method || 'GET'} request to:`, url);
    
    try {
        const response = await fetch(url, finalOptions);
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorData;
            
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
                console.error('❌ API Error Response:', errorData);
            } else {
                const errorText = await response.text();
                console.error('❌ API Error Text:', errorText);
                errorData = { error: errorText };
            }
            
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        console.log('✅ API Response:', data);
        return data;
    } catch (error) {
        console.error('💥 API Request Failed:', error);
        throw error;
    }
}

// Authentication handlers
async function handleRegistration(e) {
    e.preventDefault();
    
    console.log('🔍 Registration form submitted');
    
    const formData = new FormData(e.target);
    const userData = {
        full_name: formData.get('fullName'),
        phone: formData.get('phone')
    };
    
    console.log('📝 User data:', userData);
    
    try {
        showLoading();
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        console.log('✅ Registration response:', response);
        
        // Save user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        window.currentUser = response.user;
        
        showSuccess('Registration successful! Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    console.log('🔍 Login form submitted');
    console.log('📝 Event object:', event);
    console.log('📝 Form target:', event.target);
    
    // Get phone input directly from DOM - try both possible IDs
    let phoneInput = document.getElementById("loginPhone");
    if (!phoneInput) {
        phoneInput = document.getElementById("phone");
    }
    console.log('📱 Phone input element:', phoneInput);
    
    const phone = phoneInput?.value.trim();
    console.log('� Phone entered:', phone);
    console.log('📱 Phone type:', typeof phone);
    console.log('📱 Phone length:', phone?.length);
    
    // Validate input
    if (!phone) {
        console.error('❌ Missing phone number');
        console.error('❌ Phone input element:', phoneInput);
        console.error('❌ Phone input value:', phoneInput?.value);
        showError("Please enter your phone number");
        return;
    }
    
    // Validate phone format
    if (!phone.match(/^07\d{8}$/)) {
        console.error('❌ Invalid phone format:', phone);
        showError('Invalid phone number format. Use format: 07XXXXXXXX');
        return;
    }
    
    // Create login data
    const loginData = {
        phone: phone,
        password: 'any' // Default password for demo
    };
    
    console.log('📝 Login data:', loginData);
    console.log('🌐 API endpoint:', `${API_BASE}/auth/login`);
    
    try {
        showLoading();
        console.log('⏳ Sending login request...');
        
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        console.log('✅ Login response:', response);
        
        if (!response.token) {
            console.error('❌ No token in response');
            showError('Login failed: No token received');
            return;
        }
        
        // Save user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user || {}));
        
        window.currentUser = response.user;
        
        console.log('✅ User data saved:', response.user);
        
        // Close modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        showSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        hideLoading();
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.currentUser = null;
    
    showSuccess('Logged out successfully!');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Dashboard functions
async function loadUserBookings() {
    try {
        showLoading();
        const response = await apiRequest('/booking/my-bookings');
        displayBookings(response.bookings || []);
    } catch (error) {
        console.error('❌ Error loading bookings:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    
    if (!bookingsList) return;
    
    console.log('📋 Displaying bookings:', bookings);
    
    // Calculate stats
    const totalBookings = bookings.length;
    const upcomingTrips = bookings.filter(b => new Date(b.booking_date) > new Date()).length;
    const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.price || 0), 0);
    
    // Update stats display
    const totalBookingsEl = document.getElementById('totalBookings');
    const upcomingTripsEl = document.getElementById('upcomingTrips');
    const totalSpentEl = document.getElementById('totalSpent');
    
    if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
    if (upcomingTripsEl) upcomingTripsEl.textContent = upcomingTrips;
    if (totalSpentEl) totalSpentEl.textContent = `TSh ${totalSpent.toLocaleString()}`;
    
    if (!bookings || bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-bookings">
                <p>You haven't made any bookings yet.</p>
                <a href="routes.html" class="btn btn-primary">Book Your First Trip</a>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => {
        console.log('📋 Processing booking:', booking);
        return `
        <div class="booking-card">
            <div class="booking-header">
                <h3>Booking #${booking.id || 'N/A'}</h3>
                <span class="booking-status ${booking.status || 'unknown'}">${booking.status || 'Unknown'}</span>
            </div>
            <div class="booking-details">
                <p><strong>Route:</strong> ${booking.from_location || 'Unknown'} to ${booking.to_location || 'Unknown'}</p>
                <p><strong>Bus:</strong> ${booking.bus_name || 'Unknown'}</p>
                <p><strong>Departure:</strong> ${booking.departure_time || 'Unknown'}</p>
                <p><strong>Seat:</strong> ${booking.seat_number || 'Unknown'}</p>
                <p><strong>Price:</strong> TSh ${booking.price || '0'}</p>
                <p><strong>Date:</strong> ${booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'Unknown'}</p>
            </div>
            <div class="booking-actions">
                <button onclick="viewBookingDetails(${booking.id})" class="btn btn-secondary">View Details</button>
                ${booking.status === 'confirmed' ? `<button onclick="cancelBooking(${booking.id})" class="btn btn-danger">Cancel</button>` : ''}
            </div>
        </div>
    `;
    }).join('');
}

async function viewBookingDetails(bookingId) {
    try {
        showLoading();
        const response = await apiRequest(`/booking/${bookingId}`);
        displayBookingDetailsModal(response.booking);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayBookingDetailsModal(booking) {
    const modal = document.getElementById('bookingModal');
    const details = document.getElementById('bookingDetails');
    
    if (!modal || !details) return;
    
    details.innerHTML = `
        <div class="booking-details-modal">
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#${booking.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Route:</span>
                <span class="detail-value">${booking.from_location} to ${booking.to_location}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Bus:</span>
                <span class="detail-value">${booking.bus_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Departure:</span>
                <span class="detail-value">${booking.departure_time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Seat:</span>
                <span class="detail-value">${booking.seat_number}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">TSh ${booking.price}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${booking.status}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Booked on:</span>
                <span class="detail-value">${new Date(booking.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        showLoading();
        await apiRequest(`/booking/${bookingId}`, {
            method: 'DELETE'
        });
        
        showSuccess('Booking cancelled successfully!');
        loadUserBookings(); // Reload bookings
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Routes functions
let allRoutes = []; // Store all routes for filtering

async function loadRoutes() {
    try {
        showLoading();
        const response = await apiRequest('/routes');
        console.log('📋 Routes API response:', response);
        
        let routesData = response.routes || [];
        
        // Handle case where routes might be a single object instead of array
        if (routesData && !Array.isArray(routesData)) {
            console.log('📋 Converting single route object to array');
            routesData = [routesData];
        }
        
        allRoutes = routesData;
        console.log('📋 All routes loaded:', allRoutes);
        
        displayRoutes(allRoutes);
    } catch (error) {
        console.error('❌ Error loading routes:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function filterRoutes() {
    const fromLocation = document.getElementById('fromLocation').value;
    const toLocation = document.getElementById('toLocation').value;
    
    console.log('🔍 Filtering routes:', { fromLocation, toLocation });
    
    let filteredRoutes = allRoutes;
    
    if (fromLocation) {
        filteredRoutes = filteredRoutes.filter(route => 
            route.from_location.toLowerCase() === fromLocation.toLowerCase()
        );
    }
    
    if (toLocation) {
        filteredRoutes = filteredRoutes.filter(route => 
            route.to_location.toLowerCase() === toLocation.toLowerCase()
        );
    }
    
    console.log('📊 Filtered results:', filteredRoutes.length, 'routes');
    displayRoutes(filteredRoutes);
    
    // Show message if no results
    if (filteredRoutes.length === 0 && (fromLocation || toLocation)) {
        const routesList = document.getElementById('routesList');
        if (routesList) {
            routesList.innerHTML = `
                <div class="no-results">
                    <h3>No routes found</h3>
                    <p>No routes available from ${fromLocation || 'selected city'} to ${toLocation || 'selected city'}.</p>
                    <button onclick="clearFilters()" class="btn btn-secondary">Clear Filters</button>
                </div>
            `;
        }
    }
}

function clearFilters() {
    document.getElementById('fromLocation').value = '';
    document.getElementById('toLocation').value = '';
    displayRoutes(allRoutes);
}

function displayRoutes(routes) {
    const routesList = document.getElementById('routesList');
    
    if (!routesList) return;
    
    console.log('📋 Displaying routes:', routes);
    console.log('📋 Routes type:', typeof routes);
    console.log('📋 Is array?', Array.isArray(routes));
    
    // Ensure routes is an array
    if (!Array.isArray(routes)) {
        console.error('❌ displayRoutes: routes is not an array:', routes);
        routesList.innerHTML = `
            <div class="error">
                <h3>Error loading routes</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
        return;
    }
    
    if (routes.length === 0) {
        routesList.innerHTML = `
            <div class="no-routes">
                <h3>No routes available</h3>
                <p>Please check back later for available routes.</p>
            </div>
        `;
        return;
    }
    
    routesList.innerHTML = routes.map(route => `
        <div class="route-card">
            <div class="route-header">
                <h3>${route.from_location} to ${route.to_location}</h3>
                <span class="route-price">TSh ${route.price}</span>
            </div>
            <div class="route-details">
                <p><strong>Available Buses:</strong> ${route.bus_count}</p>
                <p><strong>Duration:</strong> ~${route.estimated_duration || '6-8 hours'}</p>
            </div>
            <div class="route-actions">
                <button onclick="showBusesForRoute(${route.id})" class="btn btn-primary">View Buses</button>
            </div>
        </div>
    `).join('');
}

async function showBusesForRoute(routeId) {
    try {
        showLoading();
        const response = await apiRequest(`/routes/${routeId}/buses`);
        console.log('🚌 Buses API response:', response);
        
        let busesData = response.buses || [];
        
        // Handle case where buses might be a single object instead of array
        if (busesData && !Array.isArray(busesData)) {
            console.log('🚌 Converting single bus object to array');
            busesData = [busesData];
        }
        
        console.log('🚌 Buses data to display:', busesData);
        displayBusesModal(busesData);
    } catch (error) {
        console.error('❌ Error loading buses:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayBusesModal(buses) {
    const modal = document.getElementById('busesModal');
    const busesList = document.getElementById('busesList');
    
    if (!modal || !busesList) return;
    
    console.log('🚌 Displaying buses:', buses);
    console.log('🚌 Buses type:', typeof buses);
    console.log('🚌 Is array?', Array.isArray(buses));
    
    // Ensure buses is an array
    if (!Array.isArray(buses)) {
        console.error('❌ displayBusesModal: buses is not an array:', buses);
        busesList.innerHTML = `
            <div class="error">
                <h3>Error loading buses</h3>
                <p>Please try again.</p>
            </div>
        `;
        modal.style.display = 'block';
        return;
    }
    
    if (buses.length === 0) {
        busesList.innerHTML = `
            <div class="no-buses">
                <h3>No buses available</h3>
                <p>Please try a different route.</p>
            </div>
        `;
        modal.style.display = 'block';
        return;
    }
    
    busesList.innerHTML = buses.map(bus => `
        <div class="bus-item">
            <h4>${bus.bus_name}</h4>
            <p><strong>Departure:</strong> ${bus.departure_time}</p>
            <p><strong>Price:</strong> TSh ${bus.price}</p>
            <button onclick="selectBus(${bus.id}, '${bus.bus_name}', '${bus.departure_time}', '${bus.price}', '${bus.from_location}', '${bus.to_location}')" class="btn btn-primary">Select Seats</button>
        </div>
    `).join('');
    
    modal.style.display = 'block';
}

function selectBus(busId, busName, departureTime, price, fromLocation, toLocation) {
    // Close modal
    const modal = document.getElementById('busesModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Store selected bus with route information
    window.selectedBus = {
        id: busId,
        name: busName,
        departure_time: departureTime,
        price: price,
        from_location: fromLocation,
        to_location: toLocation
    };
    
    console.log('🚌 Selected bus with route:', window.selectedBus);
    
    // Redirect to seats page
    window.location.href = `seats.html?busId=${busId}`;
}

// Seats functions
async function loadBusDetails(busId) {
    try {
        showLoading();
        console.log('Loading bus details for busId:', busId);
        const response = await apiRequest(`/routes/buses/${busId}/seats`);
        console.log('Raw API response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response || {}));
        
        if (response.bus) {
            // Handle different response formats
            let busData = response.bus;
            console.log('🔍 Initial bus data:', busData);
            console.log('Bus data type:', typeof busData);
            
            // If bus is an array (from debug info), take the first element
            if (Array.isArray(busData)) {
                busData = busData[0];
                console.log('🔧 Converted array to first element');
            }
            
            // If bus has nested structure, extract the actual bus object
            if (busData && typeof busData === 'object' && !busData.bus_name) {
                // Look for bus properties in the response
                console.log('🔍 Checking for bus data in response structure...');
                
                // Try to find bus data in different possible locations
                if (response.debug && response.debug.busDetails) {
                    const debugBusData = response.debug.busDetails;
                    console.log('🔧 Using debug bus data:', debugBusData);
                    
                    if (Array.isArray(debugBusData)) {
                        busData = debugBusData[0];
                        console.log('🔧 Extracted bus from debug array');
                    } else if (debugBusData[0]) {
                        busData = debugBusData[0];
                        console.log('🔧 Extracted bus from debug object');
                    }
                }
            }
            
            console.log('✅ Final bus data:', busData);
            
            console.log('✅ Processed bus data:', busData);
            
            // Store bus info globally
            window.selectedBus = {
                id: busData.id,
                bus_name: busData.bus_name,
                from_location: busData.from_location,
                to_location: busData.to_location,
                departure_time: busData.departure_time,
                price: busData.price
            };
            
            console.log('✅ Bus info stored globally:', window.selectedBus);
            displayBusInfo(window.selectedBus);
        } else {
            console.error('❌ No bus data in response');
            showError('Bus information not available');
        }
    } catch (error) {
        console.error('❌ Error loading bus details:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function loadSeats(busId) {
    try {
        showLoading();
        const response = await apiRequest(`/routes/buses/${busId}/seats`);
        console.log('💺 Seats API response:', response);
        
        let seatsData = response.seats || [];
        
        // Handle case where seats might be a single object instead of array
        if (seatsData && !Array.isArray(seatsData)) {
            console.log('💺 Converting single seat object to array');
            seatsData = [seatsData];
        }
        
        console.log('💺 Seats data to display:', seatsData);
        displaySeats(seatsData);
    } catch (error) {
        console.error('❌ Error loading seats:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayBusInfo(bus) {
    const busInfo = document.getElementById('busInfo');
    if (busInfo) {
        busInfo.innerHTML = `
            <h3>${bus.bus_name}</h3>
            <p><strong>Route:</strong> ${bus.from_location} to ${bus.to_location}</p>
            <p><strong>Departure:</strong> ${bus.departure_time}</p>
            <p><strong>Price:</strong> TSh ${bus.price}</p>
        `;
    }
}

function displaySeats(seats) {
    const seatsGrid = document.getElementById('seatsGrid');
    
    if (!seatsGrid) return;
    
    console.log('💺 Displaying seats:', seats);
    console.log('💺 Seats type:', typeof seats);
    console.log('💺 Is array?', Array.isArray(seats));
    
    // Ensure seats is an array
    if (!Array.isArray(seats)) {
        console.error('❌ displaySeats: seats is not an array:', seats);
        seatsGrid.innerHTML = `
            <div class="error">
                <h3>Error loading seats</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
        return;
    }
    
    if (seats.length === 0) {
        seatsGrid.innerHTML = `
            <div class="no-seats">
                <h3>No seats available</h3>
                <p>Please try a different bus.</p>
            </div>
        `;
        return;
    }
    
    seatsGrid.innerHTML = seats.map(seat => `
        <div class="seat ${seat.is_booked ? 'booked' : 'available'}" 
             onclick="selectSeat('${seat.seat_number}', ${seat.is_booked})"
             data-seat="${seat.seat_number}">
            ${seat.seat_number}
        </div>
    `).join('');
}

function selectSeat(seatNumber, isBooked) {
    if (isBooked) {
        showError('This seat is already booked');
        return;
    }
    
    // Remove previous selection
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    
    // Add selection to clicked seat
    const seatElement = document.querySelector(`[data-seat="${seatNumber}"]`);
    if (seatElement) {
        seatElement.classList.add('selected');
        window.selectedSeat = seatNumber;
        
        // Update UI elements
        updateSeatSelectionUI(seatNumber);
    }
}

function updateSeatSelectionUI(seatNumber) {
    // Update selected seat display
    const selectedSeatDisplay = document.getElementById('selectedSeatDisplay');
    if (selectedSeatDisplay) {
        selectedSeatDisplay.textContent = seatNumber;
    }
    
    // Update total price
    const totalPriceElement = document.getElementById('totalPrice');
    if (totalPriceElement && window.selectedBus) {
        totalPriceElement.textContent = `TSh ${window.selectedBus.price}`;
    }
    
    // Enable confirm button
    const confirmSeatBtn = document.getElementById('confirmSeat');
    if (confirmSeatBtn) {
        confirmSeatBtn.disabled = false;
        confirmSeatBtn.textContent = `Confirm Seat ${seatNumber}`;
    }
}

async function proceedToBooking() {
    console.log('🎯 Proceeding to booking...');
    console.log('📊 Selected seat:', window.selectedSeat);
    console.log('🚌 Selected bus:', window.selectedBus);
    
    // Prevent multiple requests
    const confirmBtn = document.getElementById('confirmSeat');
    if (confirmBtn && confirmBtn.disabled) {
        console.log('🚫 Booking already in progress');
        return;
    }
    
    if (!window.selectedSeat) {
        console.error('❌ No seat selected');
        showError('Please select a seat first');
        return;
    }
    
    if (!window.selectedBus) {
        console.error('❌ No bus information available');
        console.error('🔍 Current window.selectedBus:', window.selectedBus);
        showError('Bus information not available. Please try selecting the bus again.');
        return;
    }
    
    // Validate bus data has required fields
    if (!window.selectedBus.id || !window.selectedBus.from_location || !window.selectedBus.to_location) {
        console.error('❌ Incomplete bus information:', window.selectedBus);
        showError('Incomplete bus information. Please try selecting the bus again.');
        return;
    }
    
    try {
        // Disable button to prevent multiple requests
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Processing...';
        }
        
        showLoading();
        console.log('⏳ Creating booking with data:', {
            bus_id: Number(window.selectedBus.id),
            seat_number: window.selectedSeat,
            price: window.selectedBus.price || 0,
            travel_date: new Date().toISOString().split('T')[0], // Today's date
            route: `${window.selectedBus.from_location} to ${window.selectedBus.to_location}`
        });
        
        const bookingData = {
            bus_id: Number(window.selectedBus.id),
            seat_number: window.selectedSeat,
            price: window.selectedBus.price || 0,
            travel_date: new Date().toISOString().split('T')[0], // Today's date
            route: `${window.selectedBus.from_location} to ${window.selectedBus.to_location}`
        };
        
        const response = await apiRequest('/booking', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        console.log('✅ Booking response:', response);
        
        if (response.success) {
            showSuccess('Booking successful! Redirecting to confirmation...');
            
            setTimeout(() => {
                window.location.href = `confirmation.html?bookingId=${response.booking.id}`;
            }, 2000);
        } else {
            // Handle backend error messages
            if (response.error === 'Seat is already booked' || response.error === 'Duplicate booking') {
                showError('This seat is already booked. Please select another seat.');
                // Reset seat selection
                window.selectedSeat = null;
                if (confirmBtn) {
                    confirmBtn.disabled = true;
                    confirmBtn.textContent = 'Confirm Seat Selection';
                }
            } else {
                showError(response.error || 'Failed to create booking');
                // Re-enable button for retry
                if (confirmBtn) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = `Confirm Seat ${window.selectedSeat}`;
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Booking error:', error);
        showError(error.message || 'Failed to create booking');
        
        // Re-enable button for retry
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = `Confirm Seat ${window.selectedSeat}`;
        }
    } finally {
        hideLoading();
    }
}

// Confirmation functions
async function loadBookingConfirmation(bookingId) {
    try {
        showLoading();
        const response = await apiRequest(`/booking/${bookingId}`);
        displayBookingConfirmation(response.booking);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayBookingConfirmation(booking) {
    const bookingDetails = document.getElementById('bookingDetails');
    
    if (!bookingDetails) return;
    
    bookingDetails.innerHTML = `
        <div class="confirmation-details">
            <h2>Booking Confirmed!</h2>
            <div class="confirmation-info">
                <p><strong>Booking ID:</strong> #${booking.id}</p>
                <p><strong>Route:</strong> ${booking.from_location} to ${booking.to_location}</p>
                <p><strong>Bus:</strong> ${booking.bus_name}</p>
                <p><strong>Departure:</strong> ${booking.departure_time}</p>
                <p><strong>Seat:</strong> ${booking.seat_number}</p>
                <p><strong>Price:</strong> TSh ${booking.price}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
            </div>
        </div>
    `;
}

// Utility functions with Green Success Icon
function showLoading() {
    console.log('⏳ Showing loading...');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    console.log('✅ Hiding loading...');
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showError(message) {
    console.error('❌ Error:', message);
    // Create red error notification
    createNotification(message, 'error');
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    // Create green success notification with icon
    createNotification(message, 'success');
}

function createNotification(message, type) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set content with icon
    if (type === 'success') {
        notification.innerHTML = `
            <div class="notification-icon">✅</div>
            <div class="notification-message">${message}</div>
        `;
    } else {
        notification.innerHTML = `
            <div class="notification-icon">❌</div>
            <div class="notification-message">${message}</div>
        `;
    }
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showDebugInfo() {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        page: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
        currentUser: window.currentUser,
        selectedBus: window.selectedBus,
        selectedSeat: window.selectedSeat,
        currentBooking: window.currentBooking,
        apiBase: API_BASE,
        localStorage: {
            token: localStorage.getItem('token') ? 'Present' : 'Missing',
            userData: localStorage.getItem('userData') ? 'Present' : 'Missing',
            apiErrors: JSON.parse(localStorage.getItem('apiErrors') || '[]').length,
            networkErrors: JSON.parse(localStorage.getItem('networkErrors') || '[]').length
        }
    };
    
    console.log('🐛 Debug Info:', debugInfo);
    alert('🐛 Debug Info logged to console! Press Ctrl+Shift+E for error dashboard.');
}

// Make clearFilters global
window.clearFilters = clearFilters;

console.log('🎉 SafariBus App Loaded Successfully!');

// SafariBus Frontend Script - Clean Version
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
    
    // Show user-friendly error
    showError('Application error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
    });
    
    // Show user-friendly error
    showError('Network error occurred. Please check your connection.');
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
}

function setupSeatsPage() {
    console.log('💺 Setting up seats page...');
    const urlParams = new URLSearchParams(window.location.search);
    const busId = urlParams.get('busId');
    
    if (busId) {
        loadBusDetails(busId);
        loadSeats(busId);
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
    console.log('📤 Request options:', finalOptions);
    
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
            
            // Enhanced error logging
            const errorInfo = {
                endpoint: endpoint,
                method: finalOptions.method || 'GET',
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            console.error('🚨 API Error Details:', errorInfo);
            
            // Store error in localStorage for debugging
            const errors = JSON.parse(localStorage.getItem('apiErrors') || '[]');
            errors.push(errorInfo);
            localStorage.setItem('apiErrors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
            
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
        
        // Enhanced network error logging
        const networkError = {
            endpoint: endpoint,
            method: finalOptions.method || 'GET',
            error: error.message,
            timestamp: new Date().toISOString(),
            online: navigator.onLine,
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
        };
        
        console.error('🚨 Network Error Details:', networkError);
        
        // Store network error
        const errors = JSON.parse(localStorage.getItem('networkErrors') || '[]');
        errors.push(networkError);
        localStorage.setItem('networkErrors', JSON.stringify(errors.slice(-5))); // Keep last 5 errors
        
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

async function handleLogin(e) {
    e.preventDefault();
    
    console.log('🔍 Login form submitted');
    
    const formData = new FormData(e.target);
    const loginData = {
        phone: formData.get('phone'),
        password: formData.get('password')
    };
    
    console.log('📝 Login data:', loginData);
    
    try {
        showLoading();
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        console.log('✅ Login response:', response);
        
        // Save user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        window.currentUser = response.user;
        
        // Close modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        showSuccess('Login successful! Redirecting to dashboard...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showError(error.message);
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
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = `
            <div class="no-bookings">
                <p>You haven't made any bookings yet.</p>
                <a href="routes.html" class="btn btn-primary">Book Your First Trip</a>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>Booking #${booking.id}</h3>
                <span class="booking-status ${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><strong>Route:</strong> ${booking.from_location} to ${booking.to_location}</p>
                <p><strong>Bus:</strong> ${booking.bus_name}</p>
                <p><strong>Departure:</strong> ${booking.departure_time}</p>
                <p><strong>Seat:</strong> ${booking.seat_number}</p>
                <p><strong>Price:</strong> TSh ${booking.price}</p>
                <p><strong>Date:</strong> ${new Date(booking.created_at).toLocaleDateString()}</p>
            </div>
            <div class="booking-actions">
                <button onclick="viewBookingDetails(${booking.id})" class="btn btn-secondary">View Details</button>
                ${booking.status === 'confirmed' ? `<button onclick="cancelBooking(${booking.id})" class="btn btn-danger">Cancel</button>` : ''}
            </div>
        </div>
    `).join('');
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
async function loadRoutes() {
    try {
        showLoading();
        const response = await apiRequest('/routes');
        displayRoutes(response.routes || []);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayRoutes(routes) {
    const routesList = document.getElementById('routesList');
    
    if (!routesList) return;
    
    routesList.innerHTML = routes.map(route => `
        <div class="route-card">
            <div class="route-header">
                <h3>${route.from_location} to ${route.to_location}</h3>
                <span class="route-price">TSh ${route.price}</span>
            </div>
            <div class="route-details">
                <p><strong>Available Buses:</strong> ${route.bus_count}</p>
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
        displayBusesModal(response.buses || []);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function displayBusesModal(buses) {
    const modal = document.getElementById('busesModal');
    const busesList = document.getElementById('busesList');
    
    if (!modal || !busesList) return;
    
    busesList.innerHTML = buses.map(bus => `
        <div class="bus-item">
            <h4>${bus.bus_name}</h4>
            <p><strong>Departure:</strong> ${bus.departure_time}</p>
            <p><strong>Price:</strong> TSh ${bus.price}</p>
            <button onclick="selectBus(${bus.id}, '${bus.bus_name}', '${bus.departure_time}', '${bus.price}')" class="btn btn-primary">Select Seats</button>
        </div>
    `).join('');
    
    modal.style.display = 'block';
}

function selectBus(busId, busName, departureTime, price) {
    // Close modal
    const modal = document.getElementById('busesModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Store selected bus
    window.selectedBus = {
        id: busId,
        name: busName,
        departure_time: departureTime,
        price: price
    };
    
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
        
        if (response.bus) {
            displayBusInfo(response.bus);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function loadSeats(busId) {
    try {
        showLoading();
        const response = await apiRequest(`/routes/buses/${busId}/seats`);
        displaySeats(response.seats || []);
    } catch (error) {
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
    }
}

async function proceedToBooking() {
    if (!window.selectedSeat) {
        showError('Please select a seat first');
        return;
    }
    
    if (!window.selectedBus) {
        showError('Bus information not available');
        return;
    }
    
    try {
        showLoading();
        
        const bookingData = {
            bus_id: Number(window.selectedBus.id),
            seat_number: window.selectedSeat,
            price: window.selectedBus.price
        };
        
        const response = await apiRequest('/booking', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        showSuccess('Booking successful! Redirecting to confirmation...');
        
        setTimeout(() => {
            window.location.href = `confirmation.html?bookingId=${response.booking.id}`;
        }, 2000);
        
    } catch (error) {
        showError(error.message);
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

// Utility functions
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
    alert('❌ Error: ' + message);
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    alert('✅ ' + message);
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

console.log('🎉 SafariBus App Loaded Successfully!');

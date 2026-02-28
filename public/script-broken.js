// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Global variables (safe - avoid redeclaration)
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
    // Check if user is logged in
    checkAuthStatus();
    
    // Setup PWA installation
    setupPWAInstallation();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup page-specific functionality
    setupPageHandlers();
    
    // Setup global event listeners
    setupGlobalListeners();
}

// Authentication functions
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        updateUserInterface();
    }
}

function updateUserInterface() {
    // Update navigation based on auth status
    const registerBtn = document.querySelector('.btn-register');
    const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
    
    if (currentUser) {
        if (registerBtn) {
            registerBtn.textContent = 'Dashboard';
            registerBtn.href = 'dashboard.html';
        }
        
        // Update user name on dashboard
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.full_name;
        }
    }
}

// Mobile menu setup
function setupMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Page-specific handlers
function setupPageHandlers() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'register.html':
            setupRegistrationPage();
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

// Home page setup
function setupHomePage() {
    // Setup smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Setup contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Registration page setup
function setupRegistrationPage() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const loginLink = document.getElementById('loginLink');
    const loginModal = document.getElementById('loginModal');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (loginLink && loginModal) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    }
    
    // Setup modal close buttons
    setupModalCloseButtons();
}

// Dashboard page setup
function setupDashboardPage() {
    if (!currentUser) {
        window.location.href = 'register.html';
        return;
    }
    
    loadUserBookings();
    loadDashboardStats();
    
    // Setup event listeners
    const refreshBtn = document.getElementById('refreshBookings');
    const logoutBtn = document.getElementById('logoutBtn');
    const viewProfileBtn = document.getElementById('viewProfile');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadUserBookings);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', showUserProfile);
    }
}

// Routes page setup
function setupRoutesPage() {
    loadRoutes();
    
    const searchBtn = document.getElementById('searchRoutes');
    const fromLocation = document.getElementById('fromLocation');
    const toLocation = document.getElementById('toLocation');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            filterRoutes(fromLocation.value, toLocation.value);
        });
    }
    
    // Setup view toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // In a real app, this would change the view layout
        });
    });
    
    // Setup buses modal
    setupModalCloseButtons();
}

// Seats page setup
function setupSeatsPage() {
    if (!currentUser) {
        window.location.href = 'register.html';
        return;
    }
    
    // Get bus ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const busId = urlParams.get('busId');
    
    console.log('Seats page setup, busId:', busId);
    
    if (busId) {
        loadBusDetails(busId);
        loadSeats(busId);
    } else {
        showError('No bus selected. Please select a bus first.');
        setTimeout(() => {
            window.location.href = 'routes.html';
        }, 2000);
    }
    
    // Setup seat selection
    setupSeatSelection();
    
    // Setup action buttons
    const backBtn = document.getElementById('backToRoutes');
    const confirmBtn = document.getElementById('confirmSeat');
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'routes.html';
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmSeatSelection);
    }
}

// Confirmation page setup
function setupConfirmationPage() {
    // Get booking details from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');
    
    if (bookingId) {
        loadBookingConfirmation(bookingId);
    } else {
        // Try to get from localStorage
        const bookingData = localStorage.getItem('lastBooking');
        if (bookingData) {
            displayBookingConfirmation(JSON.parse(bookingData));
        } else {
            showError('No booking found. Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
    }
    
    // Setup print button
    const printBtn = document.getElementById('printTicket');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
}

// Global event listeners
function setupGlobalListeners() {
    // Setup modal close buttons
    setupModalCloseButtons();
}

// Modal setup
function setupModalCloseButtons() {
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside
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
        console.log('📥 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.error('❌ API Error Response:', errorData);
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            } else {
                const errorText = await response.text();
                console.error('❌ API Error Text:', errorText);
                throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
            }
        }
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        console.log('✅ API Response data:', data);
        return data;
        
    } catch (error) {
        console.error('💥 API Request Failed:', error);
        console.error('💥 Error details:', {
            message: error.message,
            stack: error.stack,
            url: url,
            options: finalOptions
        });
        
        // Provide more user-friendly error messages
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error - Please check your internet connection');
        } else if (error.message.includes('404')) {
            throw new Error('API endpoint not found - Please check the server is running');
        } else {
            throw error;
        }
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
    console.log('🌐 API endpoint:', `${API_BASE}/auth/register`);
    
    try {
        showLoading();
        console.log('⏳ Sending registration request...');
        
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        console.log('✅ Registration response:', response);
        
        // Save user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        currentUser = response.user;
        
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
    console.log('🌐 API endpoint:', `${API_BASE}/auth/login`);
    
    try {
        showLoading();
        console.log('⏳ Sending login request...');
        
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        console.log('✅ Login response:', response);
        
        // Save user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        currentUser = response.user;
        
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
    currentUser = null;
    
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
                <a href="routes.html" class="btn btn-primary">Book Your First Ticket</a>
            </div>
        `;
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-info">
                <h4>${booking.from_location} → ${booking.to_location}</h4>
                <div class="booking-details">
                    <p>Bus: ${booking.bus_name} | Seat: ${booking.seat_number}</p>
                    <p>Departure: ${booking.departure_time} | Date: ${new Date(booking.booking_date).toLocaleDateString()}</p>
                    <p>Price: TSh ${booking.price.toLocaleString()}</p>
                </div>
            </div>
            <div class="booking-actions">
                <button class="btn btn-secondary" onclick="viewBookingDetails(${booking.id})">View</button>
                <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button>
            </div>
        </div>
    `).join('');
}

async function loadDashboardStats() {
    try {
        const response = await apiRequest('/booking/my-bookings');
        const bookings = response.bookings;
        
        // Calculate stats
        const totalBookings = bookings.length;
        const upcomingTrips = bookings.filter(b => new Date(b.booking_date) > new Date()).length;
        const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.price), 0);
        
        // Update stats display
        const totalBookingsEl = document.getElementById('totalBookings');
        const upcomingTripsEl = document.getElementById('upcomingTrips');
        const totalSpentEl = document.getElementById('totalSpent');
        
        if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
        if (upcomingTripsEl) upcomingTripsEl.textContent = upcomingTrips;
        if (totalSpentEl) totalSpentEl.textContent = `TSh ${totalSpent.toLocaleString()}`;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
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
                <span class="detail-value">${booking.from_location} → ${booking.to_location}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Bus:</span>
                <span class="detail-value">${booking.bus_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Seat:</span>
                <span class="detail-value">${booking.seat_number}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Departure Time:</span>
                <span class="detail-value">${booking.departure_time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Booking Date:</span>
                <span class="detail-value">${new Date(booking.booking_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">TSh ${parseFloat(booking.price).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${booking.status}</span>
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
        loadUserBookings(); // Refresh bookings list
        loadDashboardStats(); // Refresh stats
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

function showUserProfile() {
    if (!currentUser) return;
    
    const profileInfo = `
        Full Name: ${currentUser.full_name}
        Phone: ${currentUser.phone}
        Member Since: ${new Date().toLocaleDateString()}
    `;
    
    alert(profileInfo);
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
        <div class="route-item">
            <h4>${route.from_location} → ${route.to_location}</h4>
            <div class="route-meta">
                <span class="route-price">TSh ${parseFloat(route.price).toLocaleString()}</span>
                <span class="bus-count">${route.bus_count} buses</span>
            </div>
            <button class="btn btn-primary" onclick="showBusesForRoute(${route.id})">
                View Buses
            </button>
        </div>
    `).join('');
}

function filterRoutes(from, to) {
    // In a real app, this would filter the displayed routes
    showSuccess('Filtering routes...');
    loadRoutes(); // For now, just reload all routes
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
            <p>Route: ${bus.from_location} → ${bus.to_location}</p>
            <p>Departure: ${bus.departure_time}</p>
            <p>Price: TSh ${parseFloat(bus.price).toLocaleString()}</p>
            <button class="btn btn-primary" onclick="selectBus(${bus.id})">
                Select Seats
            </button>
        </div>
    `).join('');
    
    modal.style.display = 'block';
}

function selectBus(busId) {
    // Close modal
    const modal = document.getElementById('busesModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
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
        console.log('Response bus:', response.bus);
        console.log('Response debug:', response.debug);
        
        const bus = response.bus;
        console.log('Bus object:', bus);
        console.log('Bus ID:', bus?.id);
        console.log('Bus ID type:', typeof bus?.id);
        
        if (!bus) {
            showError('Bus details not found!');
            return;
        }
        
        // Update bus information
        document.getElementById('busName').textContent = bus.bus_name;
        document.getElementById('routeInfo').textContent = `${bus.from_location} → ${bus.to_location}`;
        document.getElementById('departureTime').textContent = bus.departure_time;
        document.getElementById('ticketPrice').textContent = `TSh ${parseFloat(bus.price).toLocaleString()}`;
        
        selectedBus = bus;
        console.log('Selected bus:', selectedBus);
        console.log('Selected bus ID:', selectedBus?.id);
        console.log('Selected bus type:', typeof selectedBus?.id);
        
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

function displaySeats(seats) {
    const seatsGrid = document.getElementById('seatsGrid');
    
    if (!seatsGrid) return;
    
    seatsGrid.innerHTML = seats.map(seat => `
        <div class="seat ${seat.is_booked ? 'booked' : 'available'}" 
             data-seat="${seat.seat_number}"
             onclick="selectSeat('${seat.seat_number}', ${seat.is_booked})">
            ${seat.seat_number}
        </div>
    `).join('');
}

function setupSeatSelection() {
    // Seat selection is handled by onclick in the seat elements
}

function selectSeat(seatNumber, isBooked) {
    if (isBooked) {
        showError('This seat is already booked!');
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
        selectedSeat = seatNumber;
        
        // Update booking summary
        document.getElementById('selectedSeatDisplay').textContent = seatNumber;
        document.getElementById('totalPrice').textContent = selectedBus ? 
            `TSh ${parseFloat(selectedBus.price).toLocaleString()}` : 'TSh 0';
        
        // Enable confirm button
        const confirmBtn = document.getElementById('confirmSeat');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }
}

async function confirmSeatSelection() {
    console.log('confirmSeatSelection called');
    console.log('window.selectedBus:', window.selectedBus);
    console.log('window.selectedSeat:', window.selectedSeat);
    
    if (!window.selectedBus || !window.selectedSeat) {
        showError('Please select a seat first!');
        return;
    }
    
    try {
        showLoading();
        
        const bookingData = {
            bus_id: Number(window.selectedBus.id),
            seat_number: String(window.selectedSeat)
        };
        
        console.log('Making booking with:', bookingData);
        console.log('Data types:', {
            bus_id: typeof bookingData.bus_id,
            seat_number: typeof bookingData.seat_number
        });
        
        const response = await apiRequest('/booking', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        console.log('Booking response:', response);
        
        window.currentBooking = response.booking;
        
        // Save booking to localStorage for confirmation page
        localStorage.setItem('lastBooking', JSON.stringify(window.currentBooking));
        
        showSuccess('Booking confirmed! Redirecting to confirmation page...');
        
        setTimeout(() => {
            window.location.href = `confirmation.html?bookingId=${window.currentBooking.id}`;
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
    const detailsElement = document.getElementById('bookingDetails');
    
    if (!detailsElement) return;
    
    detailsElement.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Booking ID:</span>
            <span class="detail-value">#${booking.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Passenger:</span>
            <span class="detail-value">${booking.full_name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${booking.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Route:</span>
            <span class="detail-value">${booking.from_location} → ${booking.to_location}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Bus:</span>
            <span class="detail-value">${booking.bus_name}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Seat:</span>
            <span class="detail-value">${booking.seat_number}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Departure Time:</span>
            <span class="detail-value">${booking.departure_time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Booking Date:</span>
            <span class="detail-value">${new Date(booking.booking_date).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">TSh ${parseFloat(booking.price).toLocaleString()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">${booking.status}</span>
        </div>
    `;
}

// Contact form handler
async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // In a real app, this would send the data to a backend
    showSuccess('Thank you for your message! We will get back to you soon.');
    }

    function showError(message) {
        console.error('❌ Error:', message);
        alert('❌ Error: ' + message);
    }

    function showSuccess(message) {
        console.log('✅ Success:', message);
        alert('✅ ' + message);
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
    }
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showMessage(message, type) {
    const successEl = document.getElementById('successMessage');
    const errorEl = document.getElementById('errorMessage');
    const successText = document.getElementById('successText');
    const errorText = document.getElementById('errorText');
    
    console.log('showMessage called:', { message, type, successEl, errorEl });
    
    if (type === 'success' && successEl && successText) {
        successText.textContent = message;
        successEl.style.display = 'block';
        
        setTimeout(() => {
            successEl.style.display = 'none';
        }, 5000);
    } else if (type === 'error' && errorEl && errorText) {
        errorText.textContent = message;
        errorEl.style.display = 'block';
        
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    } else {
        console.log('Message elements not found:', { successEl, errorEl, successText, errorText });
    }
}

// PWA Installation Setup
let deferredPrompt;

function setupPWAInstallation() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    
                    // Check if app is already installed
                    if (window.matchMedia('(display-mode: standalone)').matches) {
                        console.log('App is already installed');
                        return;
                    }
                    
                    // Show manual install button after 2 seconds
                    setTimeout(() => {
                        if (!deferredPrompt) {
                            console.log('No install prompt detected, showing manual install button');
                            showManualInstallButton();
                        }
                    }, 2000);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    } else {
        console.log('ServiceWorker not supported');
        // Show manual install instructions
        setTimeout(showManualInstallButton, 2000);
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt event fired');
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        hideInstallButton();
        hideManualInstallButton();
        showSuccess('SafariBus imeshakamilishwa kwenye simu yako!');
    });
    
    // Debug PWA criteria
    console.log('PWA Debug Info:');
    console.log('- ServiceWorker supported:', 'serviceWorker' in navigator);
    console.log('- BeforeInstallPrompt supported:', 'onbeforeinstallprompt' in window);
    console.log('- HTTPS:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    console.log('- User Agent:', navigator.userAgent);
}

function showInstallButton() {
    // Remove existing install button if any
    const existingBtn = document.getElementById('installBtn');
    if (existingBtn) existingBtn.remove();

    // Create install button
    const installBtn = document.createElement('button');
    installBtn.id = 'installBtn';
    installBtn.innerHTML = '📱 Sakinisha App';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(45deg, #1976d2, #42a5f5);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
    `;

    installBtn.addEventListener('click', installPWA);
    document.body.appendChild(installBtn);

    // Add hover effects
    installBtn.addEventListener('mouseenter', () => {
        installBtn.style.transform = 'scale(1.05)';
        installBtn.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)';
    });

    installBtn.addEventListener('mouseleave', () => {
        installBtn.style.transform = 'scale(1)';
        installBtn.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
    });
}

function hideInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.remove();
    }
}

function showManualInstallButton() {
    // Remove existing manual install button if any
    const existingBtn = document.getElementById('manualInstallBtn');
    if (existingBtn) existingBtn.remove();

    // Create manual install button
    const manualBtn = document.createElement('button');
    manualBtn.id = 'manualInstallBtn';
    manualBtn.innerHTML = '📱 Sakinisha App (Manual)';
    manualBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
        max-width: 200px;
        text-align: center;
    `;

    manualBtn.addEventListener('click', showInstallInstructions);
    document.body.appendChild(manualBtn);

    // Add hover effects
    manualBtn.addEventListener('mouseenter', () => {
        manualBtn.style.transform = 'scale(1.05)';
        manualBtn.style.boxShadow = '0 6px 16px rgba(238, 90, 36, 0.4)';
    });

    manualBtn.addEventListener('mouseleave', () => {
        manualBtn.style.transform = 'scale(1)';
        manualBtn.style.boxShadow = '0 4px 12px rgba(238, 90, 36, 0.3)';
    });
}

function hideManualInstallButton() {
    const manualBtn = document.getElementById('manualInstallBtn');
    if (manualBtn) {
        manualBtn.remove();
    }
}

function showInstallInstructions() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isAndroid) {
        instructions = `
            <div style="text-align: left; padding: 20px;">
                <h3>📱 Sakinisha SafariBus App (Android)</h3>
                <ol>
                    <li>Bonyeza menu dots (⋮) juu kulia</li>
                    <li>Bonyeza "Add to Home screen" au "Sakinisha app"</li>
                    <li>Bonyeza "Sakinisha" au "Install"</li>
                    <li>App itaonekana kwenye home screen yako!</li>
                </ol>
                <p><strong>Kama hunaona "Add to Home screen":</strong></p>
                <ul>
                    <li>Fungua Chrome browser</li>
                    <li>Fungua http://192.168.100.7:5000</li>
                    <li>Rudia steps za juu</li>
                </ul>
            </div>
        `;
    } else if (isIOS) {
        instructions = `
            <div style="text-align: left; padding: 20px;">
                <h3>📱 Sakinisha SafariBus App (iPhone)</h3>
                <ol>
                    <li>Bonyeza Share icon (📤) chini</li>
                    <li>Bonyeza "Add to Home Screen"</li>
                    <li>Bonyeza "Add" au "Add to Home Screen"</li>
                    <li>App itaonekana kwenye home screen yako!</li>
                </ol>
                <p><strong>Kumbuka:</strong></p>
                <ul>
                    <li>Tumia Safari browser (sio Chrome)</li>
                    <ul>
                    <li>URL: http://192.168.100.7:5000</li>
                </ul>
            </div>
        `;
    } else {
        instructions = `
            <div style="text-align: left; padding: 20px;">
                <h3>📱 Sakinisha SafariBus App</h3>
                <p><strong>Android:</strong> Menu → Add to Home Screen</p>
                <p><strong>iPhone:</strong> Share → Add to Home Screen</p>
                <p><strong>Kama haifanyi kazi:</strong></p>
                <ul>
                    <li>Fungua http://192.168.100.7:5000</li>
                    <li>Tumia Chrome (Android) au Safari (iPhone)</li>
                    <li>Hakikisha internet iko imara</li>
                </ul>
            </div>
        `;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 20000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 400px; width: 100%; max-height: 80vh; overflow-y: auto;">
            ${instructions}
            <div style="padding: 20px; text-align: center;">
                <button onclick="this.closest('div[style*=fixed]').remove()" style="background: #1976d2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Nimeelewa
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function installPWA() {
    if (!deferredPrompt) {
        showSuccess('App tayari imeshasakinishwa!');
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
    } else {
        console.log('User dismissed the install prompt');
    }
    
    deferredPrompt = null;
    hideInstallButton();
}

// Add pulse animation
if (!document.querySelector('#install-animations')) {
    const style = document.createElement('style');
    style.id = 'install-animations';
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for global access
window.selectBus = selectBus;
window.selectSeat = selectSeat;
window.viewBookingDetails = viewBookingDetails;
window.cancelBooking = cancelBooking;
window.showBusesForRoute = showBusesForRoute;

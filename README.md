# Bus Ticket Booking System - Tanzania

A full-stack web application for booking bus tickets online in Tanzania. Built with Node.js, Express, MySQL, and vanilla JavaScript.

## Features

- **User Registration & Login**: Simple registration with phone number authentication
- **Route Management**: View available routes between major Tanzanian cities
- **Bus Selection**: Choose from multiple buses per route
- **Interactive Seat Selection**: 40-seat grid layout with visual seat availability
- **Real-time Booking**: Prevent double booking with database constraints
- **Booking Management**: View, manage, and cancel bookings
- **Modern UI**: Responsive design with Tanzanian bus booking theme
- **Mobile Friendly**: Works seamlessly on all devices

## Available Routes

- Dar es Salaam ↔ Mwanza (TSh 85,000)
- Mbeya ↔ Dar es Salaam (TSh 75,000)
- Dodoma ↔ Mbeya (TSh 65,000)
- Mbeya ↔ Arusha (TSh 70,000)
- Morogoro ↔ Tanga (TSh 45,000)

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with modern design
- **Vanilla JavaScript** - No frameworks required
- **Responsive Design** - Mobile-first approach

## Project Structure

```
bus-ticket-booking/
├── public/                     # Frontend files
│   ├── index.html              # Home page
│   ├── register.html           # User registration
│   ├── dashboard.html          # User dashboard
│   ├── routes.html             # Available routes
│   ├── seats.html              # Seat selection
│   ├── confirmation.html       # Booking confirmation
│   ├── style.css              # Stylesheets
│   └── script.js              # Frontend JavaScript
├── routes/                     # API routes
│   ├── auth.js                # Authentication routes
│   ├── booking.js             # Booking management
│   └── routes.js              # Route and bus data
├── database.sql                # Database schema and sample data
├── db.js                      # Database connection
├── server.js                  # Main server file
├── package.json               # Dependencies
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites

1. **Node.js** (v14 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Git** (for cloning)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd bus-ticket-booking
```

### Step 2: Install Dependencies

```bash
# Install npm packages
npm install

# If npm is blocked by execution policy, install packages manually:
npm install express pg cors body-parser bcryptjs jsonwebtoken nodemon
```

### Step 3: Setup MySQL Database

1. **Create Database**
   ```sql
   -- Open MySQL shell
   mysql -u root -p
   CREATE DATABASE bus_booking;
   USE bus_booking;
   ```

2. **Import Database Schema**
   ```bash
   # Using MySQL command line
   mysql -u root -p bus_booking < database.sql
   
   # Or using MySQL Workbench/phpMyAdmin:
   # 1. Connect to your MySQL server
   # 2. Create database named "bus_booking"
   # 3. Open Query Editor
   # 4. Copy and paste contents of database.sql
   # 5. Execute the script
   ```

3. **Verify Database Setup**
   ```sql
   -- Check if tables were created
   SHOW TABLES;
   
   -- Check sample data
   SELECT COUNT(*) FROM routes;
   SELECT COUNT(*) FROM buses;
   SELECT COUNT(*) FROM seats;
   ```

### Step 4: Configure Database Connection

Edit `db.js` file with your MySQL credentials:

```javascript
const pool = mysql.createPool({
    host: 'localhost',          // Change if needed
    user: 'root',               // Your MySQL username
    password: 'your_password',  // Your MySQL password
    database: 'bus_booking',    // Should match your database name
    port: 3306,                 // Change if needed
});
```

### Step 5: Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

## Usage

### 1. Register for an Account
- Visit `http://localhost:3000/register`
- Enter your full name and phone number
- Click "Register"

### 2. Browse Available Routes
- From the home page, click "View Routes"
- Or go directly to `http://localhost:3000/routes`
- Browse all available routes or use the search filters

### 3. Select a Bus
- Click "View Buses" on any route
- Choose your preferred bus based on departure time
- Click "Select Seats"

### 4. Choose Your Seat
- View the interactive seat map
- Green seats are available, red are booked
- Click on an available seat to select it
- Click "Confirm Seat Selection"

### 5. Booking Confirmation
- Your booking is confirmed instantly
- View all booking details
- Print or save your ticket information

### 6. Manage Bookings
- Visit your dashboard at `http://localhost:3000/dashboard`
- View all your bookings
- Cancel bookings if needed
- See booking statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Routes & Buses
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get specific route
- `GET /api/routes/:routeId/buses` - Get buses for route
- `GET /api/routes/buses/:busId/seats` - Get seats for bus

### Bookings
- `POST /api/booking` - Create new booking
- `GET /api/booking/my-bookings` - Get user bookings
- `GET /api/booking/:id` - Get booking details
- `DELETE /api/booking/:id` - Cancel booking

## Database Schema

### Tables

1. **users** - User information
   - id (SERIAL PRIMARY KEY)
   - full_name (VARCHAR)
   - phone (VARCHAR UNIQUE)
   - created_at (TIMESTAMP)

2. **routes** - Bus routes
   - id (SERIAL PRIMARY KEY)
   - from_location (VARCHAR)
   - to_location (VARCHAR)
   - price (DECIMAL)

3. **buses** - Bus information
   - id (SERIAL PRIMARY KEY)
   - route_id (INTEGER REFERENCES routes)
   - bus_name (VARCHAR)
   - departure_time (TIME)

4. **seats** - Seat information
   - id (SERIAL PRIMARY KEY)
   - bus_id (INTEGER REFERENCES buses)
   - seat_number (VARCHAR)
   - is_booked (BOOLEAN)

5. **bookings** - Booking records
   - id (SERIAL PRIMARY KEY)
   - user_id (INTEGER REFERENCES users)
   - bus_id (INTEGER REFERENCES buses)
   - seat_number (VARCHAR)
   - booking_date (TIMESTAMP)
   - status (VARCHAR)

## Features Implementation

### Double Booking Prevention
- Database trigger prevents booking the same seat twice
- Frontend disables already booked seats
- Transaction-based booking process

### Seat Layout
- 40 seats per bus (10 rows × 4 seats)
- Seat numbering: 01A, 01B, 01C, 01D, 02A, 02B, etc.
- Visual indicators for seat status

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Auto-logout on token expiration

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly interface

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `db.js`
   - Ensure database name matches

2. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use different port
   PORT=3001 npm start
   ```

3. **Module Not Found Error**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   npm install
   ```

4. **MySQL Authentication Error**
   ```bash
   # Reset MySQL root password or create new user
   mysql -u root -p
   CREATE USER 'bususer'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON bus_booking.* TO 'bususer'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Permission Denied (npm)**
   ```bash
   # On Windows, run PowerShell as Administrator
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Development Tips

1. **Enable Auto-restart**
   ```bash
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **View Logs**
   - Check console output for server logs
   - Browser console for frontend errors

3. **Database Testing**
   ```sql
   -- Test database connection
   USE bus_booking;
   SELECT COUNT(*) FROM routes;
   ```

## Production Deployment

### Environment Variables
Create `.env` file:
```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=bus_booking
JWT_SECRET=your_secret_key
```

### Security Considerations
1. Use strong JWT secret
2. Enable HTTPS in production
3. Validate all user inputs
4. Implement rate limiting
5. Use environment variables for secrets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: info@safaribus.co.tz
- Phone: +255 22 123 4567
- Office: Ubungo Bus Terminal, Dar es Salaam

---

**SafariBus** - Your trusted travel partner across Tanzania 🚌

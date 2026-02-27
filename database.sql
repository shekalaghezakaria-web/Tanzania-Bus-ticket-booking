-- =====================================================
-- Tanzanian Bus Ticket Booking System
-- Database Setup Script (MySQL)
-- Generated: 2024
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS bus_booking;
USE bus_booking;

-- Drop existing tables if they exist
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Users Table
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_phone ON users(phone);

-- =====================================================
-- Routes Table
-- =====================================================
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    distance_km INT,
    estimated_hours DECIMAL(3,1),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_routes_from_to ON routes(from_location, to_location);
CREATE INDEX idx_routes_active ON routes(is_active);

-- =====================================================
-- Buses Table
-- =====================================================
CREATE TABLE buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT,
    bus_name VARCHAR(100) NOT NULL,
    bus_type VARCHAR(50) DEFAULT 'Standard',
    departure_time TIME NOT NULL,
    arrival_time TIME,
    total_seats INT DEFAULT 40,
    available_seats INT DEFAULT 40,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);
CREATE INDEX idx_buses_route ON buses(route_id);
CREATE INDEX idx_buses_active ON buses(is_active);
CREATE INDEX idx_buses_departure ON buses(departure_time);

-- =====================================================
-- Seats Table
-- =====================================================
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT,
    seat_number VARCHAR(5) NOT NULL,
    seat_type VARCHAR(20) DEFAULT 'Standard',
    is_booked TINYINT(1) DEFAULT 0,
    is_blocked TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_bus_seat (bus_id, seat_number),
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);
CREATE INDEX idx_seats_bus ON seats(bus_id);
CREATE INDEX idx_seats_booked ON seats(bus_id, is_booked);

-- =====================================================
-- Bookings Table
-- =====================================================
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    bus_id INT,
    seat_number VARCHAR(5) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE,
    status VARCHAR(20) DEFAULT 'confirmed',
    payment_status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    confirmation_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_bus ON bookings(bus_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- =====================================================
-- Sample Routes
-- =====================================================
INSERT INTO routes (from_location, to_location, price, distance_km, estimated_hours) VALUES
('Dar es Salaam', 'Mwanza', 85000, 1140, 12.5),
('Mwanza', 'Dar es Salaam', 85000, 1140, 12.5),
('Mbeya', 'Dar es Salaam', 75000, 850, 10),
('Dar es Salaam', 'Mbeya', 75000, 850, 10),
('Dodoma', 'Mbeya', 65000, 650, 8.5),
('Mbeya', 'Dodoma', 65000, 650, 8.5),
('Mbeya', 'Arusha', 70000, 750, 9),
('Arusha', 'Mbeya', 70000, 750, 9),
('Morogoro', 'Tanga', 45000, 280, 4.5),
('Tanga', 'Morogoro', 45000, 280, 4.5);

-- =====================================================
-- Sample Buses
-- =====================================================
INSERT INTO buses (route_id, bus_name, bus_type, departure_time, arrival_time) VALUES
(1, 'Kilimanjaro Express', 'Luxury', '08:00:00', '20:30:00'),
(1, 'Meru Bus Service', 'Standard', '14:00:00', '02:30:00'),
(2, 'Victoria Coach', 'Luxury', '06:30:00', '19:00:00');

-- =====================================================
-- Generate Seats for Each Bus (40 seats per bus)
-- =====================================================
DELIMITER //
CREATE PROCEDURE generate_seats()
BEGIN
    DECLARE bus_id_val INT;
    DECLARE seat_row INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE bus_cursor CURSOR FOR SELECT id FROM buses;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN bus_cursor;
    read_loop: LOOP
        FETCH bus_cursor INTO bus_id_val;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SET seat_row = 1;
        WHILE seat_row <= 10 DO
            INSERT INTO seats (bus_id, seat_number, seat_type) VALUES
            (bus_id_val, CONCAT(LPAD(seat_row,2,'0'),'A'), 'Window'),
            (bus_id_val, CONCAT(LPAD(seat_row,2,'0'),'B'), 'Window'),
            (bus_id_val, CONCAT(LPAD(seat_row,2,'0'),'C'), 'Aisle'),
            (bus_id_val, CONCAT(LPAD(seat_row,2,'0'),'D'), 'Aisle');
            SET seat_row = seat_row + 1;
        END WHILE;
    END LOOP;
    CLOSE bus_cursor;
END //
DELIMITER ;

CALL generate_seats();
DROP PROCEDURE generate_seats;

-- =====================================================
-- Database Setup Complete
-- =====================================================
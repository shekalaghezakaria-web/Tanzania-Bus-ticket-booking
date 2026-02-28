-- Add unique constraint to prevent duplicate bookings
-- This ensures the same seat cannot be booked for the same bus on the same travel date

ALTER TABLE bookings 
ADD CONSTRAINT unique_seat_booking 
UNIQUE (bus_id, travel_date, seat_number);

-- Add index for better performance on booking checks
CREATE INDEX idx_booking_seat_check ON bookings(bus_id, travel_date, seat_number);

-- Show the constraint
SHOW CREATE TABLE bookings;

-- Add password field to users table for proper authentication
ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER phone;

-- Update existing users with temporary passwords (phone number as password for now)
UPDATE users SET password = CONCAT('temp_', phone) WHERE password IS NULL;

-- Add index for faster lookups
CREATE INDEX idx_users_phone_password ON users(phone, password);

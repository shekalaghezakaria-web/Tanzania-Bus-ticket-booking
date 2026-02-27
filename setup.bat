@echo off
echo Setting up Bus Ticket Booking System...

echo.
echo Step 1: Installing Node.js dependencies...
echo If you get execution policy errors, run PowerShell as Administrator and execute:
echo Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
echo.

npm install express pg cors body-parser bcryptjs jsonwebtoken nodemon

echo.
echo Step 2: Database setup required!
echo.
echo Please follow these steps:
echo 1. Make sure PostgreSQL is installed and running
echo 2. Create a database named "bus_booking"
echo 3. Run the database.sql file in PostgreSQL:
echo    psql -d bus_booking -f database.sql
echo 4. Update your database credentials in db.js file
echo.

echo Step 3: Starting the server...
echo.

npm start

pause

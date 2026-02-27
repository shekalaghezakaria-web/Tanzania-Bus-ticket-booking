# Bus Ticket Booking System Setup Script
Write-Host "Setting up Bus Ticket Booking System..." -ForegroundColor Green

Write-Host "`nStep 1: Installing Node.js dependencies..." -ForegroundColor Yellow
Write-Host "If you get execution policy errors, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`n" -ForegroundColor Cyan

try {
    npm install express pg cors body-parser bcryptjs jsonwebtoken nodemon
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error installing dependencies. Please check your npm installation." -ForegroundColor Red
    Write-Host "You may need to run PowerShell as Administrator." -ForegroundColor Yellow
}

Write-Host "`nStep 2: Database setup required!" -ForegroundColor Yellow
Write-Host "Please follow these steps:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is installed and running" -ForegroundColor White
Write-Host "2. Create a database named 'bus_booking'" -ForegroundColor White
Write-Host "3. Run the database.sql file in PostgreSQL:" -ForegroundColor White
Write-Host "   psql -d bus_booking -f database.sql" -ForegroundColor Gray
Write-Host "4. Update your database credentials in db.js file" -ForegroundColor White

Write-Host "`nStep 3: Starting the server..." -ForegroundColor Yellow

try {
    npm start
} catch {
    Write-Host "Error starting server. Please check the error messages above." -ForegroundColor Red
}

Write-Host "`nSetup completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"

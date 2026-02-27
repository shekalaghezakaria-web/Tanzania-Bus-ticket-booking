# Quick Installation Guide

## For Windows Users

### Method 1: Using Setup Scripts (Recommended)

1. **Run the PowerShell Setup Script:**
   ```powershell
   # Right-click on setup.ps1 and "Run with PowerShell"
   # Or run in PowerShell:
   .\setup.ps1
   ```

2. **If you get execution policy errors:**
   ```powershell
   # Run PowerShell as Administrator and execute:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Method 2: Manual Installation

1. **Install Dependencies:**
   ```bash
   npm install express mysql2 cors body-parser bcryptjs jsonwebtoken nodemon
   ```

2. **Setup Database:**
   - Install MySQL
   - Create database: `bus_booking`
   - Import schema: `mysql -u root -p bus_booking < database.sql`

3. **Configure Database:**
   - Edit `db.js` with your MySQL credentials

4. **Start Server:**
   ```bash
   npm start
   ```

## Database Setup

### Using MySQL Workbench:
1. Connect to MySQL server
2. Create database named "bus_booking"
3. Open Query Editor
4. Copy contents of `database.sql`
5. Execute the script

### Using Command Line:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE bus_booking"

# Import schema
mysql -u root -p bus_booking < database.sql
```

## Troubleshooting

### npm Execution Policy Error
```powershell
# Run as Administrator:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm start
```

### Database Connection Issues
1. Verify MySQL is running
2. Check credentials in `db.js`
3. Ensure database name matches: "bus_booking"

## Quick Start

1. Run setup script or manual installation
2. Open browser to: `http://localhost:3000`
3. Register a new account
4. Start booking tickets!

## Need Help?

- Check README.md for detailed instructions
- Email: info@safaribus.co.tz
- Phone: +255 22 123 4567

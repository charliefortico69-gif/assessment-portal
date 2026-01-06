@echo off
echo 🚀 Assessment Portal Windows Deployment

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Install PM2 globally
echo 📦 Installing PM2...
npm install -g pm2
npm install -g pm2-windows-startup

REM Setup PM2 Windows service
pm2-startup install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install --production

REM Install frontend dependencies and build
echo 📦 Building frontend...
cd ..\frontend
npm install
npm run build

REM Setup environment
echo ⚙️ Setting up environment...
cd ..\backend
copy .env.production .env

REM Seed database (make sure MongoDB is running)
echo 🌱 Seeding database...
node seed.js

REM Start with PM2
echo ⚙️ Starting application with PM2...
cd ..
pm2 start ecosystem.config.js --env production
pm2 save

echo ✅ Deployment completed!
echo 🌐 Backend running on: http://localhost:5000
echo 🌐 Frontend build created in: frontend/build
echo 📊 Monitor with: pm2 monit
echo 📝 View logs with: pm2 logs
echo.
echo 🔑 Default credentials:
echo Admin: admin@test.com / password123
echo Faculty: faculty.cs@test.com / password123
echo Student: student1@test.com / password123
pause
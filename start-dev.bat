@echo off
echo 🚀 Starting BloodLink Development Environment...
echo.

echo 📦 Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🔧 Setting up environment...
if not exist backend\.env (
    echo 📝 Creating backend .env file...
    copy backend\.env.example backend\.env
    echo ✅ Created backend/.env file
    echo ⚠️  Please edit backend/.env with your MongoDB URI and JWT secrets
) else (
    echo ✅ Backend .env file already exists
)

echo.
echo 🗄️  Checking MongoDB connection...
echo ⚠️  Make sure MongoDB is running on your system
echo    - Local: sudo systemctl start mongod
echo    - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest

echo.
echo 🌱 Optional: Seed database with sample data
set /p seed="Do you want to seed the database? (y/n): "
if /i "%seed%"=="y" (
    echo 📊 Seeding database...
    cd backend
    call node scripts/seed.js
    cd ..
)

echo.
echo 🚀 Starting both frontend and backend...
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    Health:   http://localhost:5000/health
echo.

call npm run dev:full

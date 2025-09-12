#!/bin/bash

echo "🚀 Starting BloodLink Development Environment..."
echo

echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

echo
echo "🔧 Setting up environment..."
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file"
    echo "⚠️  Please edit backend/.env with your MongoDB URI and JWT secrets"
else
    echo "✅ Backend .env file already exists"
fi

echo
echo "🗄️  Checking MongoDB connection..."
echo "⚠️  Make sure MongoDB is running on your system"
echo "   - Local: sudo systemctl start mongod"
echo "   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"

echo
read -p "🌱 Do you want to seed the database with sample data? (y/n): " seed
if [[ $seed == "y" || $seed == "Y" ]]; then
    echo "📊 Seeding database..."
    cd backend
    node scripts/seed.js
    cd ..
fi

echo
echo "🚀 Starting both frontend and backend..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/health"
echo

npm run dev:full

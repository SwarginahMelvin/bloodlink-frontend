# BloodLink - Blood Donation Management System

A complete blood donation management system with React frontend and Node.js backend.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone and Setup

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd bloodlink-frontend

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/bloodlink
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

### 3. Start MongoDB

#### Option A: Local MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or on Windows
net start MongoDB
```

#### Option B: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run Both Frontend and Backend

#### Option A: Run in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Option B: Use the Convenience Script

```bash
# Run both frontend and backend together
npm run dev:full
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
bloodlink-frontend/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── App.jsx            # Main App component
│   └── ...
├── backend/               # Backend Node.js code
│   ├── controllers/       # API controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── server.js         # Main server file
├── package.json          # Frontend dependencies
└── README.md            # This file
```

## 🔧 Development Commands

### Frontend Commands
```bash
npm run dev          # Start frontend development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Commands
```bash
cd backend
npm run dev          # Start backend with nodemon
npm start            # Start backend in production
npm test             # Run tests
node scripts/seed.js # Seed database with sample data
```

### Full Stack Commands
```bash
npm run dev:full     # Start both frontend and backend
npm run build:full   # Build both frontend and backend
```

## 🗄️ Database Setup

### Seed Sample Data (Optional)
```bash
cd backend
node scripts/seed.js
```

This will create:
- 1 Admin user: `admin@bloodlink.com` / `admin123`
- 4 Sample users with different blood types
- Sample blood requests and donations

## 🔗 API Integration

The frontend is configured to connect to the backend API at `http://localhost:5000`. 

### Key API Endpoints:
- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`
- **Users**: `GET /api/users/profile`, `PUT /api/users/profile`
- **Donors**: `GET /api/donors/search`, `GET /api/donors/nearby`
- **Blood Requests**: `GET /api/requests`, `POST /api/requests`
- **Admin**: `GET /api/admin/dashboard`

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Or check Docker container
   docker ps | grep mongo
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000 (backend)
   lsof -ti:5000 | xargs kill -9
   
   # Kill process on port 5173 (frontend)
   lsof -ti:5173 | xargs kill -9
   ```

3. **CORS Issues**
   - Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Default: `http://localhost:5173`

4. **Module Not Found Errors**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   # For backend
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📱 Features

### Frontend Features:
- ✅ Responsive design for all screen sizes
- ✅ User authentication (Login/Register)
- ✅ Blood donor search and matching
- ✅ Blood request management
- ✅ User profile management
- ✅ Admin dashboard
- ✅ Real-time notifications

### Backend Features:
- ✅ RESTful API with Express.js
- ✅ JWT authentication
- ✅ MongoDB database with Mongoose
- ✅ Role-based access control
- ✅ Input validation and error handling
- ✅ Rate limiting and security
- ✅ Comprehensive API documentation

## 🚀 Production Deployment

### Frontend Build:
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment:
```bash
cd backend
npm start
# Use PM2 for production: pm2 start server.js --name bloodlink-api
```

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check the console logs for error messages

---

**BloodLink** - Connecting donors with those in need, one drop at a time. 🩸
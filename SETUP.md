# BloodLink Setup Guide

This guide will help you set up the complete BloodLink application with Frontend, Backend, and MongoDB Atlas connection.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

## Project Structure

```
bloodlink-frontend/
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   └── server.js           # Main server file
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── services/           # API service layer
│   └── hooks/              # Custom React hooks
└── package.json            # Frontend dependencies
```

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB Atlas credentials:
   ```env
   MONGODB_URI=mongodb+srv://nehhadharshini:Nehha@1115@bloodlink.mdjjxtd.mongodb.net/?retryWrites=true&w=majority&appName=bloodlink
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will be available at: `http://localhost:5000`

### 2. Frontend Setup

1. Navigate to the root directory:
   ```bash
   cd ..
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. The frontend environment is already configured in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:5173`

### 3. MongoDB Atlas Configuration

The MongoDB Atlas connection is already configured with the provided connection string:
```
mongodb+srv://nehhadharshini:Nehha@1115@bloodlink.mdjjxtd.mongodb.net/?retryWrites=true&w=majority&appName=bloodlink
```

#### Database Collections

The application will automatically create the following collections:
- `users` - User accounts and donor profiles
- `bloodrequests` - Blood donation requests
- `donations` - Donation records
- `notifications` - User notifications

## Running the Complete Application

### Option 1: Run Both Services Separately

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Option 2: Run Both Services Together

```bash
npm run dev:full
```

This command will start both frontend and backend concurrently.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/donations` - Get donation history
- `PUT /api/users/availability` - Update availability status

### Donors
- `GET /api/donors/search` - Search for donors
- `GET /api/donors/nearby` - Find nearby donors
- `POST /api/donors/register` - Register as donor
- `GET /api/donors/:id` - Get donor profile

### Blood Requests
- `GET /api/requests` - Get blood requests
- `POST /api/requests` - Create blood request
- `GET /api/requests/:id` - Get specific request
- `PUT /api/requests/:id` - Update blood request
- `DELETE /api/requests/:id` - Delete blood request

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/donors/:id/verify` - Verify donor

## Health Check

Backend health check: `GET http://localhost:5000/health`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify the connection string is correct
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure network access is configured properly

2. **CORS Issues**
   - Frontend URL is configured in backend CORS settings
   - Default: `http://localhost:5173`

3. **Port Conflicts**
   - Backend default port: 5000
   - Frontend default port: 5173
   - Change ports in environment files if needed

4. **Environment Variables**
   - Ensure `.env` file exists in backend directory
   - Frontend environment variables must start with `VITE_`

### Development Tools

- Backend logs: Check console output for API requests and database connections
- Frontend: Use browser developer tools for debugging
- Database: Use MongoDB Compass or Atlas web interface

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Enable MongoDB Atlas IP whitelisting
- Use HTTPS in production environments

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use secure JWT secrets
3. Configure proper CORS origins
4. Enable MongoDB Atlas security features
5. Use environment-specific connection strings

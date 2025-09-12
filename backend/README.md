# BloodLink Backend API

A comprehensive backend API for the BloodLink blood donation management system built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Donor, Admin)
  - Password reset functionality
  - Email verification

- **Blood Donation Management**
  - Blood request creation and management
  - Donor matching system
  - Donation tracking
  - Blood type compatibility checking

- **User Management**
  - User registration and profile management
  - Donor availability tracking
  - Donation history
  - Location-based donor search

- **Admin Panel**
  - Dashboard with statistics
  - User management
  - System analytics
  - Blood request monitoring

- **Notifications System**
  - Real-time notifications
  - Email notifications
  - SMS alerts (configurable)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bloodlink-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bloodlink
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| GET | `/api/auth/verify-email/:token` | Verify email address | Public |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update user profile | Private |
| DELETE | `/api/users/account` | Delete user account | Private |
| GET | `/api/users/donations` | Get donation history | Private |
| PUT | `/api/users/availability` | Update availability | Private |
| GET | `/api/users/notifications` | Get notifications | Private |
| PUT | `/api/users/notifications/:id/read` | Mark notification as read | Private |

### Donor Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/donors/search` | Search donors | Public |
| GET | `/api/donors/nearby` | Get nearby donors | Public |
| GET | `/api/donors/:id` | Get donor profile | Private |
| POST | `/api/donors/match` | Match donors for request | Private |

### Blood Request Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/requests` | Create blood request | Private |
| GET | `/api/requests` | Get blood requests | Private |
| GET | `/api/requests/:id` | Get blood request by ID | Private |
| PUT | `/api/requests/:id` | Update blood request | Private |
| DELETE | `/api/requests/:id` | Delete blood request | Private |
| POST | `/api/requests/:id/match` | Match donors to request | Private |
| POST | `/api/requests/:id/fulfill` | Fulfill blood request | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/admin/dashboard` | Get dashboard stats | Admin |
| GET | `/api/admin/analytics` | Get system analytics | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/status` | Update user status | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/blood-requests` | Get all blood requests | Admin |
| GET | `/api/admin/donations` | Get all donations | Admin |

## 🗄️ Database Models

### User Model
- Personal information (name, email, phone, blood type)
- Profile details (address, emergency contact)
- Donation history
- Availability status
- Role-based permissions

### BloodRequest Model
- Patient information
- Blood type and units required
- Hospital details
- Contact information
- Urgency level
- Status tracking

### Donation Model
- Donor information
- Blood request reference
- Donation details (date, location, volume)
- Health check results
- Verification status

### Notification Model
- Recipient information
- Notification type and content
- Read status
- Priority level
- Expiration date

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API request limiting
- **Input Validation** - Request validation
- **Password Hashing** - bcrypt encryption
- **JWT Tokens** - Secure authentication

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name bloodlink-api
pm2 startup
pm2 save
```

### Using Docker
```bash
# Build image
docker build -t bloodlink-backend .

# Run container
docker run -d -p 5000:5000 --name bloodlink-api bloodlink-backend
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bloodlink` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Logging**: Morgan HTTP request logger
- **Error Handling**: Centralized error handling
- **Performance**: Compression middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**BloodLink Backend API** - Connecting donors with those in need, one drop at a time. 🩸

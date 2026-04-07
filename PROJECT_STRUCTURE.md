# Restaurant Booking API - Project Structure

## 📁 Project Organization

```
restaurant-be/
├── src/                          # Source code
│   ├── config/
│   │   └── database.js          # MongoDB connection & initialization
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User bookings logic
│   │   └── adminController.js   # Admin management logic
│   ├── middleware/
│   │   └── auth.js              # JWT authentication & authorization
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── userRoutes.js        # User booking endpoints
│   │   └── adminRoutes.js       # Admin management endpoints
│   └── utils/
│       └── helpers.js           # Helper functions (OTP, token generation)
├── index.js                      # Main application entry point
├── init-db.js                    # Database initialization script
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── swagger-def.js               # Swagger/OpenAPI documentation
```

## 🏗️ Architecture Overview

### **Models/Collections**
- **users**: User accounts and admin profiles
- **tables**: Restaurant table information
- **time_slots**: Available booking time slots
- **bookings**: Customer reservations

### **Controllers**
Business logic separated by feature:
- **authController**: Signup, OTP verification, admin login
- **userController**: Booking management
- **adminController**: Table, time slot, and user management

### **Routes**
Clean RESTful endpoints:
- `/api/auth/*` - Authentication
- `/api/admin/*` - Administration
- `/api/*` - User bookings

### **Middleware**
- **auth.js**: JWT token verification and role-based access control

### **Config**
- **database.js**: MongoDB connection and collection initialization

### **Utils**
- **helpers.js**: Reusable functions like token/OTP generation

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Initialize Database & Create Admin
```bash
npm run init-db
```

### Start Development Server (with hot reload)
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

## 📚 API Documentation

After starting the server, visit:
```
http://localhost:3000/api-docs
```

## 🔐 Environment Variables (.env)

```env
MONGODB_CONNECTION_STRING=mongodb+srv://[user]:[password]@[cluster].mongocluster.cosmos.azure.com/...
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/send-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP & Login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/profile` - Get user profile

### User Bookings
- `GET /api/slots` - Get available time slots
- `GET /api/tables/available` - Get available tables
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `DELETE /api/bookings/:id` - Cancel booking

### Admin Management
- `POST /api/admin/tables` - Create table
- `GET /api/admin/tables` - Get all tables
- `PUT /api/admin/tables/:id` - Update table
- `POST /api/admin/slots/generate` - Generate time slots
- `PUT /api/admin/slots/:id` - Update time slot status
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/users` - Get all users

## 🔑 Features

✅ **Modular Structure** - Clean separation of concerns  
✅ **MVC Pattern** - Models, Views (routes), Controllers  
✅ **MongoDB Integration** - Scalable NoSQL database  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Role-based Access** - User & Admin permissions  
✅ **OTP Verification** - Two-factor authentication  
✅ **Swagger Documentation** - Auto-generated API docs  
✅ **Error Handling** - Comprehensive error responses  
✅ **Hot Reload** - Development with nodemon

## 🛠️ Development

The project uses:
- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Nodemon** - Auto-restart on changes
- **Swagger** - API documentation

## 📖 Code Examples

### Adding a New Route
1. Create controller method in `src/controllers/`
2. Add route in `src/routes/`
3. Restart server

### Adding Middleware
1. Create middleware in `src/middleware/`
2. Import and use in routes
3. Apply to routes that need it

---

**Happy Coding! 🎉**

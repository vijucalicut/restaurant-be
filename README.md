# Restaurant Booking API

A Node.js backend API for restaurant table booking with OTP-based user authentication and admin management.

## Features

- **OTP-based User Authentication**: Users sign up and login using phone number and OTP
- **Admin Password Authentication**: Admins login with email and password
- **Table Management**: Admins can create and manage restaurant tables
- **Time Slot Management**: Admins can generate and manage 30-minute time slots
- **Table Booking**: Users can book available tables for specific time slots
- **Azure Cosmos DB**: NoSQL database for storing users, tables, slots, and bookings

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file:
```
COSMOS_ENDPOINT=your_cosmos_endpoint_here
COSMOS_KEY=your_cosmos_key_here
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

3. Initialize the database and create admin user:
```bash
npm run init-db
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### User Authentication (OTP-based)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get current user profile

#### Admin Authentication
- `POST /api/auth/admin-login` - Admin login with email/password

### Admin Routes (Require Admin Authentication)

#### Table Management
- `POST /api/admin/tables` - Create a new table
- `GET /api/admin/tables` - Get all tables
- `PUT /api/admin/tables/:id` - Update table details

#### Time Slot Management
- `POST /api/admin/slots/generate` - Generate time slots for a date
- `PUT /api/admin/slots/:id` - Enable/disable time slot

#### Admin Views
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/users` - Get all users

### User Routes (Require User Authentication)

#### Booking Management
- `GET /api/slots?date=YYYY-MM-DD` - Get time slots for a date
- `GET /api/tables/available?date=YYYY-MM-DD&slotId=slot_id` - Get available tables for a slot
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `DELETE /api/bookings/:id` - Cancel a booking

## Default Admin Credentials

After running `npm run init-db`, you can login as admin with:
- Email: `admin@restaurant.com`
- Password: `admin123`

## Database Schema

### Users Container
```json
{
  "id": "string",
  "email": "string",
  "password": "string (hashed, admin only)",
  "name": "string",
  "phone": "string",
  "role": "user|admin",
  "isVerified": "boolean",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Tables Container
```json
{
  "id": "string",
  "tableNumber": "number",
  "capacity": "number",
  "location": "string",
  "isActive": "boolean",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Time Slots Container
```json
{
  "id": "date_startTime_endTime",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "isActive": "boolean",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Bookings Container
```json
{
  "id": "string",
  "userId": "string",
  "tableId": "string",
  "slotId": "string",
  "date": "YYYY-MM-DD",
  "numberOfGuests": "number",
  "status": "confirmed|cancelled",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

## Usage Examples

### User Flow
1. User signs up with email, name, and phone
2. User requests OTP by providing phone number
3. User verifies OTP to login and receive JWT token
4. User can view available time slots and tables
5. User can create bookings for available tables
6. User can view and cancel their bookings

### Admin Flow
1. Admin logs in with email and password
2. Admin can create and manage tables
3. Admin can generate time slots for specific dates
4. Admin can enable/disable specific time slots
5. Admin can view all bookings and users

## Security Notes

- JWT tokens expire in 24 hours
- OTPs are valid for 5 minutes
- Admin passwords are hashed with bcrypt
- All admin routes require authentication and admin role
- User routes require authentication
- In production, integrate with SMS service for OTP delivery
- Store JWT_SECRET securely in environment variables
# Socio-Economic Survey System - Backend

This is the backend API for the Socio-Economic Survey System built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT tokens
- Role-based access control (ADMIN, SUPERVISOR, SURVEYOR)
- State and district management
- Slum creation and management
- Survey assignment system
- Household survey data collection
- Data export functionality (CSV)
- RESTful API design

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Database Setup

1. Start MongoDB service on your system

2. Seed the database with default data:
```bash
# Seed default users (admin, supervisor, surveyor)
npm run seed

# Seed states and districts
node scripts/seed-states-districts.js
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get users (admin/supervisor only)

### States & Districts
- `GET /api/admin/states` - Get all states
- `GET /api/admin/states/:id` - Get state by ID
- `GET /api/admin/districts` - Get all districts
- `GET /api/admin/districts/:id` - Get district by ID
- `GET /api/admin/districts/state/:stateId` - Get districts by state

### Slums
- `POST /api/surveys/slums` - Create slum (supervisor/admin only)
- `GET /api/surveys/slums` - Get all slums
- `GET /api/surveys/slums/:id` - Get slum by ID
- `PUT /api/surveys/slums/:id` - Update slum (supervisor/admin only)
- `DELETE /api/surveys/slums/:id` - Delete slum (supervisor/admin only)

### Assignments
- `POST /api/surveys/assignments/assign-slum` - Assign slum to surveyor (supervisor/admin only)
- `GET /api/surveys/assignments` - Get all assignments (supervisor/admin only)
- `GET /api/surveys/assignments/:id` - Get assignment by ID
- `GET /api/surveys/assignments/my-assigned-slums` - Get current user's assignments
- `GET /api/surveys/assignments/surveyor/:userId` - Get assignments for surveyor (supervisor/admin only)
- `PUT /api/surveys/assignments/:id` - Update assignment (supervisor/admin only)

### Household Surveys
- `POST /api/surveys/household` - Create household survey
- `GET /api/surveys/household/:id` - Get household survey by ID
- `PUT /api/surveys/household/:id` - Update household survey
- `POST /api/surveys/household/:id/submit` - Submit household survey
- `GET /api/surveys/households/:slumId` - Get all household surveys for a slum

### Export
- `GET /api/export/slum-surveys` - Export slum surveys to CSV
- `GET /api/export/household-surveys/:slumId` - Export household surveys to CSV

## Default Users (After Seeding)

```bash
Admin:
  Username: admin
  Password: admin123

Supervisor:
  Username: supervisor
  Password: supervisor123

Surveyor:
  Username: surveyor
  Password: surveyor123
```

## Project Structure

```
backend/
├── scripts/                    # Database seeding scripts
│   ├── seed-users.js          # Seed default users
│   └── seed-states-districts.js # Seed states and districts
├── src/
│   ├── controllers/           # Business logic controllers
│   │   ├── authController.js
│   │   ├── locationController.js
│   │   └── survey/
│   │       ├── slumController.js
│   │       ├── assignmentController.js
│   │       └── householdSurveyController.js
│   ├── middlewares/           # Custom middleware
│   │   └── auth.js            # Authentication middleware
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── State.js
│   │   ├── District.js
│   │   ├── Slum.js
│   │   ├── Assignment.js
│   │   ├── SlumSurvey.js
│   │   ├── Household.js
│   │   └── HouseholdSurvey.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── exportRoutes.js
│   │   └── survey/
│   │       └── surveyRoutes.js
│   └── app.js                 # Express application setup
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Authentication

All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Tokens are generated upon successful login and expire after 7 days (configurable).

## Role-Based Access Control

- **ADMIN**: Full access to all features
- **SUPERVISOR**: Can create slums, assign surveys, view all data
- **SURVEYOR**: Can conduct surveys assigned to them

## Error Handling

API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Description of the operation",
  "data": {}, // Present when success is true
  "error": "Error message" // Present when success is false
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
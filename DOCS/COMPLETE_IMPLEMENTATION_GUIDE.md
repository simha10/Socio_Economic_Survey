# Socio-Economic Survey Application - Complete Implementation Guide

## 📋 Overview

This document provides a comprehensive guide to the newly implemented survey application with role-based dashboards, user management, and survey workflows.

## 🎯 System Architecture

### Role-Based Access

- **Admin**: Full system access, user management, slum oversight
- **Supervisor**: User team management, slum creation, assignment management
- **Surveyor**: Survey completion, mobile-optimized dashboard

### Authentication Flow

```
1. User login at /login
2. Backend validates credentials
3. JWT token returned with user role
4. Token stored in localStorage
5. Dashboard role-based routing:
   - ADMIN → /admin/dashboard
   - SUPERVISOR → /supervisor/dashboard
   - SURVEYOR → /surveyor/dashboard
```

## 📱 Frontend Architecture

### Dashboard Layouts

**All Dashboards** have:

- Collapsible sidebar (desktop)
- Role-specific navigation
- Main content area
- Header with user greeting

**Surveyor Dashboard Only** has:

- Bottom navigation bar (mobile app feel)
- Responsive layout optimized for touch

### Navigation Structure

#### Admin Navigation

- Dashboard - System overview and stats
- Users - Create and manage all users
- Slums - View all system slums
- Assignments - Monitor all slum assignments

#### Supervisor Navigation

- Dashboard - Team and assignment stats
- Slums - Create and manage slums
- Assignments - Create slum assignments
- Progress - Track team progress

#### Surveyor Navigation

- Dashboard - Assigned slums and household counts
- Surveys - Survey form pages (in bottom nav)

## 🔧 Backend API Endpoints

### User Management (Admin only)

```
POST   /api/admin/users                Create new user
GET    /api/admin/users                List all users (with optional role filter)
GET    /api/admin/users/:userId        Get user details
PUT    /api/admin/users/:userId        Update user
DELETE /api/admin/users/:userId        Delete user
```

### Slum Management (Admin & Supervisor)

```
POST   /api/admin/slums                Create slum
GET    /api/admin/slums                List slums (filterable)
GET    /api/admin/slums/:slumId        Get slum details
PUT    /api/admin/slums/:slumId        Update slum
DELETE /api/admin/slums/:slumId        Delete slum (Admin only)
```

### Location Data (All roles)

```
GET    /api/admin/states               List states
GET    /api/admin/states/:id           Get state details
GET    /api/admin/districts            List districts
GET    /api/admin/districts/:id        Get district details
GET    /api/admin/districts/state/:stateId  Get districts by state
```

### Assignment Management

```
POST   /api/surveys/assignments        Create assignment
GET    /api/surveys/assignments        List all assignments
GET    /api/surveys/assignments/my     Get surveyor's assignments (formatted)
PUT    /api/surveys/assignments/:id/status         Update assignment status
PUT    /api/surveys/assignments/:id/slum-survey    Update slum survey status
PUT    /api/surveys/assignments/:id/household-progress  Update household progress
```

### Survey Submission (Coming soon)

```
POST   /api/surveys/slum-survey        Submit slum survey
POST   /api/surveys/household-survey   Submit household survey
GET    /api/surveys/slum-survey/:id    Get slum survey
GET    /api/surveys/household-survey/:id   Get household survey
```

## 📊 Data Models

### User

```javascript
{
  _id: ObjectId,
  username: String (unique),
  name: String,
  password: String (hashed),
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR",
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Slum

```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  state: ObjectId (ref: State),
  district: ObjectId (ref: District),
  city: String,
  ward: String,
  slumType: "NOTIFIED" | "NON_NOTIFIED",
  landOwnership: String,
  totalHouseholds: Number,
  surveyStatus: "DRAFT" | "SUBMITTED",
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment

```javascript
{
  _id: ObjectId,
  surveyor: ObjectId (ref: User),
  slum: ObjectId (ref: Slum),
  supervisor: ObjectId (ref: User),
  assignmentType: "FULL_SLUM" | "HOUSEHOLD_ONLY",
  assignedBy: ObjectId (ref: User),
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  slumSurveyStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
  householdSurveyProgress: {
    completed: Number,
    total: Number
  },
  progress: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### SlumSurvey

```javascript
{
  _id: ObjectId,
  slum: ObjectId (ref: Slum),
  surveyor: ObjectId (ref: User),
  assignment: ObjectId (ref: Assignment),

  basicInformation: { ...form fields },
  landStatus: { ...form fields },
  populationAndHealth: { ...form fields },
  literacyEducation: { ...form fields },
  housingStatus: { ...form fields },
  economicStatus: { ...form fields },
  occupationStatus: { ...form fields },
  infrastructure: { ...form fields },
  educationFacilities: { ...form fields },

  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### HouseholdSurvey

```javascript
{
  _id: ObjectId,
  slum: ObjectId (ref: Slum),
  household: String (household identifier),
  surveyor: ObjectId (ref: User),
  assignment: ObjectId (ref: Assignment),

  generalInformation: { ...form fields },
  headOfFamily: { ...form fields },
  familyComposition: { ...form fields },
  povertyStatus: { ...form fields },
  housing: { ...form fields },
  waterAndSanitation: { ...form fields },
  migration: { ...form fields },
  incomeExpenditure: { ...form fields },

  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔑 Key Features

### 1. Admin Dashboard

- View system statistics
- Create users (Admin, Supervisor, Surveyor)
- Manage all slums
- Monitor assignments across system
- View progress metrics

### 2. Supervisor Dashboard

- View team statistics
- Create slums with details
- Assign slums to surveyors
- Track team progress
- Monitor individual surveyor assignments

### 3. Surveyor Dashboard

- View assigned slums
- See household counts for each slum
- Progress indicators for slum surveys
- Progress indicators for household surveys
- Quick action buttons for starting surveys
- Bottom navigation for mobile app feel

### 4. Slum Management

- Create slums with:
  - Name, location, ward
  - State, district, city selection
  - Slum type (notified/non-notified)
  - Land ownership details
  - Total household count
- Update slum information
- View slum assignments

### 5. Assignment Workflow

- Supervisor creates slum
- Supervisor assigns slum to surveyor
- Assignment tracks:
  - Slum survey completion status
  - Household survey progress
  - Overall assignment progress

## 📋 Workflow

### Admin Creates User

1. Navigate to `/admin/users`
2. Click "Create User"
3. Enter: username, name, password, role
4. User created with role-specific permissions

### Supervisor Creates Slum

1. Navigate to `/supervisor/slums`
2. Click "Create Slum" button
3. Fill form:
   - Select state from dropdown
   - Select district from dropdown
   - Enter city, ward, slum name
   - Select slum type
   - Enter land ownership details
   - Enter total households count
4. Slum created and appears in list

### Supervisor Assigns Slum

1. Navigate to `/supervisor/assignments`
2. Click "Create Assignment"
3. Select surveyor from dropdown
4. Select slum from dropdown
5. Click "Assign"
6. Assignment created, surveyor can now access it

### Surveyor Views Assignments

1. Log in as surveyor
2. Dashboard shows assigned slums
3. Each slum card shows:
   - Slum name and ID
   - Total households
   - Slum survey status
   - Household survey progress
4. Two action buttons:
   - "🏘️ Slum Survey" - Start slum-level survey
   - "👥 HH Surveys" - Start household surveys

### Surveyor Completes Slum Survey

1. From dashboard, click "🏘️ Slum Survey"
2. Navigate to `/surveyor/slum-survey/[assignmentId]`
3. Comprehensive form with all slum-level questions (from Slum survey form.md)
4. Fill out form and submit
5. One record created in SlumSurvey collection
6. Status updated to "COMPLETED"

### Surveyor Completes Household Surveys

1. From dashboard, click "👥 HH Surveys"
2. Navigate to `/surveyor/household-survey/[assignmentId]`
3. For each household:
   - Fill household survey form (from Household Survey From.md)
   - Submit
   - One record created in HouseholdSurvey collection
4. Progress bar updates with completed count
5. After all households, mark assignment as complete

## 🚀 Getting Started

### Database Setup

```bash
# Seed default users
npm run seed

# Seed states and districts
node scripts/seed-states-districts.js
```

### Running the Application

```bash
# Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Default Login Credentials

```
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

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected API endpoints
- Token validation on every request
- Role-specific middleware authorization

## 📱 Mobile Optimization

- Responsive layouts for all screen sizes
- Bottom navigation bar for surveyor (mobile-first)
- Touch-friendly buttons and form controls
- Optimized form inputs for mobile devices
- Progressive layout adjustments

## 🎨 UI/UX Enhancements

- Gradient-based color scheme
- Glass-morphism effects
- Smooth transitions and animations
- Clear visual hierarchy
- Accessible color contrast
- Icon-based navigation
- Status indicators with color coding

## 📊 Data Persistence

### SlumSurvey Data Storage

- Single record per slum
- Contains all slum-level survey data
- Linked to Assignment and Surveyor
- Timestamp tracking

### HouseholdSurvey Data Storage

- Multiple records per slum (one per household)
- Contains household-level survey data
- Linked to Assignment, Surveyor, and Slum
- Sequential household identification

## 🔍 Progress Tracking

### Assignment Progress Calculation

- Slum survey: 50% of assignment progress
- All household surveys: 50% of assignment progress
- Real-time progress updates
- Visual progress indicators

## 🚦 Status Tracking

### Slum Survey Status

- `NOT_STARTED`: Awaiting surveyor action
- `IN_PROGRESS`: Surveyor has begun
- `COMPLETED`: Survey submitted

### Household Survey Status (Per household)

- `PENDING`: Not started
- `IN_PROGRESS`: Started by surveyor
- `COMPLETED`: Submitted

### Assignment Status

- `PENDING`: Recently assigned
- `IN_PROGRESS`: Surveyor started surveys
- `COMPLETED`: All surveys finished

## 📈 Future Enhancements

1. Real-time dashboard updates
2. Export survey data to CSV/Excel
3. Analytics and visualization
4. Offline survey capability
5. Multimedia attachments for surveys
6. Advanced reporting
7. Batch operations
8. Survey templates
9. Comment and feedback system
10. Audit logging

## 🐛 Debugging

Check console logs for:

- Login process steps
- API request/response details
- Role determination and routing
- Storage/localStorage operations
- Component mounting issues

## 📞 Support

For issues or questions, check:

1. Console logs in browser DevTools
2. Backend server logs
3. MongoDB connection status
4. Network tab in DevTools
5. API response details

## ✅ Implementation Checklist

- [x] Frontend components (Sidebar, BottomNav, DashboardLayout)
- [x] Admin dashboard page
- [x] Supervisor dashboard page
- [x] Surveyor dashboard page
- [x] User management endpoints
- [x] Slum management endpoints
- [x] Assignment endpoints
- [x] Role-based routing
- [ ] Survey form pages (slum and household)
- [ ] Survey submission endpoints
- [ ] Data persistence and validation
- [ ] End-to-end testing
- [ ] Export functionality
- [ ] Analytics dashboard

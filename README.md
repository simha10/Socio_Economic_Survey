# Socio-Economic Survey (SES) System

A comprehensive full-stack web application for conducting and managing socio-economic surveys in slum areas. The system enables administrators, supervisors, and surveyors to collaborate in collecting, tracking, and analyzing household survey data.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Survey Workflow](#survey-workflow)
- [File Descriptions](#file-descriptions)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Project Overview

The Socio-Economic Survey System is designed to streamline the process of conducting household surveys in slum communities. The application allows:

- **Administrators** to manage system users and view comprehensive reports
- **Supervisors** to create and manage slums, assign slums to surveyors, and track progress
- **Surveyors** to conduct two types of surveys: Slum-level surveys (infrastructure, utilities) and Household-level surveys (family details, living conditions, assets)

The system maintains data integrity through role-based access control and ensures survey progress is tracked in real-time.

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16.1.1 (React 19+)
- **Language**: TypeScript
- **Build Tool**: Turbopack
- **Styling**: TailwindCSS 3.x
- **State Management**: React Hooks (useState, useContext)
- **HTTP Client**: Axios (via API Service pattern)
- **UI Components**: Custom components (Button, Card, Input, Select, Checkbox, etc.)

### Backend

- **Framework**: Express.js 4.x
- **Language**: Node.js (JavaScript)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Middleware**: CORS, Body Parser, Error handling

### Database

- **Primary**: MongoDB
- **Models**: User, Slum, Household, Assignment, SlumSurvey, HouseholdSurvey, State, District

### DevOps

- **Package Manager**: npm / yarn
- **Environment**: Development (localhost:5000 backend, localhost:3000 frontend)

---

## ✨ Features

### 1. **User Management**

- Three user roles: ADMIN, SUPERVISOR, SURVEYOR
- JWT-based authentication
- Role-based access control (RBAC)
- User registration and login

### 2. **Slum Management**

- Create, read, update, delete (CRUD) slums
- Assign slums to specific states and districts
- Track slum type and total household count
- One-slum-one-surveyor assignment rule (no duplicate assignments)

### 3. **Assignment Workflow**

- Supervisors assign slums to surveyors
- Automatic validation to prevent duplicate slum assignments
- Track assignment status and progress
- Dashboard displays current assignments

### 4. **Slum Survey**

- One survey per slum (one-time)
- ~40 questions covering:
  - General population access
  - Water supply infrastructure
  - Drainage systems
  - Water logging areas
  - Waste management
  - Sanitation facilities
- Status tracking: Completed / Not Started
- Full-screen mode for focused surveying

### 5. **Household Survey**

- Multiple surveys per slum's households
- Form sections:
  - Basic Information (head name, age, occupation)
  - Family Details (members, education level)
  - Housing Condition (materials used)
  - Amenities (electricity, water, toilet, TV, phone, etc.)
  - Additional Info (income, notes)
- Progress tracking per slum
- Full-screen mode for focused surveying

### 6. **Dashboard & Analytics**

- **Surveyor Dashboard**: View assigned slums, survey progress, KPI cards
- Assignment statistics: total, completed, in progress, pending
- Real-time progress bars showing household survey completion
- Slum survey status indicator (Completed / Not Started)

### 7. **Location Hierarchy**

- State → District → Slum
- Geographical organization of survey areas
- Cascading selection in forms

---

## 📁 Project Structure

```
Socio_Economic_Survey/
├── backend/
│   ├── package.json
│   ├── README.md
│   ├── scripts/
│   │   ├── seed-states-districts.js      # Seeds initial state/district data
│   │   └── seed-users.js                 # Seeds initial users
│   ├── src/
│   │   ├── app.js                        # Express app setup, middleware, routes
│   │   ├── controllers/
│   │   │   ├── authController.js         # Login, registration, JWT verification
│   │   │   ├── locationController.js     # State and District CRUD
│   │   │   ├── userController.js         # User management
│   │   │   ├── slumController.js         # Slum CRUD operations
│   │   │   └── survey/
│   │   │       ├── assignmentController.js    # Assignment creation, management
│   │   │       ├── slumSurveyController.js    # Slum survey operations
│   │   │       └── householdSurveyController.js # Household survey operations
│   │   ├── middlewares/
│   │   │   └── auth.js                   # JWT verification middleware
│   │   ├── models/
│   │   │   ├── User.js                   # User schema (name, email, role, password)
│   │   │   ├── Slum.js                   # Slum schema (name, type, totalHouseholds)
│   │   │   ├── Household.js              # Household schema (doorNo, slumId)
│   │   │   ├── Assignment.js             # Assignment schema (surveyorId, slumId)
│   │   │   ├── SlumSurvey.js            # Slum survey responses
│   │   │   ├── HouseholdSurvey.js       # Household survey responses
│   │   │   ├── State.js                  # State/Province schema
│   │   │   └── District.js               # District schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js             # /auth endpoints
│   │   │   ├── adminRoutes.js            # /admin endpoints
│   │   │   ├── exportRoutes.js           # /export endpoints (reports)
│   │   │   └── survey/
│   │   │       └── surveyRoutes.js       # /surveys endpoints
│   │   └── utils/
│   │       ├── errorHandler.js
│   │       ├── responseFormatter.js
│   │       └── validation.js
│   └── .env.example
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.mjs
│   ├── README.md
│   ├── app/
│   │   ├── globals.css                   # Global styles
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Home/login page
│   │   ├── admin/
│   │   │   └── dashboard/page.tsx        # Admin dashboard
│   │   ├── supervisor/
│   │   │   ├── dashboard/page.tsx        # Supervisor dashboard
│   │   │   ├── slums/page.tsx            # Slum management CRUD
│   │   │   └── assignments/page.tsx      # Create slum assignments
│   │   └── surveyor/
│   │       ├── dashboard/page.tsx        # Surveyor dashboard (assigned slums)
│   │       ├── slum-survey/[id]/page.tsx # Slum survey form (full-screen)
│   │       └── household-survey/[id]/page.tsx # Household survey form (full-screen)
│   ├── components/
│   │   ├── Accordion.tsx                 # Collapsible sections
│   │   ├── BottomNav.tsx                 # Mobile bottom navigation
│   │   ├── Button.tsx                    # Reusable button component
│   │   ├── Card.tsx                      # Reusable card component
│   │   ├── Checkbox.tsx                  # Checkbox input
│   │   ├── DashboardLayout.tsx           # Layout for dashboards
│   │   ├── DeleteConfirmationDialog.tsx  # Confirmation modal
│   │   ├── Input.tsx                     # Text/number input component
│   │   ├── Select.tsx                    # Dropdown select component
│   │   ├── Sidebar.tsx                   # Navigation sidebar
│   │   ├── SlumForm.tsx                  # Slum creation/editing form
│   │   ├── Stepper.tsx                   # Multi-step progress indicator
│   │   ├── SupervisorAdminLayout.tsx     # Layout for supervisor/admin
│   │   ├── SurveyorLayout.tsx            # Layout for surveyor (can be full-screen)
│   │   └── Toast.tsx                     # Notification system
│   ├── contexts/
│   │   └── SidebarContext.tsx            # Global sidebar state
│   ├── services/
│   │   └── api.ts                        # Centralized API client (Axios wrapper)
│   ├── types/
│   │   └── global.d.ts                   # TypeScript global types
│   ├── utils/
│   │   ├── colors.ts                     # Color constants
│   │   ├── constants.ts                  # App constants
│   │   └── navigationConfig.ts           # Navigation structure
│   └── public/                           # Static assets
│
├── DOCS/
│   ├── README.md                         # Documentation index
│   ├── API_ENDPOINTS.md                  # Complete API reference
│   ├── IMPLEMENTATION_GUIDE.md           # Implementation details
│   ├── QUICK_START_GUIDE.md              # Quick start instructions
│   ├── SLUM_MANAGEMENT_CRUD_GUIDE.md     # Slum CRUD operations
│   └── [20+ other documentation files]   # Detailed guides
│
└── README.md                             # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm** or **yarn**: Latest version
- **MongoDB**: v5.0 or higher (local or Atlas)
- **Git**: For version control
- **VS Code** (recommended): With extensions for TypeScript, ESLint

### Verify Installation

```bash
node --version      # Should be v18+
npm --version       # Should be latest
mongod --version    # Should be v5.0+
```

---

## 🚀 Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Socio_Economic_Survey
```

### 2. Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ses-system
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ses-system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Logging
LOG_LEVEL=debug
```

#### 2.3 Seed Initial Data

```bash
# Seed states and districts
npm run seed:locations

# Seed test users (Admin, Supervisor, Surveyor)
npm run seed:users
```

#### 2.4 Start Backend Server

```bash
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup

#### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

#### 3.2 Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### 3.3 Start Frontend Development Server

```bash
npm run dev
# Application will run on http://localhost:3000
```

---

## ▶️ Running the Project

### Option 1: Run Both Servers Simultaneously (Recommended for Development)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Then open: `http://localhost:3000`

### Option 2: Production Build

**Backend:**

```bash
cd backend
npm run build
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

### Available Scripts

**Backend:**

- `npm run dev` - Start with nodemon (auto-reload)
- `npm run start` - Start production server
- `npm run seed:locations` - Seed states and districts
- `npm run seed:users` - Seed test users
- `npm run lint` - Check code quality

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Check code quality
- `npm run type-check` - Check TypeScript types

---

## 🗄️ Database Schema

### User

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['ADMIN', 'SUPERVISOR', 'SURVEYOR'],
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### State

```javascript
{
  _id: ObjectId,
  name: String (unique),
  code: String,
  population: Number,
  createdAt: Date
}
```

### District

```javascript
{
  _id: ObjectId,
  name: String,
  stateId: ObjectId (ref: State),
  population: Number,
  createdAt: Date
}
```

### Slum

```javascript
{
  _id: ObjectId,
  name: String,
  slumType: String,
  state: ObjectId (ref: State),
  district: ObjectId (ref: District),
  totalHouseholds: Number,
  area: String,
  coordinates: { latitude: Number, longitude: Number },
  createdAt: Date,
  updatedAt: Date
}
```

### Household

```javascript
{
  _id: ObjectId,
  doorNo: String,
  slumId: ObjectId (ref: Slum),
  householdHead: String,
  familyMembers: Number,
  createdAt: Date
}
```

### Assignment

```javascript
{
  _id: ObjectId,
  surveyorId: ObjectId (ref: User),
  slumId: ObjectId (ref: Slum),
  status: Enum ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'],
  assignedDate: Date,
  completedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SlumSurvey

```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId (ref: Assignment),
  surveyorId: ObjectId (ref: User),
  slumId: ObjectId (ref: Slum),
  generalPopulationAccess: String,
  waterSupply: String,
  drainageSystem: String,
  waterLoggingArea: String,
  wastePlacement: String,
  sanitationFacilities: [String],
  notes: String,
  status: Enum ['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'],
  submittedDate: Date,
  createdAt: Date
}
```

### HouseholdSurvey

```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId (ref: Assignment),
  householdId: ObjectId (ref: Household),
  slumId: ObjectId (ref: Slum),
  surveyorId: ObjectId (ref: User),
  headName: String,
  headAge: Number,
  headOccupation: String,
  familyMembers: Number,
  monthlyIncome: Number,
  educationLevel: String,
  housingMaterial: [String],
  amenities: [String],
  notes: String,
  submittedDate: Date,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

### Locations (State & District)

- `GET /locations/states` - Get all states
- `GET /locations/states/:id` - Get specific state
- `GET /locations/districts/:stateId` - Get districts by state
- `POST /locations/states` - Create state (ADMIN)
- `POST /locations/districts` - Create district (ADMIN)

### Slums

- `GET /slums` - Get all slums (with pagination)
- `GET /slums/:id` - Get specific slum
- `POST /slums` - Create slum (SUPERVISOR)
- `PUT /slums/:id` - Update slum (SUPERVISOR)
- `DELETE /slums/:id` - Delete slum (SUPERVISOR)

### Assignments

- `GET /surveys/assignments` - Get all assignments (SUPERVISOR)
- `GET /surveys/assignments/my-assigned-slums` - Get surveyor's assignments (SURVEYOR)
- `GET /surveys/assignments/:id` - Get specific assignment (returns populated assignment with slum data)
- `POST /surveys/assignments` - Create assignment (SUPERVISOR)
- `PUT /surveys/assignments/:id` - Update assignment (SUPERVISOR)
- `DELETE /surveys/assignments/:id` - Delete assignment (SUPERVISOR)
- `GET /surveys/assignments/surveyor/:userId` - Get assignments for specific surveyor (SUPERVISOR)

### Slum Surveys

- `POST /surveys/slum-surveys` - Create slum survey (SURVEYOR)
- `GET /surveys/slum-surveys/:assignmentId` - Get slum survey (SURVEYOR)
- `PUT /surveys/slum-surveys/:id` - Update slum survey (SURVEYOR)
- `GET /surveys/slum-surveys/status/:slumId` - Get slum survey status

### Household Surveys

- `POST /surveys/household-surveys` - Create household survey (SURVEYOR)
- `GET /surveys/household-surveys/:householdId` - Get household survey (SURVEYOR)
- `PUT /surveys/household-surveys/:id` - Update household survey (SURVEYOR)
- `GET /surveys/household-surveys/slum/:slumId` - Get all household surveys for slum

### Users (Admin)

- `GET /users` - Get all users (ADMIN)
- `GET /users/:id` - Get specific user (ADMIN)
- `POST /users` - Create user (ADMIN)
- `PUT /users/:id` - Update user (ADMIN)
- `DELETE /users/:id` - Delete user (ADMIN)

### Reports/Export

- `GET /export/slums` - Export slums data (SUPERVISOR/ADMIN)
- `GET /export/surveys` - Export survey data (SUPERVISOR/ADMIN)
- `GET /export/assignments` - Export assignments (SUPERVISOR/ADMIN)

---

## 👥 User Roles & Permissions

### ADMIN

- Manage system users (create, read, update, delete)
- View comprehensive system reports
- Access all survey data
- Manage states and districts
- Cannot create/assign slums directly

### SUPERVISOR

- Create and manage slums
- Assign slums to surveyors (one-to-one mapping)
- View all assignments and their progress
- Track survey completion rates
- Cannot modify user roles
- Cannot view private user data

### SURVEYOR

- View assigned slums
- Complete slum surveys (one per slum)
- Complete household surveys (multiple per slum)
- View personal assignment progress
- Cannot access other surveyors' assignments
- Cannot assign slums or create new slums

---

## 📊 Survey Workflow

### Step 1: Slum Creation (Supervisor)

1. Supervisor logs in to dashboard
2. Navigates to Slum Management
3. Creates new slum with:
   - Name
   - Type (e.g., "Informal Settlement", "Shantytown")
   - State/District
   - Total households count
4. Slum saved to database

### Step 2: Assignment (Supervisor)

1. Supervisor navigates to Assignments page
2. Selects unassigned slum from dropdown
3. Selects surveyor to assign
4. **Validation**: System prevents duplicate slum assignments
5. Assignment created and stored

### Step 3: Dashboard View (Surveyor)

1. Surveyor logs in to see dashboard
2. Dashboard displays:
   - KPI cards (total assignments, completed, in-progress, pending)
   - Assignment cards showing:
     - Slum name and location
     - Slum survey status (Completed/Not Started)
     - Household survey progress (X/Y households)
     - Progress bar
3. Two action buttons per assignment:
   - **Slum Survey** button
   - **Household Survey** button

### Step 4: Slum Survey (Surveyor)

1. Surveyor clicks "Slum Survey" button
2. Page navigates to `/surveyor/slum-survey/{assignmentId}`
3. Page fetches assignment → extracts slum ID → loads slum details
4. Full-screen survey form opens with ~40 questions:
   - General access
   - Water infrastructure
   - Drainage systems
   - Waste management
   - Sanitation facilities
5. Surveyor completes form and submits
6. Status updates to "COMPLETED" in database

### Step 5: Household Survey (Surveyor)

1. Surveyor clicks "Household Survey" button
2. Page navigates to `/surveyor/household-survey/{assignmentId}`
3. Page fetches assignment → extracts slum ID → loads slum details
4. Full-screen survey form opens for household selection
5. Surveyor completes form for each household:
   - Basic info (head name, age, occupation)
   - Family details
   - Housing condition
   - Available amenities
   - Income and notes
6. Can create multiple household surveys for same slum
7. Progress updates automatically on dashboard

### Step 6: Progress Tracking (Supervisor)

1. Supervisor views assignments page
2. Can see real-time progress:
   - Slum survey completion
   - Household survey progress (X/Y completed)
3. Can track multiple surveyors simultaneously

---

## 📄 File Descriptions

### Backend Files

#### `app.js`

- Express app initialization
- Middleware setup (CORS, body parser, error handling)
- Route imports and registration
- Global error handling

#### `authController.js`

- User registration logic
- Login with JWT generation
- Password hashing with bcrypt
- Token verification

#### `slumController.js`

- CRUD operations for slums
- Extraction and storage of `totalHouseholds` field
- Slum filtering and pagination

#### `assignmentController.js`

- Create assignments with duplicate prevention
- Fetch assignments by supervisor/surveyor
- Calculate SlumSurvey status (one-time per slum)
- Calculate HouseholdSurvey progress (count completed surveys)
- Populate full slum data in responses

#### `survey/surveyRoutes.js`

- Route ordering (static routes before parametrized routes)
- `/assignments/my-assigned-slums` before `/assignments/:id`
- `/assignments/surveyor/:userId` before `/assignments/:id`

### Frontend Files

#### `services/api.ts`

- Centralized Axios instance
- All API calls with error handling
- Methods:
  - `getAssignment(assignmentId)` - Fetch single assignment with populated slum
  - `getMyAssignments()` - Surveyor's assignments
  - `getAllAssignments()` - Supervisor's all assignments
  - `submitSlumSurvey()`
  - `submitHouseholdSurvey()`
  - And many more...

#### `surveyor/dashboard/page.tsx`

- Display surveyor's assigned slums
- Fetch from `getMyAssignments()` which returns survey progress
- Show KPI cards with statistics
- Display assignment cards with progress bars
- Navigate to survey pages with assignment ID

#### `surveyor/slum-survey/[id]/page.tsx`

- Receive assignment ID from route
- Fetch assignment first via `getAssignment(assignmentId)`
- Extract actual slum ID from assignment
- Load slum details
- Display ~40 survey questions
- Full-screen mode (no sidebar, no bottom nav)

#### `surveyor/household-survey/[id]/page.tsx`

- Receive assignment ID from route
- Fetch assignment to get slum ID
- Load household list for slum
- Display household survey form
- Allow multiple household surveys
- Full-screen mode

#### `components/SurveyorLayout.tsx`

- Accepts `fullScreen?: boolean` prop
- When `fullScreen=true`: Only renders content without sidebar/bottom nav
- When `fullScreen=false`: Renders normal layout with navigation

---

## 🔧 Troubleshooting

### Backend Issues

#### 1. MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Start MongoDB service

```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

#### 2. Port 5000 Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution**: Kill process or change port

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

#### 3. JWT Token Issues

```
Error: Invalid token
```

**Solution**: Clear browser storage and re-login

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

### Frontend Issues

#### 1. API Connection Error

```
Error: Failed to fetch http://localhost:5000/api/...
```

**Solution**:

- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled in backend

#### 2. 404 on Survey Pages

```
Error: ReferenceError: slumId is not defined
```

**Solution**: This was fixed by updating to use `assignmentId` from route parameters instead of direct slum ID

#### 3. Blank Survey Pages

```
Page loads but no content displays
```

**Solution**:

- Check browser console for errors
- Verify API response with Network tab
- Ensure assignment exists in database

#### 4. Assignment ID vs Slum ID Confusion

**Pattern**: When navigating from dashboard to survey pages:

```
Route receives: {assignmentId}
Page must:
  1. Fetch assignment via getAssignment(assignmentId)
  2. Extract slumId from assignment.slum._id
  3. Then fetch slum details with actual slumId
```

---

## 📝 Contributing

### Code Style

- Follow ESLint configuration
- Use TypeScript types (frontend)
- Use consistent naming: camelCase for variables, PascalCase for components
- Add JSDoc comments for functions

### Commit Message Format

```
<type>: <subject>

<body>
<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```
feat: add household survey form validation

Implement validation for household survey form fields
to ensure data quality before submission.

Closes #123
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit with meaningful messages
3. Push to repository: `git push origin feature/feature-name`
4. Create pull request with description
5. Wait for review and merge

---

## 🚀 Deployment

### Deployment Checklist

- [ ] Environment variables set correctly
- [ ] MongoDB Atlas connection verified
- [ ] JWT_SECRET changed in production
- [ ] CORS_ORIGIN updated to production URL
- [ ] Frontend API URL points to production backend
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Performance monitoring setup

### Production Commands

```bash
# Backend
cd backend
npm install --production
npm run build
npm start

# Frontend
cd frontend
npm install --production
npm run build
npm start
```

---

## 📞 Support & Contact

For issues, questions, or suggestions:

1. Check the `/DOCS` folder for detailed guides
2. Review API_ENDPOINTS.md for endpoint documentation
3. Check Troubleshooting section above
4. Create an issue in the repository

---

## 📜 License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: January 20, 2026  
**Version**: 1.0.0  
**Status**: Active Development

# Socio-Economic Survey System - Running Guide

## Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- npm or yarn

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file with:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Socio-Economic-Survey
PORT=5000
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### 2. Database Seeding (IMPORTANT - Run in order)

```bash
# Seed default users (admin, supervisor, surveyor)
npm run seed

# Seed states and districts
node scripts/seed-states-districts.js

# (Optional) Seed complete system with slums and assignments
node scripts/seed-complete-assignment-system.js
```

### 3. Start Backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Update API_BASE_URL in utils/constants.ts if needed
# Should be: http://localhost:5000/api
```

### 5. Start Frontend

```bash
npm run dev
# App runs on http://localhost:3000
```

## Login Credentials (After Seeding)

```
Admin:
  Username: admin
  Password: admin123
  Auto-redirects to → /admin/dashboard

Supervisor:
  Username: supervisor
  Password: supervisor123
  Auto-redirects to → /supervisor/dashboard

Surveyor:
  Username: surveyor
  Password: surveyor123
  Auto-redirects to → /surveyor/dashboard
```

## 🎯 Complete Workflow Example

### Step 1: Admin Creates Users

1. Login as **admin** (admin / admin123)
2. Navigate to `/admin/users`
3. Click "Create User"
4. Fill form:
   ```
   Username: supervisor1
   Name: Supervisor One
   Password: sup@123
   Role: SUPERVISOR
   ```
5. Click "Create User"
6. Repeat for:
   ```
   Username: surveyor1
   Name: Surveyor One
   Password: sur@123
   Role: SURVEYOR
   ```

### Step 2: Admin Views System Status

- Dashboard shows all users, slums, assignments
- Monitor progress of all surveys
- View system metrics

### Step 3: Supervisor Creates Slum

1. Logout as admin
2. Login as **supervisor1** (supervisor1 / sup@123)
3. Navigate to `/supervisor/slums`
4. Click "Create Slum"
5. Fill form:
   ```
   Slum Name: ABC Nagar
   Location: Near Bus Stand
   State: [Select from dropdown]
   District: [Select from dropdown]
   City: Mumbai
   Ward: Ward 10
   Slum Type: NOTIFIED
   Land Ownership: Municipal Corporation
   Total Households: 50
   ```
6. Click "Create Slum"

### Step 4: Supervisor Assigns Slum to Surveyor

1. Navigate to `/supervisor/assignments`
2. Click "Create Assignment"
3. Select:
   - Surveyor: surveyor1
   - Slum: ABC Nagar
4. Click "Assign"
5. Assignment created successfully

### Step 5: Supervisor Tracks Progress

1. Navigate to `/supervisor/progress`
2. View all assignments
3. See which surveyors have started surveys
4. Monitor household survey progress

### Step 6: Surveyor Views Assignments

1. Logout as supervisor
2. Login as **surveyor1** (surveyor1 / sur@123)
3. Dashboard automatically loads
4. See assigned slum card:
   - Slum Name: ABC Nagar
   - Total Households: 50
   - Slum Survey Status: PENDING
   - Household Progress: 0/0

### Step 7: Surveyor Completes Slum Survey

1. On surveyor dashboard, click "🏘️ Slum Survey"
2. Navigate to `/surveyor/slum-survey/[assignmentId]`
3. Fill comprehensive slum survey form with:
   - Slum basic information
   - Land status details
   - Population demographics (by caste)
   - Health data
   - Literacy information
   - Housing status
   - Economic data
   - Occupational details
   - Infrastructure details
   - Educational facilities
4. Submit form
5. One record created in `SlumSurvey` collection
6. Dashboard updates: Slum Survey Status → COMPLETED

### Step 8: Surveyor Completes Household Surveys

1. On surveyor dashboard, click "👥 HH Surveys"
2. Navigate to `/surveyor/household-survey/[assignmentId]`
3. For each household (1-50):
   - Fill household survey form:
     - Head of family information
     - Family composition
     - Household details
     - Housing information
     - Water & sanitation
     - Migration details
     - Income & expenditure
   - Submit
   - Progress bar updates: 1/50, 2/50, etc.
4. After all 50 households:
   - 50 records created in `HouseholdSurvey` collection
   - All linked to same slum and assignment
   - Dashboard shows 100% complete

### Step 9: Admin Views Final Results

1. Login as **admin**
2. Dashboard shows:
   - 3 total users (1 admin, 1 supervisor, 1 surveyor)
   - 1 total slum (ABC Nagar)
   - 1 completed assignment
3. Navigate to `/admin/slums`
4. See ABC Nagar with status "SUBMITTED"
5. View all survey data collected

## 📊 Database Records Created

### After Completion

**SlumSurvey Collection:**

- 1 document with all slum-level data

**HouseholdSurvey Collection:**

- 50 documents (one per household)
- All linked to ABC Nagar slum

**Assignment Collection:**

- 1 document with:
  - slumSurveyStatus: COMPLETED
  - householdSurveyProgress: { completed: 50, total: 50 }
  - status: COMPLETED
  - progress: 100

## 📱 UI Features

### Admin Dashboard

- Statistics cards (Users, Slums, Assignments)
- Quick action buttons (Create User, View Slums, View Assignments)
- Collapsible sidebar navigation

### Supervisor Dashboard

- Statistics cards (Surveyors, Slums, Assignments)
- Quick action buttons (Create Slum, Assign Slums, View Progress)
- Collapsible sidebar navigation

### Surveyor Dashboard

- Assigned slums cards showing:
  - Slum name and ID
  - Household count
  - Slum survey status
  - Household survey progress bar
  - Quick action buttons (Slum Survey, HH Surveys)
- Bottom navigation bar (mobile)
- Optimized for small screens

## 🔧 API Endpoints

See [COMPLETE_IMPLEMENTATION_GUIDE.md](COMPLETE_IMPLEMENTATION_GUIDE.md) for full API documentation.

Key endpoints:

```
POST   /api/admin/users
GET    /api/admin/users
POST   /api/admin/slums
GET    /api/admin/slums
POST   /api/surveys/assignments
GET    /api/surveys/assignments/my
PUT    /api/surveys/assignments/:id/slum-survey
```

## 🛠️ Troubleshooting

### Login Issues

- Check token in localStorage
- Verify user credentials in database
- Check API connection in browser DevTools

### API Errors

- Verify backend is running on port 5000
- Check MONGODB_URI in .env
- Review backend console for errors
- Ensure CORS is enabled

### Database Issues

- Verify MongoDB connection
- Check collection names match models
- Seed database if collections missing

## 📋 Next Steps

1. Implement survey form pages (slum and household)
2. Add export functionality
3. Create analytics dashboard
4. Implement offline capabilities
5. Add real-time notifications
6. Create comprehensive reporting
7. Add data validation rules
8. Implement batch operations

## 📚 Documentation

- [IMPLEMENTATION_COMPREHENSIVE_DOCUMENTATION.md](IMPLEMENTATION_COMPREHENSIVE_DOCUMENTATION.md) - Detailed implementation notes
- [COMPLETE_IMPLEMENTATION_GUIDE.md](COMPLETE_IMPLEMENTATION_GUIDE.md) - Full guide with API endpoints
- [PRD.md](PRD.md) - Product requirements
- [UI_Specification.md](UI_Specification.md) - UI/UX design specs

## 🎓 Form References

- [Slum survey form.md](Slum%20survey%20form.md) - Slum survey questionnaire
- [Household Survey From.md](Household%20Survey%20From.md) - Household survey questionnaire
  - Fill in all required fields
  - Save as Draft or Submit

3. **Complete Household Surveys**
   - Click "Start Household Survey" after slum survey
   - Create new household entries
   - Fill in all household details
   - Submit each household

4. **Mark Survey Complete**
   - After all households are submitted
   - Click "Mark Survey Done"
   - Assignment status updates to COMPLETED

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Register new user
- `GET /api/auth/me` - Get current user

### States & Districts

- `GET /api/admin/states` - Get all states
- `GET /api/admin/districts/state/:stateId` - Get districts for state

### Slums

- `POST /api/surveys/slums` - Create slum
- `GET /api/surveys/slums` - List all slums
- `GET /api/surveys/slums/:id` - Get slum details
- `PUT /api/surveys/slums/:id` - Update slum
- `DELETE /api/surveys/slums/:id` - Delete slum (DRAFT only)

### Assignments

- `POST /api/surveys/assignments/assign-slum` - Create assignment
- `GET /api/surveys/assignments/my` - Get surveyor's assignments
- `GET /api/surveys/assignments` - List all assignments

### Surveys

- `POST /api/surveys/slum-survey` - Create slum survey
- `PUT /api/surveys/slum-survey/:id` - Update slum survey
- `POST /api/surveys/slum-survey/:id/submit` - Submit slum survey
- `POST /api/surveys/household` - Create household survey
- `PUT /api/surveys/household/:id` - Update household survey
- `POST /api/surveys/household/:id/submit` - Submit household survey

### Export

- `GET /api/export/slum-surveys` - Export all slum surveys (CSV)
- `GET /api/export/household-surveys/:slumId` - Export household surveys

## Troubleshooting

### States/Districts Not Appearing

```bash
# Make sure you've run the seed script
node scripts/seed-states-districts.js

# Verify MongoDB connection in .env
# Check if collections exist: db.states.find()
```

### Cannot Create Slum

```bash
# Check if states/districts are seeded
# Verify user role is SUPERVISOR or ADMIN
# Check backend logs for validation errors
```

### Assignment Not Working

```bash
# Make sure surveyor role is exactly 'SURVEYOR' (uppercase)
# Verify slum exists in database
# Check if assignment already exists for this surveyor+slum combo
```

### Form Fields Not Saving

```bash
# Check browser console for errors
# Verify JWT token in localStorage
# Check backend logs for 403/401 errors
```

## Project Structure

```
backend/
├── scripts/
│   ├── seed-users.js              # Seed default users
│   ├── seed-states-districts.js   # Seed states and districts
│   └── seed-complete-assignment-system.js
├── src/
│   ├── models/                    # Mongoose schemas
│   ├── controllers/               # Business logic
│   ├── routes/                    # API routes
│   ├── middlewares/               # Auth and validation
│   └── app.js                     # Express app

frontend/
├── app/
│   ├── admin/                     # Admin pages
│   ├── supervisor/                # Supervisor pages
│   ├── surveyor/                  # Surveyor pages
│   └── login/                     # Login page
├── components/                    # React components
├── services/                      # API calls
└── utils/                         # Helpers and constants
```

## Common Tasks

### Reset Database

```bash
# Delete all collections from MongoDB
use 'Socio-Economic-Survey';
db.users.deleteMany({});
db.states.deleteMany({});
db.districts.deleteMany({});
db.slums.deleteMany({});
db.assignments.deleteMany({});

# Re-run seed scripts
node scripts/seed-users.js
node scripts/seed-states-districts.js
```

### Add New Surveyor

Use Admin panel to create new user with SURVEYOR role, or:

```bash
# Manually add via script or MongoDB Compass
```

### View Logs

```bash
# Backend: Check console output
npm run dev

# Frontend: Open browser DevTools (F12)
```

## Performance Notes

- Use pagination when fetching large datasets
- Cache states/districts in frontend after first fetch
- Index MongoDB collections on frequently queried fields
- Use connection pooling for database

## Security Notes

- Never commit .env files with real credentials
- Use strong JWT_SECRET in production
- Enable CORS only for trusted domains
- Hash all passwords (done automatically)
- Validate all inputs on backend
- Use HTTPS in production

## Support

For issues or questions:

1. Check implementation_status.md for recent changes
2. Review backend logs: `npm run dev`
3. Check browser console for frontend errors
4. Verify database connection and data

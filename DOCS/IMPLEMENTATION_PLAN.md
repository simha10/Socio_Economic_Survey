# Socio-Economic Survey System - Implementation Plan

## Overview

Complete implementation of role-based survey application with proper authentication, dashboard routing, and survey workflows.

## System Architecture

### 1. Authentication & Role-Based Routing

#### User Roles

- **ADMIN**: System administrator with full access
- **SUPERVISOR**: Manages supervisors/surveyors and slums
- **SURVEYOR**: Conducts surveys

#### Login Flow

```
1. User logs in with credentials
2. Backend validates and returns JWT + user role
3. Frontend sets token in localStorage
4. Frontend redirects based on role:
   - ADMIN → /admin/dashboard
   - SUPERVISOR → /supervisor/dashboard
   - SURVEYOR → /surveyor/dashboard
```

### 2. Dashboard Structure

#### All Dashboards Include:

- Collapsible sidebar (left side)
- Main content area
- Role-specific navigation items

#### Surveyor Dashboard Only:

- Bottom navigation bar (mobile app feel)

### 3. Admin Dashboard Features

- **Users Management**: Create admin, supervisors, surveyors
- **Slums Overview**: View all slums across system
- **Assignments**: View slum-to-surveyor assignments
- **Progress Tracking**: Monitor survey progress
- **System Health**: General metrics

### 4. Supervisor Dashboard Features

- **Supervisor Management**: Create/manage other supervisors
- **Slum Management**: Create slums with details (name, ID, state, district, city)
- **Assignment Management**: Assign slums to surveyors
- **Progress Tracking**: Monitor team progress
- **Surveyor Management**: View assigned surveyors

### 5. Surveyor Dashboard Features

- **Quick Start**: Two main options:
  1. **Slum Survey**: For assigned slums (ONE-TIME, comprehensive slum-level data)
  2. **Household Survey**: For households in assigned slums (MULTIPLE, one per household)
- **Progress**: Track completion status
- **Bottom Navigation**: Quick access to surveys

### 6. Survey Workflow

#### Slum Survey

- **Trigger**: Surveyor selects "Start Slum Survey" for assigned slum
- **Form**: One comprehensive slum-level survey (see: Slum survey form.md)
- **Rules**: Must be completed once per slum
- **Output**: Single record in `SlumSurvey` collection with slum ID and all slum-level data

#### Household Survey

- **Trigger**: Surveyor selects "Household Survey" for assigned slum
- **Form**: Household survey form (see: Household Survey From.md)
- **Rules**: Multiple surveys - one for each household in the slum
- **Output**: Multiple records in `HouseholdSurvey` collection, each linked to:
  - Slum ID
  - Household ID/Number
  - Survey data

#### Survey Priority & Rules

1. Can start either slum or household survey
2. If started slum survey, must complete it for that slum
3. Household surveys are independent for each household
4. Data validates against form requirements before submission

### 7. Data Model Structure

#### Survey Records

```
SlumSurvey {
  _id: ObjectId,
  slumId: String,
  slumName: String,
  assignmentId: ObjectId,
  surveyorId: ObjectId,
  questions: {
    // All slum-level questions from form
  },
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  submittedAt: DateTime,
  createdAt: DateTime
}

HouseholdSurvey {
  _id: ObjectId,
  slumId: String,
  householdId: String,
  assignmentId: ObjectId,
  surveyorId: ObjectId,
  questions: {
    // All household-level questions from form
  },
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  submittedAt: DateTime,
  createdAt: DateTime
}

Assignment {
  _id: ObjectId,
  slumId: ObjectId,
  surveyorId: ObjectId,
  supervisorId: ObjectId,
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED",
  slumSurveyStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
  householdSurveyProgress: { completed: Number, total: Number },
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### 8. Expected Result Flow

#### Step 1: Admin Creates Users

- Admin creates Supervisor account
- Admin creates Surveyor account

#### Step 2: Admin Views Progress

- Dashboard shows overall statistics (once implemented)
- Can view all slums and assignments

#### Step 3: Supervisor Creates Slums

- Creates slum with: name, ID, state, district, city, household count
- Stores in `Slum` collection

#### Step 4: Supervisor Assigns Slums

- Selects surveyor from dropdown
- Assigns slum to surveyor
- Creates/updates `Assignment` record
- Shows progress on supervisor dashboard

#### Step 5: Supervisor Tracks Progress

- Views dashboard progress
- See which surveyors have completed slum surveys
- See household survey progress

#### Step 6: Surveyor Views Assignments

- Logs in and sees dashboard
- Views all assigned slums with household counts

#### Step 7: Surveyor Does Surveys

- Option A: Clicks "Start Slum Survey"
  - Fills out slum survey form
  - Submits to backend
  - One record saved to `SlumSurvey` collection
- Option B: Clicks "Household Survey"
  - Enters number of households or shows list
  - For each household:
    - Fills household survey form
    - Submits to backend
    - One record saved to `HouseholdSurvey` collection

#### Step 8: Data Persistence

- SlumSurvey: 1 record per slum with slum-level data
- HouseholdSurvey: N records per slum (one per household)
- Assignment: Updated with progress

## Implementation Phases

### Phase 1: UI/Layout Components

- [ ] Enhanced Sidebar (collapsible, role-aware)
- [ ] BottomNav (surveyor only)
- [ ] Dashboard templates

### Phase 2: Dashboard Pages

- [ ] Admin Dashboard
- [ ] Supervisor Dashboard
- [ ] Surveyor Dashboard

### Phase 3: Feature Pages

- [ ] User Management (Admin)
- [ ] Slum Management (Admin/Supervisor)
- [ ] Assignment Management (Admin/Supervisor)
- [ ] Survey Forms (Surveyor)

### Phase 4: Backend APIs

- [ ] User creation endpoints
- [ ] Slum management endpoints
- [ ] Assignment endpoints
- [ ] Survey submission endpoints
- [ ] Progress tracking endpoints

### Phase 5: Database Models

- [ ] Enhanced Assignment schema
- [ ] SlumSurvey schema
- [ ] HouseholdSurvey schema validation

### Phase 6: Testing & Validation

- [ ] Test login for all roles
- [ ] Test dashboard navigation
- [ ] Test survey submission workflow
- [ ] Verify database records

## Key Files to Create/Modify

### Frontend

```
app/
├── admin/
│   ├── dashboard/page.tsx
│   ├── users/page.tsx
│   └── slums/page.tsx
├── supervisor/
│   ├── dashboard/page.tsx
│   ├── slums/page.tsx
│   └── assignments/page.tsx
├── surveyor/
│   ├── dashboard/page.tsx
│   ├── slum-survey/[id]/page.tsx
│   └── household-survey/[id]/page.tsx
components/
├── Sidebar.tsx (enhanced)
├── BottomNav.tsx (new)
└── DashboardLayout.tsx (new)
```

### Backend

```
src/
├── controllers/
│   ├── userController.js (new/enhanced)
│   ├── slumController.js (new/enhanced)
│   └── assignmentController.js (enhanced)
├── models/
│   └── (all schemas enhanced)
└── routes/
    ├── userRoutes.js (new)
    └── slumRoutes.js (new/enhanced)
```

## Testing Credentials (After Implementation)

```
Admin:
  Username: admin
  Password: admin123
  Expected: → /admin/dashboard

Supervisor:
  Username: supervisor
  Password: supervisor123
  Expected: → /supervisor/dashboard

Surveyor:
  Username: surveyor
  Password: surveyor123
  Expected: → /surveyor/dashboard
```

## Success Criteria

- [x] Users log in and redirect to correct dashboard
- [ ] All dashboards have collapsible sidebar
- [ ] Only surveyor dashboard has bottom nav
- [ ] Admin can manage users and view system status
- [ ] Supervisor can create slums and assign to surveyors
- [ ] Surveyor can see assigned slums with household counts
- [ ] Surveyor can complete slum and household surveys
- [ ] Data properly stored in respective collections
- [ ] Progress tracking shows accurate stats

# Survey Workflow Implementation - Complete Guide

## Overview
Implemented complete survey workflow for surveyors after slum assignment. The system now supports:
1. **Slum Survey** - Detailed slum-level data collection based on slum_survey_form.md
2. **Household Survey** - Individual household data collection based on HouseHold_Survey_Form.md
3. **Household Management** - Create, manage, and track households within assigned slums

## Architecture

### Workflow Path
```
1. Supervisor creates Slum (DRAFT status)
   ↓
2. Supervisor assigns Slum to Surveyor
   ↓
3. Surveyor views assigned slums in Dashboard
   ↓
4. Surveyor can:
   a. Start Slum Survey (/surveyor/slum-survey/[slumId])
   b. View/Manage Households (/surveyor/slums/[slumId]/households)
   ↓
5. For each household:
   - Create household record
   - Fill household survey form
   - Submit survey
   ↓
6. Mark slum survey as complete when all households done
```

## Technical Implementation

### Backend Models

#### Updated: Household Model (`backend/src/models/Household.js`)
New comprehensive schema with fields for:
- **Basic Info**: doorNo, headName, headFatherName, totalMembers
- **Survey Data**: Nested object containing all form fields:
  - Demographics (caste, religion, members by gender)
  - Education (literacy, school dropouts)
  - Housing (type, roof, flooring, lighting, fuel)
  - Water & Sanitation (source, distance, toilet, bathroom)
  - Economic Status (income, expenditure, debt)
  - Welfare & Assets (durables, livestock, pension, insurance)
  - Migration Details (years of stay, type, reason)
- **Status Tracking**: surveyStatus (DRAFT/IN PROGRESS/SUBMITTED/COMPLETED)
- **Audit Fields**: submittedBy, submittedAt, lastModifiedBy, lastModifiedAt

### Backend Controllers

#### New: Household Controller (`backend/src/controllers/survey/householdController.js`)
Implements CRUD operations:
- `createHousehold()` - Create new household for a slum
- `getHouseholdsBySlum()` - Fetch all households for a slum (paginated)
- `getHousehold()` - Get single household details
- `updateHousehold()` - Update household data including survey fields
- `deleteHousehold()` - Delete household
- `getHouseholdCount()` - Get count statistics

#### Existing: Household Survey Controller
Already has comprehensive survey submission logic in `householdSurveyController.js`

### Backend Routes

#### Updated: Survey Routes (`backend/src/routes/survey/surveyRoutes.js`)
Added new routes for household CRUD:
```javascript
POST   /surveys/households           - Create household
GET    /surveys/households           - List households for slum
GET    /surveys/households/:id       - Get single household
PUT    /surveys/households/:id       - Update household
DELETE /surveys/households/:id       - Delete household
GET    /surveys/households/:slumId/count - Get count stats
```

### Frontend Pages

#### New: Households List Page (`frontend/app/surveyor/slums/[slumId]/households/page.tsx`)
Features:
- Display all households for assigned slum
- Show progress (households surveyed vs total)
- Create new household form with fields:
  - Door No (required)
  - Head Name (required)
  - Father's Name (optional)
  - Total Members
- Household table with status badges
- Links to start/view household survey
- Color-coded status indicators (DRAFT/IN PROGRESS/SUBMITTED/COMPLETED)
- Mark survey as complete button

#### Existing: Slum Survey Page
Located at `/surveyor/slum-survey/[slumId]` - Already implemented with comprehensive form

#### New: Slum Survey Redirect Page (`frontend/app/surveyor/slum-survey/new/[slumId]/page.tsx`)
Handles route from dashboard `/surveyor/slum-survey/new/{slumId}` by redirecting to actual survey page

#### Existing: Household Survey Page
Located at `/surveyor/household-survey/[id]` - Already implemented for individual household forms

## Data Flow

### Creating a Household Survey
```
Surveyor Dashboard
   ↓
Click "Start Slum Survey" → /surveyor/slum-survey/new/{slumId}
   ↓
Fill Slum Survey Form
   ↓
Navigate to "View Households" → /surveyor/slums/{slumId}/households
   ↓
Click "+ Add Household" → Create household record
   ↓
Click "Start Survey" on household → /surveyor/household-survey/{householdId}
   ↓
Fill Household Survey Form (from HouseHold_Survey_Form.md)
   ↓
Submit Survey → Status changes to SUBMITTED/COMPLETED
```

### Data Storage

**Slum Survey Data:**
- Stored in SlumSurvey collection
- Reference to Slum document
- Comprehensive slum-level information

**Household Survey Data:**
- Household basic info stored in Household collection
- Survey data in nested `surveyData` object
- Tracks status, submission, and modification

## API Endpoints

### Household Management
```
POST /surveys/households
Content-Type: application/json
{
  "slum": "slumId",
  "doorNo": "A-101",
  "headName": "John Doe",
  "headFatherName": "Jane Doe",
  "totalMembers": 5
}
Response: { success: true, data: {...household...} }

GET /surveys/households?slum=slumId&status=DRAFT&page=1&limit=20
Response: { success: true, data: { households: [...], pagination: {...} } }

PUT /surveys/households/:id
Content-Type: application/json
{
  "surveyData": {...},
  "surveyStatus": "SUBMITTED"
}
Response: { success: true, data: {...updated household...} }

DELETE /surveys/households/:id
Response: { success: true, data: null }

GET /surveys/households/:slumId/count
Response: { success: true, data: { total: 110, submitted: 50, pending: 60 } }
```

## Frontend API Methods

### Added to `frontend/services/api.ts`
(Uses generic `post()` and `get()` methods)

```typescript
// Create household
await apiService.post('/surveys/households', {
  slum: slumId,
  doorNo: 'A-101',
  headName: 'Name',
  totalMembers: 5
})

// Get households for slum
await apiService.get(`/surveys/households?slum=${slumId}`)

// Get single household
await apiService.get(`/surveys/households/${householdId}`)

// Update household with survey data
await apiService.post(`/surveys/households/${householdId}`, {
  surveyData: {...},
  surveyStatus: 'SUBMITTED'
})

// Delete household
await apiService.delete(`/surveys/households/${householdId}`)
```

## Form Fields Implementation

### Slum Survey Form (Already Implemented)
Located in `/surveyor/slum-survey/[slumId]`
Collects: Demographics, literacy, housing status, economic details, infrastructure, education, health, welfare

### Household Survey Form (Existing)
Located in `/surveyor/household-survey/[id]`
Collects: Individual household details, members, assets, durables, livestock, migration, income/expenditure

### Household Creation Form (New)
Located in `/surveyor/slums/[slumId]/households`
Quick form to create household records before survey

## Status Progression

### Household Survey Status
```
DRAFT 
  ↓ (User starts editing)
IN PROGRESS
  ↓ (User submits form)
SUBMITTED
  ↓ (Supervisor approves - future feature)
COMPLETED
```

### Slum Survey Status
```
ASSIGNED
  ↓ (Surveyor starts survey)
IN PROGRESS
  ↓ (All households completed)
COMPLETED
```

## Future Enhancements

1. **Household Survey Form UI**
   - Implement comprehensive household survey form page
   - Add field validation and auto-save
   - Progress bar for form completion

2. **Slum Survey Form UI**
   - Enhance existing form with better UX
   - Add data validation
   - Support for bulk data entry

3. **Review & Approval**
   - Supervisor review page for submitted surveys
   - Approval workflow
   - Feedback mechanism

4. **Analytics & Reports**
   - Survey completion dashboard
   - Data quality reports
   - Export to CSV/PDF

5. **Offline Support**
   - Save form data locally
   - Sync when connected

6. **Media Support**
   - Photo/video upload for slums
   - Photo verification for households

7. **Mobile App**
   - Native mobile application
   - Offline data collection

## Testing Checklist

- [ ] Supervisor creates slum
- [ ] Supervisor assigns slum to surveyor
- [ ] Surveyor sees assignment in dashboard
- [ ] Surveyor clicks "View Households"
- [ ] Household list page loads correctly
- [ ] Surveyor can create new household
- [ ] Household appears in list with DRAFT status
- [ ] Surveyor can start household survey
- [ ] Household survey form loads
- [ ] Surveyor can fill and submit form
- [ ] Status changes to SUBMITTED/COMPLETED
- [ ] Progress percentage updates
- [ ] Surveyor can click "Start Slum Survey"
- [ ] Slum survey form loads
- [ ] Surveyor can fill slum survey
- [ ] Mark survey as complete button works
- [ ] Slum status changes to COMPLETED

## Database Seeding

For testing, seed with:
1. States and Districts (already seeded)
2. Users (already seeded)
3. Sample Slum (manually create or use fixture)
4. Sample Households (created via UI)

## Environment Variables

No new environment variables required. Uses existing:
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Authentication
- `PORT` - Server port

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on slum survey | Route mismatch | Verify `/surveyor/slum-survey/[slumId]` exists |
| 404 on households | Missing page | Already created at `/surveyor/slums/[slumId]/households` |
| Households not loading | API endpoint missing | Check `/surveys/households` routes added |
| Form not submitting | Validation error | Check console for error messages |
| Status not updating | Missing API call | Verify update call includes surveyStatus |

## Performance Considerations

- Paginated household list (20 per page)
- Indexed queries on slum ID and status
- Lazy load household survey forms
- Debounce auto-save (future feature)

## Security

- Role-based access control (SURVEYOR, SUPERVISOR, ADMIN)
- User ID tracking for audit trail
- Timestamps for all modifications
- Survey status prevents unauthorized edits

## Documentation Files

- `SLUM_FILTER_FEATURE.md` - Status filter implementation
- `ASSIGNMENT_FIX_SUMMARY.md` - Assignment workflow fixes
- `RUNNING.md` - Setup instructions
- `IMPLEMENTATION_SUMMARY.md` - System overview

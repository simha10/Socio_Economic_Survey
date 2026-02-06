# API Endpoints Reference

## Authentication

- **POST** `/api/auth/login` - Login with username/password
- **POST** `/api/auth/register` - Register new user (if enabled)
- **GET** `/api/auth/me` - Get current user info

## Admin Routes - User Management

### Create User (Admin only)

```
POST /api/admin/users
Headers: Authorization: Bearer {token}
Body: {
  username: string,
  name: string,
  password: string,
  role: "ADMIN" | "SUPERVISOR" | "SURVEYOR"
}
Response: { success: true, data: { user: {...} } }
```

### List Users (Admin only)

```
GET /api/admin/users?role=SURVEYOR
Headers: Authorization: Bearer {token}
Query params:
  - role: optional, filter by role
Response: { success: true, data: [...] }
```

### Get User (Admin only)

```
GET /api/admin/users/:userId
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

### Update User (Admin only)

```
PUT /api/admin/users/:userId
Headers: Authorization: Bearer {token}
Body: {
  name?: string,
  role?: string,
  isActive?: boolean
}
Response: { success: true, data: {...} }
```

### Delete User (Admin only)

```
DELETE /api/admin/users/:userId
Headers: Authorization: Bearer {token}
Response: { success: true }
```

## Admin Routes - Slum Management

### Create Slum (Admin & Supervisor)

```
POST /api/admin/slums
Headers: Authorization: Bearer {token}
Body: {
  name: string,
  location: string,
  state: ObjectId,
  district: ObjectId,
  city: string,
  ward: string,
  slumType: "NOTIFIED" | "NON_NOTIFIED",
  landOwnership: string,
  totalHouseholds: number
}
Response: { success: true, data: {...} }
```

### List Slums (All roles)

```
GET /api/admin/slums?state=...&district=...&city=...
Headers: Authorization: Bearer {token}
Query params:
  - state: optional, filter by state ID
  - district: optional, filter by district ID
  - city: optional, filter by city name
Response: { success: true, data: [...] }
```

### Get Slum (All roles)

```
GET /api/admin/slums/:slumId
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

### Update Slum (Admin & Supervisor)

```
PUT /api/admin/slums/:slumId
Headers: Authorization: Bearer {token}
Body: {
  name?: string,
  location?: string,
  city?: string,
  ward?: string,
  slumType?: string,
  landOwnership?: string,
  totalHouseholds?: number
}
Response: { success: true, data: {...} }
```

### Delete Slum (Admin only)

```
DELETE /api/admin/slums/:slumId
Headers: Authorization: Bearer {token}
Response: { success: true }
```

## Admin Routes - Location Data

### Get States (All roles)

```
GET /api/admin/states
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...] }
```

### Get State (All roles)

```
GET /api/admin/states/:id
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

### Get Districts (All roles)

```
GET /api/admin/districts
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...] }
```

### Get District (All roles)

```
GET /api/admin/districts/:id
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

### Get Districts by State (All roles)

```
GET /api/admin/districts/state/:stateId
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...] }
```

## Survey Routes - Assignments

### Create Assignment (Supervisor)

```
POST /api/surveys/assignments
Headers: Authorization: Bearer {token}
Body: {
  surveyorId: ObjectId,
  slumId: ObjectId,
  assignmentType: "FULL_SLUM" | "HOUSEHOLD_ONLY"
}
Response: { success: true, data: {...} }
```

### List All Assignments (Admin & Supervisor)

```
GET /api/surveys/assignments?page=1&limit=10&status=...&surveyor=...&slum=...
Headers: Authorization: Bearer {token}
Query params:
  - page: optional, default 1
  - limit: optional, default 10
  - status: optional, filter by status
  - surveyor: optional, filter by surveyor ID
  - slum: optional, filter by slum ID
Response: {
  success: true,
  data: [...],
  total: number,
  totalPages: number,
  currentPage: number
}
```

### Get Assignment (All roles)

```
GET /api/surveys/assignments/:id
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

### Get My Assignments (Surveyor)

```
GET /api/surveys/assignments/my
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...] }
```

### Get My Assignments Formatted (Surveyor - For Dashboard)

```
GET /api/surveys/assignments/my/formatted
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  data: [{
    _id: ObjectId,
    slumId: ObjectId,
    slumName: string,
    householdCount: number,
    surveyStatus: "PENDING" | "IN PROGRESS" | "COMPLETED",
    householdProgress: {
      completed: number,
      total: number
    }
  }]
}
```

### Get Assignments for Specific Surveyor (Admin & Supervisor)

```
GET /api/surveys/assignments/surveyor/:userId
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...] }
```

### Update Assignment Status (Supervisor & Surveyor)

```
PUT /api/surveys/assignments/:id/status
Headers: Authorization: Bearer {token}
Body: {
  status: "PENDING" | "IN PROGRESS" | "COMPLETED",
  progress?: number (0-100)
}
Response: { success: true, data: {...} }
```

### Update Slum Survey Status (Surveyor)

```
PUT /api/surveys/assignments/:assignmentId/slum-survey
Headers: Authorization: Bearer {token}
Body: {
  status: "NOT_STARTED" | "IN PROGRESS" | "COMPLETED"
}
Response: { success: true, data: {...} }
```

### Update Household Survey Progress (Surveyor)

```
PUT /api/surveys/assignments/:assignmentId/household-progress
Headers: Authorization: Bearer {token}
Body: {
  completed: number,
  total: number
}
Response: { success: true, data: {...} }
```

## Survey Routes - Slum Survey

### Submit Slum Survey (Surveyor)

```
POST /api/surveys/slum-survey
Headers: Authorization: Bearer {token}
Body: {
  assignmentId: ObjectId,
  slumId: ObjectId,
  basicInformation: {...},
  landStatus: {...},
  populationAndHealth: {...},
  literacyEducation: {...},
  housingStatus: {...},
  economicStatus: {...},
  occupationStatus: {...},
  infrastructure: {...},
  educationFacilities: {...}
}
Response: { success: true, data: {...} }
```

### Get Slum Survey (All roles)

```
GET /api/surveys/slum-survey/:id
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

## Survey Routes - Household Survey

### Submit Household Survey (Surveyor)

```
POST /api/surveys/household-survey
Headers: Authorization: Bearer {token}
Body: {
  assignmentId: ObjectId,
  slumId: ObjectId,
  household: string,
  generalInformation: {...},
  headOfFamily: {...},
  familyComposition: {...},
  povertyStatus: {...},
  housing: {...},
  waterAndSanitation: {...},
  migration: {...},
  incomeExpenditure: {...}
}
Response: { success: true, data: {...} }
```

### Get Household Survey (All roles)

```
GET /api/surveys/household-survey/:id
Headers: Authorization: Bearer {token}
Response: { success: true, data: {...} }
```

### List Household Surveys by Slum (Admin & Supervisor)

```
GET /api/surveys/household-survey/slum/:slumId
Headers: Authorization: Bearer {token}
Response: { success: true, data: [...] }
```

## Error Responses

All endpoints may return:

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "Access denied. Requires one of the following roles: ADMIN."
}
```

### Bad Request (400)

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Error message",
  "error": "detailed error"
}
```

## Authentication Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Request Content-Type

All POST and PUT requests should include:

```
Content-Type: application/json
```

## Response Format

Success responses follow this format:

```json
{
  "success": true,
  "message": "operation description",
  "data": {...}
}
```

Error responses:

```json
{
  "success": false,
  "message": "error description",
  "error": "detailed error (if available)"
}
```

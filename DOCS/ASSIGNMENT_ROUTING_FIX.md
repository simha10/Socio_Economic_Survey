# Assignment Routing Fix

## Problem

When assigning a slum to a surveyor, the frontend console showed a **500 (Internal Server Error)** for the request:

```
GET http://localhost:5000/api/surveys/assignments/my-assigned-slums
```

The backend error was:

```
Cast to ObjectId failed for value "my-assigned-slums" (type string) at path "_id" for model "Assignment"
```

This error indicated that the backend was trying to treat the string "my-assigned-slums" as a MongoDB ObjectId.

## Root Cause

The issue was in the route definition order in [backend/src/routes/survey/surveyRoutes.js](../backend/src/routes/survey/surveyRoutes.js).

Express.js matches routes in the order they are defined. The problematic order was:

```javascript
// Get specific assignment by ID - defined FIRST
router.get("/assignments/:id", auth, getAssignmentById);

// Get my assigned slums (surveyor) - defined AFTER :id route
router.get("/assignments/my-assigned-slums", auth, getMyAssignments);
```

When a GET request came in for `/assignments/my-assigned-slums`:

1. Express matched it to the first route `/assignments/:id`
2. The `:id` parameter was set to the string `"my-assigned-slums"`
3. The `getAssignmentById` controller tried to query MongoDB using this invalid ID
4. Mongoose threw a CastError because "my-assigned-slums" is not a valid 24-character hex string

## Solution

Reordered the routes so that **more specific static routes are defined before generic parametrized routes**:

```javascript
// ===== ASSIGNMENT ROUTES =====
router.post(
  "/assignments/assign-slum",
  auth,
  authorize("SUPERVISOR", "ADMIN"),
  assignSlumToSurveyor,
);
router.get(
  "/assignments",
  auth,
  authorize("SUPERVISOR", "ADMIN"),
  getAllAssignments,
);

// Static routes MUST come before :id route to avoid matching as ID
router.get("/assignments/my-assigned-slums", auth, getMyAssignments);
router.get(
  "/assignments/surveyor/:userId",
  auth,
  authorize("SUPERVISOR", "ADMIN"),
  getAssignmentsForSurveyor,
);

// Generic parametrized route MUST be last
router.get("/assignments/:id", auth, getAssignmentById);

router.put(
  "/assignments/:id",
  auth,
  authorize("SUPERVISOR", "ADMIN"),
  updateAssignmentStatus,
);
```

## Impact

- ✅ Frontend can now successfully fetch assigned slums for surveyors
- ✅ Assignment creation and retrieval endpoints work correctly
- ✅ No more CastError when accessing assignment endpoints with non-ID parameters

## Testing

Test the following endpoints after applying this fix:

1. **GET** `/api/surveys/assignments/my-assigned-slums` - Should return assignments for current surveyor
2. **GET** `/api/surveys/assignments/surveyor/{userId}` - Should return assignments for specific surveyor
3. **GET** `/api/surveys/assignments/{id}` - Should return specific assignment by ID
4. **POST** `/api/surveys/assignments/assign-slum` - Should create new assignment

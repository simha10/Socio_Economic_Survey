# Total Households Field Fix

## Issue

The `totalHouseholds` field was not being saved in the database when creating or updating a slum. Although:

1. ✓ The frontend form had the input field and was sending the data
2. ✓ The Slum model in the database supported the field
3. ✓ The frontend display component was ready to show the data

The backend controllers were not extracting and saving the `totalHouseholds` value from the request body.

## Root Cause

The backend slum controller's `createSlum()` and `updateSlum()` functions were not destructuring `totalHouseholds` from the request body and not including it in the slum creation/update payload.

## Solution Implemented

### File: [backend/src/controllers/survey/slumController.js](../backend/src/controllers/survey/slumController.js)

#### 1. Fixed `createSlum()` function (Line 7)

**Before:**

```javascript
const {
  name,
  location,
  state: stateId,
  district: districtId,
  city,
  ward,
  slumType,
  landOwnership,
} = req.body;
```

**After:**

```javascript
const {
  name,
  location,
  state: stateId,
  district: districtId,
  city,
  ward,
  slumType,
  landOwnership,
  totalHouseholds,
} = req.body;
```

**And in slum creation (Line 39):**

```javascript
totalHouseholds: totalHouseholds || 0,
```

#### 2. Fixed `updateSlum()` function (Line 149)

**Before:**

```javascript
const {
  name,
  location,
  state: stateId,
  district: districtId,
  city,
  ward,
  slumType,
  landOwnership,
} = req.body;
```

**After:**

```javascript
const {
  name,
  location,
  state: stateId,
  district: districtId,
  city,
  ward,
  slumType,
  landOwnership,
  totalHouseholds,
} = req.body;
```

**And in updated fields (Line 204):**

```javascript
const updatedFields = {
  name,
  location,
  city,
  ward,
  slumType,
  landOwnership,
  totalHouseholds, // Added this line
};
```

## Data Flow

```
Frontend Form
  ↓
User enters "Total Households" value
  ↓
SlumForm.tsx sends formData with totalHouseholds
  ↓
apiService.createSlum(formData)
  ↓
POST /api/surveys/slums
  ↓
Backend createSlum controller
  ↓
Extracts totalHouseholds from req.body ✓ (FIXED)
  ↓
Saves to Slum model with totalHouseholds ✓ (FIXED)
  ↓
Returns populated slum with totalHouseholds
  ↓
Frontend displays in "Households" column
```

## Frontend Components Already Supporting It

1. **SlumForm.tsx** - Input field for "Total Households"
2. **supervisor/slums/page.tsx** - "Households" column showing `slum.totalHouseholds`
3. **supervisor/slums/[id]/page.tsx** - Detail view showing "Total Households"

## Testing Steps

1. **Navigate to:** Supervisor → Slums → Create New Slum
2. **Fill form:**
   - Name: Any name
   - Location: Any location
   - State: Any state
   - District: Any district
   - **Total Households: 150** (or any number)
3. **Click:** Create Slum
4. **Verify:**
   - Slum appears in the list
   - "Households" column shows **150**
5. **Edit slum:**
   - Click edit icon
   - Change "Total Households" to different number
   - Save
   - Verify updated value appears in table

## Affected Endpoints

- ✅ **POST** `/api/surveys/slums` - Create slum (now saves totalHouseholds)
- ✅ **PUT** `/api/surveys/slums/:id` - Update slum (now saves totalHouseholds)
- ✅ **GET** `/api/surveys/slums` - Returns totalHouseholds (already working)
- ✅ **GET** `/api/surveys/slums/:id` - Returns totalHouseholds (already working)

## Backend Validation

Default value: If `totalHouseholds` is not provided, it defaults to 0 (as per model)

```javascript
totalHouseholds: totalHouseholds || 0,
```

## Summary

The issue was a simple case of **missing request parameter extraction** in the backend. The frontend was correctly sending the data, but the backend wasn't capturing it. Now both create and update operations properly handle the `totalHouseholds` field, and it will display correctly in all UI components.

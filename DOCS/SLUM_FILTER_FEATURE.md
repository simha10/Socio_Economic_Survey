# Slum Status Filter Feature

## Overview
Added a dropdown filter to the Supervisor Slums Management page to filter slums by their survey status (DRAFT, ASSIGNED, IN_PROGRESS, COMPLETED).

## Features Implemented

### 1. **Status Filter Dropdown**
- Located above the slums table for easy access
- Shows count of slums in each status
- Options:
  - **All Statuses** (shows total count)
  - **Draft** (unassigned slums)
  - **Assigned** (assigned but not started)
  - **In Progress** (currently being surveyed)
  - **Completed** (survey finished)

### 2. **Count Display**
The dropdown displays the count of slums in each status:
```
All Statuses (5)
Draft (2)
Assigned (2)
In Progress (1)
Completed (0)
```

### 3. **Visual Status Badges**
Enhanced status badges with color coding:
- **Draft**: Gray badge
- **Assigned**: Blue badge
- **In Progress**: Purple badge
- **Completed**: Green badge
- **Submitted**: Green badge

### 4. **Clear Filter Button**
When a filter is active, a "Clear Filter" button appears to easily reset to showing all slums.

### 5. **Real-time Filtering**
- Slums are filtered instantly as you select a status
- The count updates dynamically as slums are created/assigned

## Technical Implementation

### Frontend Changes
**File:** `frontend/app/supervisor/slums/page.tsx`

#### New State Variables
```typescript
const [statusFilter, setStatusFilter] = useState<string>('');
const [allSlums, setAllSlums] = useState<SlumSurveyData[]>([]);
```

#### New Functions
```typescript
// Get counts of slums by status
const getStatusCounts = () => {
  return {
    total: allSlums.length,
    draft: allSlums.filter(s => s.surveyStatus === 'DRAFT').length,
    assigned: allSlums.filter(s => s.surveyStatus === 'ASSIGNED').length,
    inProgress: allSlums.filter(s => s.surveyStatus === 'IN_PROGRESS').length,
    completed: allSlums.filter(s => s.surveyStatus === 'COMPLETED').length,
  };
};

// Get badge color based on status
const getStatusBadgeColor = (status: string) => {
  switch(status) {
    case 'DRAFT': return 'bg-gray-900/50 text-gray-300';
    case 'ASSIGNED': return 'bg-blue-900/50 text-blue-300';
    case 'IN_PROGRESS': return 'bg-purple-900/50 text-purple-300';
    case 'COMPLETED': return 'bg-green-900/50 text-green-300';
    default: return 'bg-gray-900/50 text-gray-300';
  }
};
```

#### Updated Hook
```typescript
// Filter slums when status filter changes
useEffect(() => {
  if (statusFilter) {
    const filtered = allSlums.filter(slum => slum.surveyStatus === statusFilter);
    setSlumSurveys(filtered);
  } else {
    setSlumSurveys(allSlums);
  }
}, [statusFilter, allSlums]);
```

#### Updated fetchSlumSurveys
```typescript
const fetchSlumSurveys = async () => {
  try {
    setLoading(true);
    const response = await apiService.getAllSlums();
    if (response.success && response.data) {
      const slumsArray = Array.isArray(response.data) ? response.data : response.data.slums || [];
      setAllSlums(slumsArray);
      // Apply status filter if one is selected
      if (statusFilter) {
        const filtered = slumsArray.filter(slum => slum.surveyStatus === statusFilter);
        setSlumSurveys(filtered);
      } else {
        setSlumSurveys(slumsArray);
      }
    }
  } catch (error) {
    console.error('Error fetching slum surveys:', error);
  } finally {
    setLoading(false);
  }
};
```

## Usage

### For Supervisors
1. Navigate to "Supervisor" > "Slum Management" page
2. At the top of the Existing Slums section, you'll see "Filter by Status" dropdown
3. Click the dropdown to see available statuses with their counts:
   - All Statuses (shows all slums)
   - Draft (slums ready to be assigned)
   - Assigned (slums assigned to surveyors)
   - In Progress (surveyors actively surveying)
   - Completed (surveys finished)
4. Click a status to filter the table
5. Click "Clear Filter" button to show all slums again

### Example Workflow
```
1. Create 3 slums (all DRAFT status)
2. Assign 2 slums to surveyors (change to ASSIGNED status)
3. Click "Assigned" filter to see only those 2 slums
4. Click "Draft" filter to see only 1 remaining unassigned slum
5. Click "Clear Filter" to see all 3 again
```

## Status Progression

A slum's status typically follows this progression:
```
DRAFT → ASSIGNED → IN_PROGRESS → COMPLETED
```

- **DRAFT**: Initial state, supervisor enters basic details
- **ASSIGNED**: Supervisor assigns to a surveyor via Manage Assignments page
- **IN_PROGRESS**: Surveyor starts filling the survey form
- **COMPLETED**: All surveys for the slum are done and marked as complete

## Related Features

- **Slum Creation**: Create new slums in DRAFT status
- **Slum Assignment**: Assign DRAFT slums to surveyors (changes status to ASSIGNED)
- **Survey Progress**: Track which slums are being surveyed (IN_PROGRESS)
- **Completion Tracking**: See which slums are done (COMPLETED)

## Database Schema
The `surveyStatus` field in the Slum model supports these values:
- `DRAFT` - String
- `ASSIGNED` - String
- `IN_PROGRESS` - String
- `COMPLETED` - String
- `SUBMITTED` - String

## Future Enhancements
Potential additions:
- Multi-select filter (show multiple statuses at once)
- Export filtered results to CSV
- Advanced filters (by state, district, date range)
- Status change history/timeline
- Bulk status updates

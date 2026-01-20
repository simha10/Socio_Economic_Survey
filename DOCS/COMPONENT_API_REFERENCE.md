# Frontend Component API Reference

## Layout Components

### SurveyorLayout

Mobile-first layout with bottom navigation for surveyor role.

```typescript
import SurveyorLayout from '@/components/SurveyorLayout';

export default function Page() {
  return (
    <SurveyorLayout>
      <h1>Page Content</h1>
    </SurveyorLayout>
  );
}
```

**Features:**

- Responsive mobile design
- Bottom navigation bar
- Proper spacing for mobile safeguard
- Dark theme

---

## Form Components

### Button

Action button with multiple variants and states.

```typescript
import Button from '@/components/Button';

<Button onClick={() => alert('Clicked!')}>
  Click Me
</Button>

<Button variant="secondary" fullWidth>
  Secondary Button
</Button>

<Button loading={isLoading}>
  Loading...
</Button>

<Button disabled>
  Disabled
</Button>
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'danger' (default: 'primary')
- `fullWidth`: boolean (default: false)
- `loading`: boolean (default: false)
- `disabled`: boolean (default: false)
- `onClick`: function
- `children`: React elements

---

### Input

Text input component with multiple types.

```typescript
import Input from '@/components/Input';

// Text input
<Input
  label="Name"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Number input
<Input
  label="Age"
  type="number"
  value={age}
  onChange={(e) => setAge(e.target.value)}
/>

// Multiline (Textarea)
<Input
  label="Notes"
  multiline
  rows={4}
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

**Props:**

- `label`: string
- `placeholder`: string
- `type`: 'text' | 'number' | 'email' | 'search' (default: 'text')
- `value`: string | number
- `onChange`: function
- `multiline`: boolean (default: false)
- `rows`: number (for multiline)
- `disabled`: boolean (default: false)

---

### Select

Dropdown select component.

```typescript
import Select from '@/components/Select';

<Select
  label="Occupation"
  value={occupation}
  onChange={(value) => setOccupation(value)}
  options={[
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'LABOR', label: 'Daily Labor' },
    { value: 'BUSINESS', label: 'Business' },
  ]}
/>
```

**Props:**

- `label`: string
- `value`: string
- `onChange`: function
- `options`: Array of `{ value: string; label: string }`
- `disabled`: boolean (default: false)

---

### Checkbox

Checkbox input component.

```typescript
import Checkbox from '@/components/Checkbox';

<Checkbox
  label="I agree to terms"
  checked={isChecked}
  onChange={(checked) => setIsChecked(checked)}
/>

<Checkbox
  label="Disabled checkbox"
  checked={true}
  disabled
/>
```

**Props:**

- `label`: string
- `checked`: boolean
- `onChange`: function
- `disabled`: boolean (default: false)

---

## Container Components

### Card

Reusable card container component.

```typescript
import Card from '@/components/Card';

<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

<Card className="mb-4" hover>
  <p>Hoverable card</p>
</Card>
```

**Props:**

- `children`: React elements
- `className`: string (additional classes)
- `hover`: boolean (default: false) - adds hover effect

---

### Accordion

Collapsible accordion section.

```typescript
import Accordion from '@/components/Accordion';

<Accordion title="Section Title" icon="📝">
  <p>Accordion content</p>
</Accordion>
```

**Props:**

- `title`: string
- `children`: React elements
- `icon`: string (emoji)
- `defaultOpen`: boolean (default: false)

---

## Feedback Components

### Toast

Notification system.

```typescript
import { useToast } from '@/components/Toast';

export default function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Operation successful!', 'success');
  };

  const handleError = () => {
    showToast('Something went wrong', 'error');
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  );
}
```

**showToast Parameters:**

- `message`: string - notification message
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')

---

## API Service

### Methods

#### Authentication

```typescript
// Login
const response = await apiService.login(email, password);
if (response.success) {
  // Handle successful login
  apiService.setToken(response.token);
}

// Get current user
const meResponse = await apiService.getMe();

// Logout
apiService.logout();
```

#### Survey Data

```typescript
// Get all slums
const slums = await apiService.getSlums();

// Get specific slum
const slum = await apiService.getSlum(slumId);

// Get household
const household = await apiService.getHousehold(householdId);

// Create/Get slum survey
const survey = await apiService.createOrGetSlumSurvey(slumId);

// Submit surveys
await apiService.submitSlumSurvey(slumId, formData);
await apiService.submitHouseholdSurvey(householdId, formData);

// Get assignments
const assignments = await apiService.getMyAssignments();
```

#### State & District

```typescript
// Get states
const states = await apiService.getStates();

// Get districts by state
const districts = await apiService.getDistrictsByState(stateId);
```

---

## Hooks

### useToast

Display toast notifications.

```typescript
const { showToast } = useToast();

showToast("Success!", "success");
showToast("Error!", "error");
```

---

## Usage Examples

### Complete Form Page

```typescript
'use client';

import React, { useState } from 'react';
import SurveyorLayout from '@/components/SurveyorLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import apiService from '@/services/api';
import { useToast } from '@/components/Toast';

export default function SampleFormPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/surveys/submit', formData);

      if (response.success) {
        showToast('Form submitted successfully!', 'success');
      } else {
        showToast(response.message || 'Failed to submit', 'error');
      }
    } catch (error) {
      showToast('Error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SurveyorLayout>
      <Card>
        <h1 className="text-2xl font-bold mb-4">Sample Form</h1>

        <Input
          label="Name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />

        <Input
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
        />

        <Select
          label="Occupation"
          value={formData.occupation}
          onChange={(value) => handleInputChange('occupation', value)}
          options={[
            { value: 'JOB', label: 'Job' },
            { value: 'BUSINESS', label: 'Business' },
            { value: 'STUDENT', label: 'Student' },
          ]}
        />

        <Button
          fullWidth
          loading={loading}
          onClick={handleSubmit}
          className="mt-4"
        >
          Submit Form
        </Button>
      </Card>
    </SurveyorLayout>
  );
}
```

---

## Color Palette

### Primary Colors

- Primary Blue: `#3B82F6`
- Dark Background: `#111827`
- Slate-900: `#0F172A`
- Slate-800: `#1E293B`

### Semantic Colors

- Success (Green): `#10B981`
- Error (Red): `#EF4444`
- Warning (Orange): `#F59E0B`
- Info (Blue): `#3B82F6`

### Text Colors

- Primary Text: `#E5E7EB`
- Muted Text: `#9CA3AF`
- Placeholder: `#6B7280`

---

## Best Practices

1. **Always use layouts:** Wrap pages with appropriate layout component
2. **Handle errors:** Show toast notifications for user feedback
3. **Loading states:** Display loading indicators during async operations
4. **Accessibility:** Use proper labels and semantic HTML
5. **Type safety:** Define interfaces for form data
6. **Error boundaries:** Handle API errors gracefully
7. **Mobile first:** Test on mobile devices
8. **Performance:** Lazy load components when possible

---

## Common Patterns

### Form with Multiple Sections

```typescript
const [expandedSections, setExpandedSections] = useState(new Set(['section1']));

const toggleSection = (id) => {
  const newSet = new Set(expandedSections);
  if (newSet.has(id)) newSet.delete(id);
  else newSet.add(id);
  setExpandedSections(newSet);
};

// Use in render
{expandedSections.has('section1') && <div>Content</div>}
```

### Data Loading Pattern

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const response = await apiService.get(endpoint);
      if (response.success) setData(response.data);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

if (loading) return <LoadingSpinner />;
if (!data) return <ErrorMessage />;
```

---

**Component Library Version:** 1.0
**Last Updated:** 2024

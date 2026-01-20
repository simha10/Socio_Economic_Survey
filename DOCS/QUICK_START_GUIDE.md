# Quick Start Guide - Frontend Development

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Project Structure Quick Reference

```
frontend/
├── app/surveyor/          # All surveyor pages
│   ├── dashboard/         # Main dashboard
│   ├── slums/            # Slums listing & details
│   ├── slum-survey/      # Slum survey form
│   └── household-survey/ # Household survey form
├── components/           # Reusable UI components
├── services/            # API communication
└── utils/              # Helper functions
```

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Linting & Formatting
npm run lint            # Check code style
npm run format          # Format code

# Testing
npm test                # Run tests (if configured)
```

---

## Creating a New Page

### Step 1: Create File

Create `app/surveyor/[role]/[page]/page.tsx`

### Step 2: Add Layout

```typescript
import SurveyorLayout from '@/components/SurveyorLayout';

export default function Page() {
  return (
    <SurveyorLayout>
      <div>Page content</div>
    </SurveyorLayout>
  );
}
```

### Step 3: Add Components

```typescript
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
```

---

## Adding a New Component

### Step 1: Create File

Create `components/MyComponent.tsx`

### Step 2: Build Component

```typescript
interface MyComponentProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function MyComponent({
  label,
  value,
  onChange,
}: MyComponentProps) {
  return (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
```

### Step 3: Import & Use

```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent
  label="My Label"
  value={myValue}
  onChange={setMyValue}
/>
```

---

## API Integration Quick Reference

### Get Data

```typescript
import apiService from "@/services/api";

const response = await apiService.getSlums();
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

### Submit Data

```typescript
const result = await apiService.post("/endpoint", {
  field1: value1,
  field2: value2,
});
```

### Use in Component

```typescript
'use client';
import { useEffect, useState } from 'react';
import apiService from '@/services/api';

export default function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await apiService.getSlums();
      if (response.success) setData(response.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

---

## Form Pattern

### Complete Form Example

```typescript
'use client';
import { useState } from 'react';
import { useToast } from '@/components/Toast';
import Input from '@/components/Input';
import Button from '@/components/Button';
import apiService from '@/services/api';

export default function MyForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiService.post('/form-endpoint', formData);

      if (response.success) {
        showToast('Submitted!', 'success');
      } else {
        showToast('Failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({
          ...formData,
          name: e.target.value
        })}
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({
          ...formData,
          email: e.target.value
        })}
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
}
```

---

## Styling Guide

### Using Tailwind Classes

```typescript
// Colors
className = "text-primary"; // Primary text color
className = "bg-slate-800"; // Background
className = "border-primary"; // Border

// Spacing
className = "mb-4"; // Margin bottom
className = "p-4"; // Padding
className = "gap-3"; // Gap between items

// Layout
className = "flex items-center"; // Flex row, centered vertically
className = "grid grid-cols-2"; // 2-column grid
className = "w-full"; // Full width

// Typography
className = "text-lg font-bold"; // Large, bold text
className = "text-sm text-muted"; // Small, muted text

// Responsive
className = "md:grid-cols-2"; // 2 columns on medium+ screens
className = "lg:p-8"; // Large padding on large+ screens
```

---

## Debugging Tips

### Console Logging

```typescript
console.log("Value:", value);
console.error("Error:", error);
console.warn("Warning:", warning);
```

### React DevTools

1. Install React DevTools browser extension
2. Inspect component props and state
3. Use Performance tab to find bottlenecks

### Network Tab

1. Open DevTools → Network tab
2. Check API requests
3. Verify response data

### Common Issues

**Issue:** Page not loading

- Check console for errors
- Verify layout wrapper exists
- Check file path in app directory

**Issue:** API calls failing

- Check API base URL in .env.local
- Verify backend is running
- Check network tab for request details

**Issue:** Styling not applying

- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Restart: `npm run dev`

---

## TypeScript Quick Tips

### Define Component Props

```typescript
interface MyProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean; // Optional property
}

export default function MyComponent(props: MyProps) {
  // component code
}
```

### State with Types

```typescript
const [count, setCount] = useState<number>(0);
const [items, setItems] = useState<Item[]>([]);
const [user, setUser] = useState<User | null>(null);
```

### Function Types

```typescript
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
  console.log(e.currentTarget);
};

const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
  console.log(e.target.value);
};
```

---

## Useful Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

---

## File Templates

### Page Template

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SurveyorLayout from '@/components/SurveyorLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import apiService from '@/services/api';
import { useToast } from '@/components/Toast';

export default function PageName() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load data here
      } catch (error) {
        showToast('Error loading data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <SurveyorLayout>
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SurveyorLayout>
    );
  }

  return (
    <SurveyorLayout>
      <Card>
        {/* Page content */}
      </Card>
    </SurveyorLayout>
  );
}
```

### Component Template

```typescript
interface Props {
  // Define props here
}

export default function ComponentName({ }: Props) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

---

## Deployment Quick Commands

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker Deployment

```bash
docker build -t survey-app .
docker run -p 3000:3000 survey-app
```

---

## Development Checklist

Before committing code:

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All components render
- [ ] API calls work
- [ ] Styling looks correct
- [ ] Mobile responsive
- [ ] No unused imports
- [ ] Code is readable

---

## Quick Reference - Component Props

### Button

```typescript
<Button
  variant="primary"        // primary, secondary
  fullWidth
  loading={false}
  disabled={false}
  onClick={() => {}}
>
  Click Me
</Button>
```

### Input

```typescript
<Input
  label="Label"
  type="text"              // text, number, email, search
  placeholder="Enter..."
  value=""
  onChange={(e) => {}}
  multiline
  rows={4}
  disabled={false}
/>
```

### Select

```typescript
<Select
  label="Choose"
  value=""
  onChange={(val) => {}}
  options={[
    { value: 'opt1', label: 'Option 1' }
  ]}
/>
```

### Card

```typescript
<Card className="mb-4" hover>
  Content
</Card>
```

---

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Variables prefixed with `NEXT_PUBLIC_` are accessible in the browser.

---

## Quick Troubleshooting

| Problem           | Solution                                |
| ----------------- | --------------------------------------- |
| Port 3000 in use  | `lsof -i :3000` then `kill -9 <PID>`    |
| Module not found  | Check import path and file exists       |
| API 404 errors    | Verify endpoint URL and backend running |
| Styling issues    | Rebuild project and clear browser cache |
| TypeScript errors | Check type definitions and interfaces   |

---

## Getting Help

1. Check error message in console
2. Review component props interface
3. Check API endpoint in backend
4. Look at similar working component
5. Check documentation
6. Debug with console.log

---

**Last Updated:** 2024
**Version:** 1.0
**For Questions:** Check documentation or review similar implementations

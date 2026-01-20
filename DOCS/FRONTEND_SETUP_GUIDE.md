# Frontend Setup & Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on configured base URL

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 2. Configure Environment

Create `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Update `frontend/utils/constants.ts`:

```typescript
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
```

### 3. Build for Production

```bash
npm run build
# or
yarn build
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

### Pages

- `/surveyor/dashboard` - Surveyor dashboard
- `/surveyor/slums` - List of available slums
- `/surveyor/slums/[id]` - Slum details and survey options
- `/surveyor/slum-survey/[id]` - Slum survey form
- `/surveyor/household-survey/[id]` - Household survey form

### Components

- **SurveyorLayout** - Mobile-first layout with bottom navigation
- **Card** - Reusable card component
- **Button** - Action button with variants
- **Input** - Text input with support for multiple types
- **Select** - Dropdown selector
- **Checkbox** - Checkbox input
- **Toast** - Notification system

### Services

- **API Service** (`services/api.ts`) - Centralized API communication

### Utilities

- **Constants** (`utils/constants.ts`) - Configuration constants
- **Colors** (`utils/colors.ts`) - Color palette definitions
- **Navigation** (`utils/navigationConfig.ts`) - Route configuration

## Key Features

### 1. Form Handling

#### Slum Survey (Stepper Format)

- 4-step form with visual progress
- Easy navigation between steps
- Review step before submission

#### Household Survey (Accordion Format)

- 5 collapsible sections
- Better organization for complex forms
- All fields in one page view

### 2. API Integration

All API calls go through the centralized API service:

```typescript
// Get all slums
const response = await apiService.getSlums();

// Submit slum survey
await apiService.submitSlumSurvey(slumId, formData);

// Submit household survey
await apiService.submitHouseholdSurvey(householdId, formData);
```

### 3. State Management

Uses React hooks for state management:

- `useState` for component state
- `useEffect` for side effects
- `useParams`, `useRouter` for navigation

### 4. Error Handling

Toast notifications for user feedback:

```typescript
showToast("Success message", "success");
showToast("Error message", "error");
showToast("Warning message", "warning");
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Deploy to Other Platforms

#### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t survey-frontend .
docker run -p 3000:3000 survey-frontend
```

#### Using Traditional Server

```bash
# Build
npm run build

# Start
npm start
```

## Performance Optimization

### Code Splitting

- Pages are automatically split by Next.js
- Dynamic imports for heavy components

### Image Optimization

- Use Next.js Image component for images
- Automatic WebP conversion

### Caching

- Static pages can be cached
- API responses can be cached on client

## Troubleshooting

### Issue: API connection errors

**Solution:** Check that:

1. Backend server is running
2. `NEXT_PUBLIC_API_BASE_URL` is correctly configured
3. CORS is properly configured on backend

### Issue: Forms not submitting

**Solution:** Check that:

1. All required fields are filled
2. Backend endpoints are correctly implemented
3. Authentication token is valid

### Issue: Styling not applying

**Solution:**

1. Clear `.next` folder: `rm -rf .next`
2. Rebuild: `npm run build`
3. Restart dev server: `npm run dev`

### Issue: Components not rendering

**Solution:**

1. Check browser console for errors
2. Verify all imports are correct
3. Ensure component files exist in correct location

## Development Tips

### Adding New Pages

1. Create file in `app/[role]/[page]/page.tsx`
2. Wrap with appropriate Layout component
3. Use API service for data fetching
4. Add to navigation config if needed

### Adding New Components

1. Create file in `components/ComponentName.tsx`
2. Export as default export
3. Define proper TypeScript interfaces
4. Add documentation comments

### Debugging

Use React DevTools:

```bash
npm install -D @react-devtools/shell
```

Browser DevTools tips:

- Console for error messages
- Network tab for API calls
- Elements tab for styling issues

## Testing

### Manual Testing Checklist

- [ ] Navigation between pages works
- [ ] Forms submit successfully
- [ ] Error messages display correctly
- [ ] Loading states appear during API calls
- [ ] Mobile responsiveness verified
- [ ] All buttons are clickable
- [ ] Search functionality works
- [ ] Filters apply correctly

### Automated Testing (Optional)

Setup Jest and React Testing Library:

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest @types/jest
```

Create test files with `.test.tsx` extension.

## Performance Monitoring

### Lighthouse Audit

```bash
npm run build
npx lighthouse http://localhost:3000
```

### Bundle Analysis

```bash
npm install -D @next/bundle-analyzer
```

## Security Best Practices

1. **Never commit secrets:** Use environment variables
2. **Input validation:** Always validate user input
3. **Authentication:** Implement proper token management
4. **HTTPS:** Use HTTPS in production
5. **CORS:** Configure CORS properly on backend
6. **Headers:** Set security headers

## Support & Troubleshooting

For issues or questions:

1. Check documentation
2. Review browser console for errors
3. Check backend API logs
4. Verify environment configuration
5. Test with sample data

---

**Frontend Version:** 1.0
**Next.js Version:** 14+
**React Version:** 18+
**Last Updated:** 2024

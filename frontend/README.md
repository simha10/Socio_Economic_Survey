# Socio-Economic Survey System - Frontend

This is the frontend application for the government-grade socio-economic survey system built with Next.js.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **API Communication**: Fetch API
- **Authentication**: JWT-based

## Features

- Role-based access control (Admin, Supervisor, Surveyor)
- Multi-step survey forms
- Responsive design for mobile surveyors
- Secure authentication with JWT
- CSV export capabilities
- Form validation and draft saving

## Installation

1. Make sure you have Node.js installed
2. Navigate to the frontend directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file with the API configuration:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

## Running the Application

1. Make sure the backend server is running on port 5000
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000` in your browser

## Folder Structure

```
/app                    # Next.js app router pages
/components            # Reusable UI components
/context               # React Context providers
/services              # API service and utilities
/utils                 # Constants and helper functions
```

## Available Pages

- `/login` - User authentication
- `/admin/*` - Admin dashboard and management
- `/supervisor/*` - Supervisor dashboard and assignments
- `/surveyor/*` - Surveyor dashboard and survey forms
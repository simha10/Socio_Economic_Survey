// Navigation configuration with role-based access control
// Industry-grade navigation structure following MNC best practices

import { Role } from '@/utils/constants';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  description?: string;
}

interface NavigationConfig {
  sidebar: NavItem[];
  bottomNav?: NavItem[];
}

type RoleNavigationMap = {
  [key in Lowercase<Role>]?: NavigationConfig;
};

export const NAVIGATION_CONFIG: RoleNavigationMap = {
  surveyor: {
    sidebar: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        href: '/surveyor/dashboard',
        description: 'Overview of assignments and progress'
      },
      {
        id: 'assignments',
        label: 'My Assignments',
        icon: '📋',
        href: '/surveyor/assignments',
        description: 'View assigned slums and surveys'
      },
      {
        id: 'slums',
        label: 'Slums',
        icon: '🏘️',
        href: '/surveyor/slums',
        description: 'Browse and access assigned slums'
      },
      {
        id: 'progress',
        label: 'Progress',
        icon: '📈',
        href: '/surveyor/progress',
        description: 'Track survey completion status'
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        href: '/surveyor/profile',
        description: 'Manage account settings'
      }
    ],
    bottomNav: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/surveyor/dashboard' },
      { id: 'slums', label: 'Slums', icon: '🏘️', href: '/surveyor/slums' },
      { id: 'progress', label: 'Progress', icon: '📈', href: '/surveyor/progress' },
      { id: 'profile', label: 'Profile', icon: '👤', href: '/surveyor/profile' }
    ]
  },
  
  supervisor: {
    sidebar: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        href: '/supervisor/dashboard',
        description: 'Team overview and analytics'
      },
      {
        id: 'assignments',
        label: 'Assignments',
        icon: '📋',
        href: '/supervisor/assignments',
        description: 'Manage surveyor assignments'
      },
      {
        id: 'slums',
        label: 'Slums',
        icon: '🏘️',
        href: '/supervisor/slums',
        description: 'Manage slum data and creation'
      },
      {
        id: 'progress',
        label: 'Team Progress',
        icon: '📈',
        href: '/supervisor/progress',
        description: 'Monitor team survey completion'
      },
      {
        id: 'users',
        label: 'Surveyors',
        icon: '👥',
        href: '/supervisor/users',
        description: 'Manage surveyor accounts'
      }
    ]
  },
  
  admin: {
    sidebar: [
      {
        id: 'dashboard',
        label: 'Admin Dashboard',
        icon: '📊',
        href: '/admin/dashboard',
        description: 'System overview and analytics'
      },
      {
        id: 'assignments',
        label: 'All Assignments',
        icon: '📋',
        href: '/admin/assignments',
        description: 'Global assignment management'
      },
      {
        id: 'slums',
        label: 'Slum Management',
        icon: '🏘️',
        href: '/admin/slums',
        description: 'Complete slum administration'
      },
      {
        id: 'users',
        label: 'User Management',
        icon: '👥',
        href: '/admin/users',
        description: 'Manage all user accounts'
      },
      {
        id: 'exports',
        label: 'Data Exports',
        icon: '📤',
        href: '/admin/exports',
        description: 'Export survey data and reports'
      }
    ]
  }
};

// Route mapping for assignment type awareness
export const ASSIGNMENT_ROUTES = {
  FULL_SLUM: {
    slumSurvey: '/surveyor/slum-survey/',
    householdSurveys: '/surveyor/household-surveys/'
  },
  HOUSEHOLD_ONLY: {
    slumData: '/surveyor/slum-data/', // Read-only slum information
    householdSurveys: '/surveyor/household-surveys/'
  }
};

// Survey type configuration
export const SURVEY_TYPES = {
  SLUM_SURVEY: {
    id: 'slum-survey',
    name: 'Slum Survey',
    description: 'Area-level survey covering complete slum infrastructure and demographics',
    icon: '🏙️',
    color: 'blue',
    requiredFor: 'FULL_SLUM'
  },
  HOUSEHOLD_SURVEY: {
    id: 'household-survey',
    name: 'Household Survey',
    description: 'Unit-level survey covering individual household data',
    icon: '🏠',
    color: 'green',
    requiredFor: 'Both'
  }
};

// Role-based permissions
export const PERMISSIONS = {
  surveyor: {
    canView: ['dashboard', 'assignments', 'slums', 'progress', 'profile'],
    canCreate: ['household-surveys'],
    canEdit: ['own-surveys'],
    canSubmit: ['own-surveys']
  },
  supervisor: {
    canView: ['dashboard', 'assignments', 'slums', 'progress', 'users'],
    canCreate: ['slums', 'assignments', 'household-surveys'],
    canEdit: ['all-surveys', 'user-accounts'],
    canReview: ['submitted-surveys'],
    canAssign: ['surveyors-to-slums']
  },
  admin: {
    canView: ['dashboard', 'assignments', 'slums', 'users', 'exports'],
    canCreate: ['everything'],
    canEdit: ['everything'],
    canDelete: ['everything'],
    canExport: ['all-data']
  }
};
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  SURVEYOR: 'SURVEYOR',
} as const;

export type Role = keyof typeof ROLES;

export const ROUTES = {
  LOGIN: '/login',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SLUMS: '/admin/slums',
    EXPORTS: '/admin/exports',
  },
  SUPERVISOR: {
    DASHBOARD: '/supervisor/dashboard',
    ASSIGNMENTS: '/supervisor/assignments',
    PROGRESS: '/supervisor/progress',
  },
  SURVEYOR: {
    DASHBOARD: '/surveyor/dashboard',
    SLUMS: '/surveyor/slums',
    SLUM_SURVEY: '/surveyor/slum-survey',
    HOUSEHOLD_SURVEY: '/surveyor/household-survey',
  },
} as const;

export const SLUM_TYPES = ['NOTIFIED', 'NON_NOTIFIED'] as const;
export type SlumType = typeof SLUM_TYPES[number];

export const HOUSING_TYPES = ['PUCCA', 'SEMI_PUCCA', 'KUTCHA'] as const;
export type HousingType = typeof HOUSING_TYPES[number];

export const WATER_SOURCES = ['TAP', 'HANDPUMP', 'TANKER', 'OTHER'] as const;
export type WaterSource = typeof WATER_SOURCES[number];

export const DRAINAGE_TYPES = ['OPEN', 'CLOSED', 'NONE'] as const;
export type DrainageType = typeof DRAINAGE_TYPES[number];

export const ROAD_TYPES = ['PUCCA', 'KUTCHA', 'NONE'] as const;
export type RoadType = typeof ROAD_TYPES[number];

export const TOILET_TYPES = ['INDIVIDUAL', 'COMMUNITY', 'NONE'] as const;
export type ToiletType = typeof TOILET_TYPES[number];

export const COOKING_FUELS = ['LPG', 'WOOD', 'KEROSENE', 'OTHER'] as const;
export type CookingFuel = typeof COOKING_FUELS[number];

export const EDUCATION_LEVELS = ['ILLITERATE', 'PRIMARY', 'SECONDARY', 'GRADUATE'] as const;
export type EducationLevel = typeof EDUCATION_LEVELS[number];

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type Gender = typeof GENDERS[number];

export const CASTES = ['SC', 'ST', 'OBC', 'GENERAL'] as const;
export type Caste = typeof CASTES[number];

export const SURVEY_STATUS = ['DRAFT', 'SUBMITTED'] as const;
export type SurveyStatus = typeof SURVEY_STATUS[number];

// Indian States
export const INDIAN_STATES = [
  { code: 'AN', name: 'ANDAMAN AND NICOBAR ISLANDS' },
  { code: 'AP', name: 'ANDHRA PRADESH' },
  { code: 'AR', name: 'ARUNACHAL PRADESH' },
  { code: 'AS', name: 'ASSAM' },
  { code: 'BR', name: 'BIHAR' },
  { code: 'CH', name: 'CHANDIGARH' },
  { code: 'CT', name: 'CHHATTISGARH' },
  { code: 'DH', name: 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU' },
  { code: 'DL', name: 'DELHI' },
  { code: 'GA', name: 'GOA' },
  { code: 'GJ', name: 'GUJARAT' },
  { code: 'HP', name: 'HIMACHAL PRADESH' },
  { code: 'HR', name: 'HARYANA' },
  { code: 'JH', name: 'JHARKHAND' },
  { code: 'JK', name: 'JAMMU AND KASHMIR' },
  { code: 'KA', name: 'KARNATAKA' },
  { code: 'KL', name: 'KERALA' },
  { code: 'LA', name: 'LADAKH' },
  { code: 'LD', name: 'LAKSHADWEEP' },
  { code: 'MH', name: 'MAHARASHTRA' },
  { code: 'ML', name: 'MEGHALAYA' },
  { code: 'MN', name: 'MANIPUR' },
  { code: 'MP', name: 'MADHYA PRADESH' },
  { code: 'MZ', name: 'MIZORAM' },
  { code: 'NL', name: 'NAGALAND' },
  { code: 'OR', name: 'ODISHA' },
  { code: 'PB', name: 'PUNJAB' },
  { code: 'PY', name: 'PUDUCHERRY' },
  { code: 'RJ', name: 'RAJASTHAN' },
  { code: 'SK', name: 'SIKKIM' },
  { code: 'TG', name: 'TELANGANA' },
  { code: 'TN', name: 'TAMIL NADU' },
  { code: 'TR', name: 'TRIPURA' },
  { code: 'UP', name: 'UTTAR PRADESH' },
  { code: 'UK', name: 'UTTARAKHAND' },
  { code: 'WB', name: 'WEST BENGAL' },
] as const;

export type IndianState = typeof INDIAN_STATES[number];
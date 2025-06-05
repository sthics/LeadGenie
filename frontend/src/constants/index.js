// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  LEADS: {
    BASE: '/leads',
    BY_ID: (id) => `/leads/${id}`,
    SCORE: (id) => `/leads/${id}/score`,
  },
}

// Lead categories
export const LEAD_CATEGORIES = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
}

// Lead statuses
export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED: 'closed',
  LOST: 'lost',
}

// Budget ranges
export const BUDGET_RANGES = [
  { label: 'Under $5,000', value: '0-5000' },
  { label: '$5,000 - $10,000', value: '5000-10000' },
  { label: '$10,000 - $25,000', value: '10000-25000' },
  { label: '$25,000 - $50,000', value: '25000-50000' },
  { label: '$50,000+', value: '50000+' },
]

// Timeline options
export const TIMELINE_OPTIONS = [
  { label: 'Immediate', value: 'immediate' },
  { label: 'Within 1 month', value: '1-month' },
  { label: 'Within 3 months', value: '3-months' },
  { label: 'Within 6 months', value: '6-months' },
  { label: 'More than 6 months', value: '6-months+' },
]

// Sort options
export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
  { label: 'Score (High to Low)', value: 'score-desc' },
  { label: 'Score (Low to High)', value: 'score-asc' },
  { label: 'Budget (High to Low)', value: 'budget-desc' },
  { label: 'Budget (Low to High)', value: 'budget-asc' },
]

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
}

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LEADS: '/leads',
  LEAD_FORM: '/leads/new',
  LEAD_DETAILS: (id) => `/leads/${id}`,
  SETTINGS: '/settings',
  PROFILE: '/profile',
}

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
}

// Toast messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in',
    LOGOUT: 'Successfully logged out',
    LEAD_CREATED: 'Lead created successfully',
    LEAD_UPDATED: 'Lead updated successfully',
    LEAD_DELETED: 'Lead deleted successfully',
  },
  ERROR: {
    LOGIN: 'Invalid email or password',
    NETWORK: 'Network error. Please try again',
    UNKNOWN: 'Something went wrong. Please try again',
  },
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
}

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
}

// Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
}

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
}

// Theme colors
export const THEME_COLORS = {
  PRIMARY: {
    light: '#3B82F6',
    dark: '#60A5FA',
  },
  SECONDARY: {
    light: '#6B7280',
    dark: '#9CA3AF',
  },
  SUCCESS: {
    light: '#10B981',
    dark: '#34D399',
  },
  ERROR: {
    light: '#EF4444',
    dark: '#F87171',
  },
  WARNING: {
    light: '#F59E0B',
    dark: '#FBBF24',
  },
} 
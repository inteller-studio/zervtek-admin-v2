// Authentication constants
export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_COOKIE: 'zervtek_access_token',
  USER_DATA_COOKIE: 'user_data',
  TOKEN_EXPIRY_HOURS: 24,
} as const

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  BLOG_PAGE_SIZE: 6,
  INVOICE_PAGE_SIZE: 10,
  CUSTOMER_PAGE_SIZE: 10,
} as const

// Customer spending thresholds (in cents or base currency unit)
export const CUSTOMER_TIERS = {
  VIP_THRESHOLD: 500000,
  PREMIUM_THRESHOLD: 300000,
  REGULAR_THRESHOLD: 150000,
  BASIC_THRESHOLD: 50000,
} as const

// Theme constants
export const THEME_CONSTANTS = {
  COOKIE_NAME: 'zervtek-ui-theme',
  COOKIE_MAX_AGE_SECONDS: 60 * 60 * 24 * 365, // 1 year
} as const

// Status badge colors
export const STATUS_COLORS = {
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
} as const

// API timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  UPLOAD: 120000,
  LONG_RUNNING: 60000,
} as const

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

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 10000,
  BACKOFF_FACTOR: 2,
} as const

// UI animation durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  TRANSITION: 200,
} as const

// Debounce/throttle delays (in milliseconds)
export const DEBOUNCE = {
  SEARCH: 300,
  RESIZE: 100,
  SCROLL: 50,
  INPUT: 150,
} as const

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
} as const

// Table/grid constants
export const TABLE = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5,
  MIN_COLUMN_WIDTH: 100,
} as const

// Form validation limits
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_COMMENT_LENGTH: 5000,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
} as const

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  API: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm',
} as const

// Touch targets (in pixels) - for mobile accessibility
export const TOUCH_TARGETS = {
  MIN_SIZE: 44,
  RECOMMENDED_SIZE: 48,
} as const

// Breakpoints (matching Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const

// HTTP status codes for reference
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Local storage keys
export const STORAGE_KEYS = {
  SIDEBAR_STATE: 'zervtek_sidebar_state',
  TABLE_PREFERENCES: 'zervtek_table_prefs',
  RECENT_SEARCHES: 'zervtek_recent_searches',
  DRAFT_FORMS: 'zervtek_draft_forms',
} as const

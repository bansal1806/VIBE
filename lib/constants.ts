/**
 * Application Constants
 * Centralized configuration values for the Vibe application
 */

// AR Radar Configuration
export const AR_RADAR = {
    MAX_USERS_DISPLAYED: 10, // Maximum users shown in AR radar
    MIN_RADIUS_PERCENT: 30, // Minimum distance from center (percentage)
    MAX_RADIUS_PERCENT: 50, // Maximum distance from center (percentage)
    POSITION_BUFFER: 10, // Buffer from edges (percentage)
} as const

// Room Configuration
export const ROOMS = {
    DEFAULT_EXPIRY_HOURS: 24, // Default room expiry time
    MAX_CAPACITY_DEFAULT: 50, // Default max capacity
    PING_TIMEOUT_MINUTES: 30, // Room inactivity timeout
} as const

// Timecapsule Configuration
export const TIMECAPSULES = {
    MAX_NOTIFICATION_RECIPIENTS: 100, // Max users to notify on unlock
    MIN_UNLOCK_DAYS: 7, // Minimum days until unlock
} as const

// Authentication
export const AUTH = {
    OTP_LENGTH: 6, // Length of OTP code
    OTP_EXPIRY_MINUTES: 10, // OTP validity period
    SESSION_COOKIE_DAYS: 7, // Session cookie duration
    JWT_MIN_SECRET_LENGTH: 32, // Minimum JWT secret length
} as const

// Profile
export const PROFILE = {
    MIN_INTERESTS: 3, // Minimum interests required
    MIN_INTENTS: 1, // Minimum intents required
    ALIAS_MIN_LENGTH: 3, // Minimum alias length
    ALIAS_MAX_LENGTH: 20, // Maximum alias length
    BIO_MAX_LENGTH: 500, // Maximum bio length
} as const

// Notifications
export const NOTIFICATIONS = {
    MAX_PER_PAGE: 50, // Max notifications per page
    MARK_READ_DELAY_MS: 2000, // Delay before marking as read
} as const

// Feed
export const FEED = {
    DEFAULT_PAGE_SIZE: 20, // Default feed items per page
    MAX_PAGE_SIZE: 100, // Maximum feed items per page
} as const

// API Rate Limiting (for future implementation)
export const RATE_LIMITS = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // Max requests per window
} as const

// File Upload (for future implementation)
export const UPLOADS = {
    MAX_FILE_SIZE_MB: 5, // Maximum file size for uploads
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
    AVATAR_SIZE_PX: 400, // Avatar image size
} as const

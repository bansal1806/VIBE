import { getRedisClient } from '@/lib/redis'

const OTP_EXPIRY_SECONDS = 600 // 10 minutes
const MAX_OTP_ATTEMPTS = 3
const RATE_LIMIT_WINDOW = 900 // 15 minutes

// In-memory fallback (dev/local only)
// This is used when Redis is not configured or unreachable.
type OtpRecord = { code: string; expiresAt: number }
const memoryOtpStore: Map<string, OtpRecord> = new Map()
const memoryRateLimitStore: Map<string, { attempts: number; resetAt: number }> = new Map()

function isUsingMemoryStore(): boolean {
  // Use memory when REDIS_URL is not set or explicitly requested via env
  const forceMemory = process.env.USE_IN_MEMORY_AUTH === 'true'
  const hasRedis = !!process.env.REDIS_URL
  return forceMemory || !hasRedis
}

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateOTP(): string {
  const min = 100000
  const max = 999999
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

/**
 * Store OTP with expiration
 */
export async function storeOTP(email: string, otp: string): Promise<void> {
  const key = email.toLowerCase()

  if (isUsingMemoryStore()) {
    const expiresAt = Date.now() + OTP_EXPIRY_SECONDS * 1000
    memoryOtpStore.set(key, { code: otp, expiresAt })
    return
  }

  try {
    const redis = getRedisClient()
    if (!redis) throw new Error('Redis not available')
    await redis.setex(`otp:${key}`, OTP_EXPIRY_SECONDS, otp)
  } catch {
    // Fallback to memory if Redis fails at runtime
    const expiresAt = Date.now() + OTP_EXPIRY_SECONDS * 1000
    memoryOtpStore.set(key, { code: otp, expiresAt })
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const key = email.toLowerCase()

  if (isUsingMemoryStore()) {
    const record = memoryOtpStore.get(key)
    if (!record || Date.now() > record.expiresAt) {
      memoryOtpStore.delete(key)
      return false
    }
    const isValid = record.code === otp
    if (isValid) {
      memoryOtpStore.delete(key)
    }
    return isValid
  }

  try {
    const redis = getRedisClient()
    if (!redis) throw new Error('Redis not available')
    const storedOTP = await redis.get(`otp:${key}`)
    if (!storedOTP) return false
    const isValid = storedOTP === otp
    if (isValid) {
      await redis.del(`otp:${key}`)
    }
    return isValid
  } catch {
    // If Redis fails mid-flight, attempt memory store
    const record = memoryOtpStore.get(key)
    if (!record || Date.now() > record.expiresAt) {
      memoryOtpStore.delete(key)
      return false
    }
    const isValid = record.code === otp
    if (isValid) {
      memoryOtpStore.delete(key)
    }
    return isValid
  }
}

/**
 * Check rate limit for OTP requests
 */
export async function checkRateLimit(email: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = email.toLowerCase()

  if (isUsingMemoryStore()) {
    const now = Date.now()
    const existing = memoryRateLimitStore.get(key)
    if (!existing || now > existing.resetAt) {
      memoryRateLimitStore.set(key, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW * 1000 })
      return { allowed: true, remaining: MAX_OTP_ATTEMPTS - 1 }
    }
    existing.attempts += 1
    memoryRateLimitStore.set(key, existing)
    return {
      allowed: existing.attempts <= MAX_OTP_ATTEMPTS,
      remaining: Math.max(0, MAX_OTP_ATTEMPTS - existing.attempts),
    }
  }

  try {
    const redis = getRedisClient()
    if (!redis) throw new Error('Redis not available')
    const rateKey = `otp:rate:${key}`
    const attempts = await redis.incr(rateKey)
    if (attempts === 1) {
      await redis.expire(rateKey, RATE_LIMIT_WINDOW)
    }
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - attempts)
    return { allowed: attempts <= MAX_OTP_ATTEMPTS, remaining }
  } catch {
    // Fallback to memory if Redis fails
    const now = Date.now()
    const existing = memoryRateLimitStore.get(key)
    if (!existing || now > existing.resetAt) {
      memoryRateLimitStore.set(key, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW * 1000 })
      return { allowed: true, remaining: MAX_OTP_ATTEMPTS - 1 }
    }
    existing.attempts += 1
    memoryRateLimitStore.set(key, existing)
    return {
      allowed: existing.attempts <= MAX_OTP_ATTEMPTS,
      remaining: Math.max(0, MAX_OTP_ATTEMPTS - existing.attempts),
    }
  }
}

/**
 * Clear rate limit (for testing or admin purposes)
 */
export async function clearRateLimit(email: string): Promise<void> {
  const key = email.toLowerCase()

  if (isUsingMemoryStore()) {
    memoryRateLimitStore.delete(key)
    return
  }

  try {
    const redis = getRedisClient()
    if (!redis) throw new Error('Redis not available')
    await redis.del(`otp:rate:${key}`)
  } catch {
    memoryRateLimitStore.delete(key)
  }
}

/**
 * Get OTP expiry time remaining (seconds)
 */
export async function getOTPExpiry(email: string): Promise<number | null> {
  const key = email.toLowerCase()

  if (isUsingMemoryStore()) {
    const record = memoryOtpStore.get(key)
    if (!record) return null
    const remainingMs = record.expiresAt - Date.now()
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : null
  }

  try {
    const redis = getRedisClient()
    if (!redis) throw new Error('Redis not available')
    const ttl = await redis.ttl(`otp:${key}`)
    return ttl > 0 ? ttl : null
  } catch {
    const record = memoryOtpStore.get(key)
    if (!record) return null
    const remainingMs = record.expiresAt - Date.now()
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : null
  }
}


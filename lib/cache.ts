import { getRedisConnection } from './jobs/connection'

const redis = getRedisConnection()

/**
 * Cache keys
 */
export const CACHE_KEYS = {
    user: (id: string) => `user:${id}`,
    userProfile: (id: string) => `user:profile:${id}`,
    connection: (userId: string, peerId: string) => `connection:${userId}:${peerId}`,
    room: (id: string) => `room:${id}`,
    roomMembers: (id: string) => `room:members:${id}`,
    feed: (userId: string) => `feed:${userId}`,
    recommendations: (userId: string) => `recommendations:${userId}`,
    session: (token: string) => `session:${token}`,
    otpAttempts: (email: string) => `otp:attempts:${email}`,
    rateLimit: (key: string) => `ratelimit:${key}`,
} as const

/**
 * Cache TTL (in seconds)
 */
export const CACHE_TTL = {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 24 hours
} as const

/**
 * Set cache value
 */
export async function setCache(
    key: string,
    value: any,
    ttl: number = CACHE_TTL.medium
): Promise<void> {
    if (!redis) return

    try {
        await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
        console.error('[cache] Set error:', error)
    }
}

/**
 * Get cache value
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
    if (!redis) return null

    try {
        const value = await redis.get(key)
        return value ? JSON.parse(value) : null
    } catch (error) {
        console.error('[cache] Get error:', error)
        return null
    }
}

/**
 * Delete cache value
 */
export async function deleteCache(key: string): Promise<void> {
    if (!redis) return

    try {
        await redis.del(key)
    } catch (error) {
        console.error('[cache] Delete error:', error)
    }
}

/**
 * Delete multiple cache values by pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
    if (!redis) return

    try {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
            await redis.del(...keys)
        }
    } catch (error) {
        console.error('[cache] Delete pattern error:', error)
    }
}

/**
 * Check if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
    if (!redis) return false

    try {
        const exists = await redis.exists(key)
        return exists === 1
    } catch (error) {
        console.error('[cache] Exists error:', error)
        return false
    }
}

/**
 * Increment counter (for rate limiting, etc.)
 */
export async function incrementCache(key: string, ttl?: number): Promise<number> {
    if (!redis) return 0

    try {
        const value = await redis.incr(key)
        if (ttl && value === 1) {
            await redis.expire(key, ttl)
        }
        return value
    } catch (error) {
        console.error('[cache] Increment error:', error)
        return 0
    }
}

/**
 * Add item to set
 */
export async function addToSet(key: string, value: string): Promise<void> {
    if (!redis) return

    try {
        await redis.sadd(key, value)
    } catch (error) {
        console.error('[cache] Add to set error:', error)
    }
}

/**
 * Remove item from set
 */
export async function removeFromSet(key: string, value: string): Promise<void> {
    if (!redis) return

    try {
        await redis.srem(key, value)
    } catch (error) {
        console.error('[cache] Remove from set error:', error)
    }
}

/**
 * Get all items from set
 */
export async function getSetMembers(key: string): Promise<string[]> {
    if (!redis) return []

    try {
        return await redis.smembers(key)
    } catch (error) {
        console.error('[cache] Get set members error:', error)
        return []
    }
}

/**
 * Check if item is in set
 */
export async function isInSet(key: string, value: string): Promise<boolean> {
    if (!redis) return false

    try {
        const isMember = await redis.sismember(key, value)
        return isMember === 1
    } catch (error) {
        console.error('[cache] Is in set error:', error)
        return false
    }
}

/**
 * Add item to sorted set with score
 */
export async function addToSortedSet(
    key: string,
    value: string,
    score: number
): Promise<void> {
    if (!redis) return

    try {
        await redis.zadd(key, score, value)
    } catch (error) {
        console.error('[cache] Add to sorted set error:', error)
    }
}

/**
 * Get items from sorted set by score range
 */
export async function getSortedSetRange(
    key: string,
    min: number,
    max: number
): Promise<string[]> {
    if (!redis) return []

    try {
        return await redis.zrangebyscore(key, min, max)
    } catch (error) {
        console.error('[cache] Get sorted set range error:', error)
        return []
    }
}

/**
 * Rate limiting helper
 */
export async function checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
    const key = CACHE_KEYS.rateLimit(identifier)
    const attempts = await incrementCache(key, windowSeconds)

    return {
        allowed: attempts <= maxAttempts,
        remaining: Math.max(0, maxAttempts - attempts),
    }
}

/**
 * Cache decorator for functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    keyGenerator: (...args: Parameters<T>) => string,
    ttl: number = CACHE_TTL.medium
): T {
    return (async (...args: Parameters<T>) => {
        const key = keyGenerator(...args)

        // Try to get from cache
        const cached = await getCache(key)
        if (cached !== null) {
            return cached
        }

        // Execute function and cache result
        const result = await fn(...args)
        await setCache(key, result, ttl)

        return result
    }) as T
}

/**
 * Invalidate user-related caches
 */
export async function invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
        deleteCache(CACHE_KEYS.user(userId)),
        deleteCache(CACHE_KEYS.userProfile(userId)),
        deleteCache(CACHE_KEYS.feed(userId)),
        deleteCache(CACHE_KEYS.recommendations(userId)),
        deleteCachePattern(`connection:${userId}:*`),
        deleteCachePattern(`connection:*:${userId}`),
    ])
}

/**
 * Invalidate room-related caches
 */
export async function invalidateRoomCache(roomId: string): Promise<void> {
    await Promise.all([
        deleteCache(CACHE_KEYS.room(roomId)),
        deleteCache(CACHE_KEYS.roomMembers(roomId)),
    ])
}

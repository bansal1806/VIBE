import Redis from 'ioredis'
import { log } from './logger'

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redis) return redis

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    log.warn('Redis URL not configured. Redis features will be disabled.')
    return null
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        // Exponential backoff with max delay of 3 seconds
        const delay = Math.min(times * 50, 3000)
        log.info(`Redis retry attempt ${times}, waiting ${delay}ms`)
        return delay
      },
      reconnectOnError(err) {
        log.warn('Redis reconnect on error', { error: err.message })
        // Reconnect on READONLY errors
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          return true
        }
        return false
      },
    })

    redis.on('error', (err) => {
      log.error('Redis Client Error', err)
    })

    redis.on('connect', () => {
      log.info('Redis connected successfully')
    })

    redis.on('ready', () => {
      log.info('Redis ready to accept commands')
    })

    redis.on('close', () => {
      log.warn('Redis connection closed')
    })

    redis.on('reconnecting', () => {
      log.info('Redis reconnecting...')
    })

    return redis
  } catch (error) {
    log.error('Failed to initialize Redis client', error)
    return null
  }
}

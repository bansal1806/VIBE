import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

// Validate JWT secret on initialization
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}

// After validation, we know JWT_SECRET is defined and valid
const JWT_SECRET: string = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'
const COOKIE_NAME = 'vibe_session'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY as `${number}d` | `${number}h` }
  )
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

/**
 * Get token from cookie
 */
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

/**
 * Set token in HTTP-only cookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Clear token cookie
 */
export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookie()
  if (!token) {
    return null
  }

  return verifyToken(token)
}


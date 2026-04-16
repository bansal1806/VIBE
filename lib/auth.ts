import { getCurrentUser } from './auth/jwt'
import { prisma } from './prisma'

export async function requireUser() {
  const payload = await getCurrentUser()

  if (!payload) {
    throw new Error('UNAUTHORIZED')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  // Update last active timestamp
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      lastActiveAt: new Date(),
    },
  })

  return updatedUser
}

export async function getOptionalUser() {
  try {
    return await requireUser()
  } catch {
    return null
  }
}

// Alias for backward compatibility
export const getSession = requireUser

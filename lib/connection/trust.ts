import { prisma } from '../prisma'

/**
 * Trust level thresholds and unlock rules
 */
export const TRUST_LEVELS = {
    STRANGER: 0,
    ACQUAINTANCE: 20,
    FRIEND: 50,
    CLOSE_FRIEND: 80,
} as const

export const UNLOCK_THRESHOLDS = {
    NAME: TRUST_LEVELS.ACQUAINTANCE,
    MAJOR: TRUST_LEVELS.ACQUAINTANCE,
    YEAR: TRUST_LEVELS.ACQUAINTANCE,
    BIO: TRUST_LEVELS.FRIEND,
    INTERESTS: TRUST_LEVELS.FRIEND,
    CONTACT_INFO: TRUST_LEVELS.CLOSE_FRIEND,
    FULL_PROFILE: TRUST_LEVELS.CLOSE_FRIEND,
} as const

/**
 * Points awarded for different interactions
 */
export const INTERACTION_POINTS = {
    MESSAGE_SENT: 2,
    MESSAGE_RECEIVED: 1,
    ROOM_TIME_TOGETHER_MINUTES: 0.5, // Per minute in same room
    PROFILE_VIEW: 1,
    MUTUAL_INTEREST: 5,
    MUTUAL_FRIEND: 3,
} as const

/**
 * Calculate trust level increase for an interaction
 */
export function calculateTrustIncrease(
    interactionType: keyof typeof INTERACTION_POINTS,
    quantity: number = 1
): number {
    const basePoints = INTERACTION_POINTS[interactionType]
    return basePoints * quantity
}

/**
 * Update connection trust level
 */
export async function updateTrustLevel(
    connectionId: string,
    increase: number
): Promise<{ newLevel: number; unlocked: string[] }> {
    const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
    })

    if (!connection) {
        throw new Error('Connection not found')
    }

    const oldLevel = connection.trustLevel
    const newLevel = Math.min(100, oldLevel + increase)

    await prisma.connection.update({
        where: { id: connectionId },
        data: { trustLevel: newLevel },
    })

    // Determine what got unlocked
    const unlocked: string[] = []

    Object.entries(UNLOCK_THRESHOLDS).forEach(([field, threshold]) => {
        if (oldLevel < threshold && newLevel >= threshold) {
            unlocked.push(field)
        }
    })

    return { newLevel, unlocked }
}

/**
 * Increment trust for message interaction
 */
export async function incrementTrustForMessage(
    senderId: string,
    receiverId: string
): Promise<void> {
    // Find connection
    const connection = await prisma.connection.findFirst({
        where: {
            OR: [
                { userId: senderId, peerId: receiverId },
                { userId: receiverId, peerId: senderId },
            ],
        },
    })

    if (!connection) return

    const increase = calculateTrustIncrease('MESSAGE_SENT')
    await updateTrustLevel(connection.id, increase)
}

/**
 * Increment trust for room time together
 */
export async function incrementTrustForRoomTime(
    userId1: string,
    userId2: string,
    minutes: number
): Promise<void> {
    // Find or create connection
    let connection = await prisma.connection.findFirst({
        where: {
            OR: [
                { userId: userId1, peerId: userId2 },
                { userId: userId2, peerId: userId1 },
            ],
        },
    })

    // Create connection if it doesn't exist
    if (!connection) {
        connection = await prisma.connection.create({
            data: {
                userId: userId1,
                peerId: userId2,
                status: 'CONNECTED',
                trustLevel: 0,
            },
        })
    }

    const increase = calculateTrustIncrease('ROOM_TIME_TOGETHER_MINUTES', minutes)
    await updateTrustLevel(connection.id, increase)
}

/**
 * Check what profile fields are unlocked at current trust level
 */
export function getUnlockedFields(trustLevel: number): {
    name: boolean
    major: boolean
    year: boolean
    bio: boolean
    interests: boolean
    contactInfo: boolean
    fullProfile: boolean
} {
    return {
        name: trustLevel >= UNLOCK_THRESHOLDS.NAME,
        major: trustLevel >= UNLOCK_THRESHOLDS.MAJOR,
        year: trustLevel >= UNLOCK_THRESHOLDS.YEAR,
        bio: trustLevel >= UNLOCK_THRESHOLDS.BIO,
        interests: trustLevel >= UNLOCK_THRESHOLDS.INTERESTS,
        contactInfo: trustLevel >= UNLOCK_THRESHOLDS.CONTACT_INFO,
        fullProfile: trustLevel >= UNLOCK_THRESHOLDS.FULL_PROFILE,
    }
}

/**
 * Get trust level description
 */
export function getTrustLevelDescription(trustLevel: number): string {
    if (trustLevel >= TRUST_LEVELS.CLOSE_FRIEND) return 'Close Friend'
    if (trustLevel >= TRUST_LEVELS.FRIEND) return 'Friend'
    if (trustLevel >= TRUST_LEVELS.ACQUAINTANCE) return 'Acquaintance'
    return 'Stranger'
}

/**
 * Get progress to next unlock
 */
export function getNextUnlock(trustLevel: number): {
    field: string
    threshold: number
    progress: number
} | null {
    const thresholds = Object.entries(UNLOCK_THRESHOLDS)
        .map(([field, threshold]) => ({ field, threshold }))
        .sort((a, b) => a.threshold - b.threshold)

    const next = thresholds.find((t) => t.threshold > trustLevel)

    if (!next) return null

    return {
        field: next.field,
        threshold: next.threshold,
        progress: (trustLevel / next.threshold) * 100,
    }
}

/**
 * Batch update trust for multiple users in a room
 */
export async function batchUpdateRoomTrust(
    roomId: string,
    durationMinutes: number
): Promise<void> {
    // Get all active members
    const members = await prisma.roomMember.findMany({
        where: {
            roomId,
            leftAt: null,
        },
        select: {
            userId: true,
        },
    })

    const userIds = members.map((m) => m.userId)

    // Update trust for all pairs
    const updates: Promise<void>[] = []

    for (let i = 0; i < userIds.length; i++) {
        for (let j = i + 1; j < userIds.length; j++) {
            updates.push(incrementTrustForRoomTime(userIds[i], userIds[j], durationMinutes))
        }
    }

    await Promise.all(updates)
}

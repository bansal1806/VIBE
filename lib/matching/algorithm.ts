import { prisma } from '../prisma'
import type { User } from '@prisma/client'

export interface CompatibilityScore {
    overall: number // 0-100
    breakdown: {
        interests: number
        academic: number
        intent: number
        activity: number
    }
}

/**
 * Calculate Jaccard similarity coefficient for two sets
 */
function jaccardSimilarity(set1: string[], set2: string[]): number {
    if (set1.length === 0 && set2.length === 0) return 0

    const intersection = set1.filter((item) => set2.includes(item)).length
    const union = new Set([...set1, ...set2]).size

    return union === 0 ? 0 : intersection / union
}

/**
 * Calculate interest overlap score
 */
function calculateInterestScore(user1: User, user2: User): number {
    const interests1 = user1.interests || []
    const interests2 = user2.interests || []

    return jaccardSimilarity(interests1, interests2) * 100
}

/**
 * Calculate academic compatibility
 */
function calculateAcademicScore(user1: User, user2: User): number {
    let score = 0

    // Same major bonus
    if (user1.major && user2.major && user1.major === user2.major) {
        score += 40
    }

    // Same year bonus
    if (user1.year && user2.year && user1.year === user2.year) {
        score += 30
    }

    // Same campus (should always be true in campus-based matching)
    if (user1.campusId && user2.campusId && user1.campusId === user2.campusId) {
        score += 30
    }

    return Math.min(score, 100)
}

/**
 * Calculate intent compatibility
 */
function calculateIntentScore(user1: User, user2: User): number {
    const intents1 = user1.intents || []
    const intents2 = user2.intents || []
    const seeking1 = user1.seeking || []
    const seeking2 = user2.seeking || []

    // Check if what user1 is seeking aligns with user2's intents and vice versa
    const user1SeeksUser2Offers = jaccardSimilarity(seeking1, intents2)
    const user2SeeksUser1Offers = jaccardSimilarity(seeking2, intents1)

    // Average bidirectional compatibility
    return ((user1SeeksUser2Offers + user2SeeksUser1Offers) / 2) * 100
}

/**
 * Calculate activity compatibility (recent activity level)
 */
function calculateActivityScore(user1: User, user2: User): number {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    const user1Active = user1.lastActiveAt ?
        now - user1.lastActiveAt.getTime() < 7 * dayMs : false
    const user2Active = user2.lastActiveAt ?
        now - user2.lastActiveAt.getTime() < 7 * dayMs : false

    if (user1Active && user2Active) return 100
    if (user1Active || user2Active) return 50
    return 0
}

/**
 * Calculate overall compatibility score between two users
 */
export function calculateCompatibility(user1: User, user2: User): CompatibilityScore {
    const interestScore = calculateInterestScore(user1, user2)
    const academicScore = calculateAcademicScore(user1, user2)
    const intentScore = calculateIntentScore(user1, user2)
    const activityScore = calculateActivityScore(user1, user2)

    // Weighted average
    const weights = {
        interests: 0.35,
        academic: 0.25,
        intent: 0.30,
        activity: 0.10,
    }

    const overall =
        interestScore * weights.interests +
        academicScore * weights.academic +
        intentScore * weights.intent +
        activityScore * weights.activity

    return {
        overall: Math.round(overall),
        breakdown: {
            interests: Math.round(interestScore),
            academic: Math.round(academicScore),
            intent: Math.round(intentScore),
            activity: Math.round(activityScore),
        },
    }
}

/**
 * Get personalized recommendations for a user
 */
export async function generateRecommendations(
    userId: string,
    limit: number = 20
): Promise<{ user: User; score: number }[]> {
    // Get current user
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!currentUser || !currentUser.campusId) {
        return []
    }

    // Get existing connections to exclude
    const existingConnections = await prisma.connection.findMany({
        where: {
            OR: [
                { userId },
                { peerId: userId },
            ],
        },
        select: {
            userId: true,
            peerId: true,
        },
    })

    const excludeUserIds = new Set([
        userId,
        ...existingConnections.map((c) => c.userId),
        ...existingConnections.map((c) => c.peerId),
    ])

    // Get potential matches from same campus
    const potentialMatches = await prisma.user.findMany({
        where: {
            campusId: currentUser.campusId,
            id: { notIn: Array.from(excludeUserIds) },
            discoverable: true,
            profileCompletedAt: { not: null },
        },
        take: 100, // Get more to filter and sort
    })

    // Calculate compatibility scores
    const scored = potentialMatches
        .map((user) => ({
            user,
            score: calculateCompatibility(currentUser, user).overall,
        }))
        .filter((item) => item.score > 30) // Minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    return scored
}

/**
 * Diversify recommendations to prevent filter bubbles
 */
export function diversifyRecommendations<T extends { score: number }>(
    items: T[],
    diversityFactor: number = 0.2
): T[] {
    if (items.length <= 10) return items

    const topCount = Math.ceil(items.length * (1 - diversityFactor))
    const randomCount = items.length - topCount

    // Take top items
    const topItems = items.slice(0, topCount)

    // Random sample from remaining
    const remaining = items.slice(topCount)
    const randomItems: T[] = []

    for (let i = 0; i < randomCount && remaining.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * remaining.length)
        randomItems.push(remaining.splice(randomIndex, 1)[0])
    }

    return [...topItems, ...randomItems]
}

/**
 * Get cold start recommendations (for new users with limited profile data)
 */
export async function getColdStartRecommendations(
    userId: string,
    limit: number = 20
): Promise<User[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user || !user.campusId) {
        return []
    }

    // Get existing connections to exclude
    const existingConnections = await prisma.connection.findMany({
        where: {
            OR: [
                { userId },
                { peerId: userId },
            ],
        },
        select: {
            userId: true,
            peerId: true,
        },
    })

    const excludeUserIds = new Set([
        userId,
        ...existingConnections.map((c) => c.userId),
        ...existingConnections.map((c) => c.peerId),
    ])

    // Show most active users from same campus
    return await prisma.user.findMany({
        where: {
            campusId: user.campusId,
            id: { notIn: Array.from(excludeUserIds) },
            discoverable: true,
            profileCompletedAt: { not: null },
            lastActiveAt: {
                gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Active in last 14 days
            },
        },
        orderBy: {
            lastActiveAt: 'desc',
        },
        take: limit,
    })
}

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/profile/status
 * Get the current user's profile completion status
 */
export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                alias: true,
                name: true,
                avatarUrl: true,
                bio: true,
                major: true,
                year: true,
                interests: true,
                onboardingAt: true,
                profileCompletedAt: true,
                dualIdentityMode: true,
                campusId: true,
                headline: true,
                pronouns: true,
                lookingFor: true,
                intents: true,
                seeking: true,
            },
        })

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        // Determine profile completion status
        const hasCompletedBasics = !!(
            profile.alias &&
            profile.name &&
            profile.year &&
            profile.campusId
        )

        const hasCompletedProfile = !!(
            hasCompletedBasics &&
            profile.interests.length > 0 &&
            profile.intents.length > 0 &&
            profile.profileCompletedAt
        )

        const status = {
            isComplete: hasCompletedProfile,
            hasCompletedBasics,
            hasCompletedProfile,
            currentStep: hasCompletedProfile
                ? 'complete'
                : hasCompletedBasics
                    ? 'profile'
                    : 'onboarding',
            profile: {
                ...profile,
                completionPercentage: calculateCompletionPercentage(profile),
            },
        }

        return NextResponse.json(status)
    } catch (error) {
        console.error('[profile/status] error', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * Calculate profile completion percentage
 */
function calculateCompletionPercentage(profile: {
    alias: string | null
    name: string | null
    year: string | null
    campusId: string | null
    bio: string | null
    major: string | null
    headline: string | null
    pronouns: string | null
    avatarUrl: string | null
    interests: string[]
    intents: string[]
    lookingFor: string[]
    seeking: string[]
}): number {
    const fields = [
        profile.alias,
        profile.name,
        profile.year,
        profile.campusId,
        profile.bio,
        profile.major,
        profile.headline,
        profile.pronouns,
        profile.avatarUrl,
        profile.interests?.length > 0,
        profile.intents?.length > 0,
        profile.lookingFor?.length > 0,
        profile.seeking?.length > 0,
    ]

    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
}

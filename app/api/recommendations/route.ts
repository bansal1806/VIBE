import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateRecommendations, getColdStartRecommendations } from '@/lib/matching/algorithm'
import { setCache, getCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getSession()
        if (!session?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const refresh = searchParams.get('refresh') === 'true'

        // Check cache first (unless refresh requested)
        if (!refresh) {
            const cached = await getCache(CACHE_KEYS.recommendations(session.id))
            if (cached) {
                return NextResponse.json({
                    success: true,
                    data: cached,
                    cached: true,
                })
            }
        }

        // Generate recommendations
        let recommendations = await generateRecommendations(session.id, limit * 2)

        // Fallback to cold start if no recommendations
        if (recommendations.length === 0) {
            const coldStart = await getColdStartRecommendations(session.id, limit)
            recommendations = coldStart.map((user) => ({ user, score: 50 }))
        }

        // Take only requested limit
        const result = recommendations.slice(0, limit)

        // Cache for 5 minutes
        await setCache(CACHE_KEYS.recommendations(session.id), result, CACHE_TTL.medium)

        return NextResponse.json({
            success: true,
            data: result,
            cached: false,
        })
    } catch (error: any) {
        console.error('[recommendations] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to get recommendations' },
            { status: 500 }
        )
    }
}

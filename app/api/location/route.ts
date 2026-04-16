import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { latitude, longitude, accuracy } = body

        if (!latitude || !longitude) {
            return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
        }

        // TODO: Update user location in database with proper auth
        // For now, accepting location for client-side caching

        return NextResponse.json({
            success: true,
            message: 'Location received',
        })
    } catch (error: any) {
        console.error('[location] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update location' },
            { status: 500 }
        )
    }
}

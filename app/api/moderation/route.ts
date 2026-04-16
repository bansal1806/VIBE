import { NextRequest, NextResponse } from 'next/server'
import { submitReport, blockUser, getBlockedUsers, ReportReason } from '@/lib/moderation/reports'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, ...data } = body

        // Simple auth check - in production, use proper session management
        const userId = request.headers.get('x-user-id')
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        switch (action) {
            case 'report':
                const result = await submitReport({
                    reporterId: userId,
                    ...data,
                })
                return NextResponse.json({ success: result.success })

            case 'block':
                const blocked = await blockUser(userId, data.targetUserId)
                return NextResponse.json({ success: blocked })

            case 'get_blocked':
                const blockedUsers = await getBlockedUsers(userId)
                return NextResponse.json({ success: true, data: blockedUsers })

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error: any) {
        console.error('[moderation] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Moderation action failed' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUnreadNotifications, markNotificationRead, markAllNotificationsRead, getNotificationCounts } from '@/lib/notifications/database'

export const runtime = 'nodejs'

/**
 * GET - Fetch user's notifications
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const countsOnly = searchParams.get('counts') === 'true'

        if (countsOnly) {
            const counts = await getNotificationCounts(session.id)
            return NextResponse.json({
                success: true,
                data: counts,
            })
        }

        const notifications = await getUnreadNotifications(session.id)

        return NextResponse.json({
            success: true,
            data: notifications,
        })
    } catch (error: any) {
        console.error('[notifications] GET Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch notifications' },
            { status: 500 }
        )
    }
}

/**
 * PATCH - Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { notificationId, markAll } = body

        if (markAll) {
            await markAllNotificationsRead(session.id)
        } else if (notificationId) {
            await markNotificationRead(notificationId)
        } else {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: markAll ? 'All notifications marked as read' : 'Notification marked as read',
        })
    } catch (error: any) {
        console.error('[notifications] PATCH Error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update notification' },
            { status: 500 }
        )
    }
}

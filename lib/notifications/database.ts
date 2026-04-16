import { prisma } from '../prisma'
import type { NotificationType } from '@prisma/client'
import type { Json } from '../supabase/database.types'

export interface NotificationPayload {
    message: string
    action?: string
    [key: string]: string | number | boolean | null | undefined | Json
}

/**
 * Create a notification for a user
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    payload: NotificationPayload
): Promise<void> {
    await prisma.notification.create({
        data: {
            userId,
            type,
            payload,
        },
    })
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
    userIds: string[],
    type: NotificationType,
    payload: NotificationPayload
): Promise<void> {
    await prisma.notification.createMany({
        data: userIds.map((userId) => ({
            userId,
            type,
            payload,
        })),
    })
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
    return await prisma.notification.findMany({
        where: {
            userId,
            readAt: null,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
    })
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
        where: {
            userId,
            readAt: null,
        },
        data: {
            readAt: new Date(),
        },
    })
}

/**
 * Notification type helpers
 */

export async function notifyMatch(userId: string, matchedUserId: string, matchedAlias: string): Promise<void> {
    await createNotification(userId, 'MATCH', {
        message: `You matched with @${matchedAlias}!`,
        matchedUserId,
        matchedAlias,
        action: 'view_match',
    })
}

export async function notifyRoomActivity(
    userId: string,
    roomId: string,
    message: string,
    action?: string
): Promise<void> {
    await createNotification(userId, 'ROOM_ACTIVITY', {
        message,
        roomId,
        action: action || 'view_room',
    })
}

export async function notifyEventUpdate(
    userId: string,
    eventId: string,
    message: string,
    action?: string
): Promise<void> {
    await createNotification(userId, 'EVENT_UPDATE', {
        message,
        eventId,
        action: action || 'view_event',
    })
}

export async function notifyTimecapsuleUnlock(
    userId: string,
    timecapsuleId: string,
    title: string
): Promise<void> {
    await createNotification(userId, 'TIME_CAPSULE', {
        message: `Timecapsule "${title}" has been unlocked!`,
        timecapsuleId,
        action: 'view_timecapsule',
    })
}

export async function notifySystem(
    userId: string,
    message: string,
    action?: string
): Promise<void> {
    await createNotification(userId, 'SYSTEM', {
        message,
        action,
    })
}

/**
 * Get notification count by type
 */
export async function getNotificationCounts(userId: string): Promise<{
    total: number
    byType: Record<string, number>
}> {
    const notifications = await prisma.notification.findMany({
        where: {
            userId,
            readAt: null,
        },
        select: {
            type: true,
        },
    })

    const byType: Record<string, number> = {}

    notifications.forEach((n) => {
        byType[n.type] = (byType[n.type] || 0) + 1
    })

    return {
        total: notifications.length,
        byType,
    }
}

/**
 * Delete old notifications (cleanup job)
 */
export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notification.deleteMany({
        where: {
            createdAt: {
                lt: cutoffDate,
            },
            readAt: {
                not: null,
            },
        },
    })

    return result.count
}

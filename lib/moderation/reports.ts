import { prisma } from '../prisma'

export enum ReportReason {
    SPAM = 'SPAM',
    HARASSMENT = 'HARASSMENT',
    INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
    FAKE_PROFILE = 'FAKE_PROFILE',
    IMPERSONATION = 'IMPERSONATION',
    SAFETY_CONCERN = 'SAFETY_CONCERN',
    OTHER = 'OTHER',
}

export interface ReportData {
    reporterId: string
    targetUserId?: string
    targetRoomId?: string
    targetMessageId?: string
    targetTimecapsuleId?: string
    reason: ReportReason
    details?: string
    evidence?: string[] // URLs to screenshots/evidence
}

/**
 * Submit a report
 */
export async function submitReport(data: ReportData): Promise<{ success: boolean; reportId?: string }> {
    try {
        // Check if user has already reported this target
        const existingReport = await prisma.$queryRaw<any[]>`
      SELECT id FROM reports 
      WHERE reporter_id = ${data.reporterId}
        AND (
          (target_user_id = ${data.targetUserId || null}) OR
          (target_room_id = ${data.targetRoomId || null}) OR
          (target_message_id = ${data.targetMessageId || null})
        )
        AND created_at > NOW() - INTERVAL '24 hours'
    `

        if (existingReport && existingReport.length > 0) {
            return { success: false }
        }

        // Create report (this would need a Report model in Prisma schema)
        // For now, we'll create a notification for admins
        await prisma.notification.create({
            data: {
                userId: 'admin', // Would need proper admin user handling
                type: 'SYSTEM',
                payload: {
                    message: `New report: ${data.reason}`,
                    reporterId: data.reporterId,
                    targetUserId: data.targetUserId,
                    reason: data.reason,
                    details: data.details,
                    action: 'review_report',
                },
            },
        })

        return { success: true }
    } catch (error) {
        console.error('[moderation] Report submission failed:', error)
        return { success: false }
    }
}

/**
 * Block a user
 */
export async function blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
        // Find existing connection
        const connection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { userId, peerId: blockedUserId },
                    { userId: blockedUserId, peerId: userId },
                ],
            },
        })

        if (connection) {
            // Update to blocked status
            await prisma.connection.update({
                where: { id: connection.id },
                data: { status: 'BLOCKED' },
            })
        } else {
            // Create blocked connection
            await prisma.connection.create({
                data: {
                    userId,
                    peerId: blockedUserId,
                    status: 'BLOCKED',
                },
            })
        }

        return true
    } catch (error) {
        console.error('[moderation] Block user failed:', error)
        return false
    }
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
        const connection = await prisma.connection.findFirst({
            where: {
                userId,
                peerId: blockedUserId,
                status: 'BLOCKED',
            },
        })

        if (connection) {
            await prisma.connection.delete({
                where: { id: connection.id },
            })
        }

        return true
    } catch (error) {
        console.error('[moderation] Unblock user failed:', error)
        return false
    }
}

/**
 * Get blocked users
 */
export async function getBlockedUsers(userId: string) {
    try {
        const blocked = await prisma.connection.findMany({
            where: {
                userId,
                status: 'BLOCKED',
            },
            include: {
                peer: {
                    select: {
                        id: true,
                        alias: true,
                        avatarUrl: true,
                    },
                },
            },
        })

        return blocked.map((b) => b.peer)
    } catch (error) {
        console.error('[moderation] Get blocked users failed:', error)
        return []
    }
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    try {
        const blocked = await prisma.connection.findFirst({
            where: {
                OR: [
                    { userId, peerId: targetUserId, status: 'BLOCKED' },
                    { userId: targetUserId, peerId: userId, status: 'BLOCKED' },
                ],
            },
        })

        return !!blocked
    } catch (error) {
        console.error('[moderation] Check blocked failed:', error)
        return false
    }
}

import 'dotenv/config'
import { Worker } from 'bullmq'
import { getRedisConnection } from '@/lib/jobs/connection'
import { QUEUES, type RoomExpiryPayload, type TimecapsuleUnlockPayload } from '@/lib/jobs/types'
import { prisma } from '@/lib/prisma'
import { batchUpdateRoomTrust } from '@/lib/connection/trust'


const redisConnection = getRedisConnection()
if (!redisConnection) {
  console.error('[worker] Redis connection unavailable. Exiting worker.')
  process.exit(1)
}

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? '5')

new Worker<RoomExpiryPayload>(
  QUEUES.roomExpiry,
  async (job) => {
    const { roomId } = job.data

    // Get all active members before closing the room
    const activeMembers = await prisma.roomMember.findMany({
      where: { roomId, leftAt: null },
      select: { userId: true },
    })

    // Close the room
    await prisma.room.updateMany({
      where: { id: roomId, active: true },
      data: { active: false },
    })

    // Get room details to calculate duration
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { createdAt: true, expiresAt: true },
    })

    // Award trust points for time spent together if room existed
    if (room) {
      const durationMs = room.expiresAt.getTime() - room.createdAt.getTime()
      const durationMinutes = Math.floor(durationMs / (1000 * 60))
      
      if (durationMinutes > 0) {
        try {
          await batchUpdateRoomTrust(roomId, durationMinutes)
        } catch (error) {
          console.error(`[worker] Failed to batch update trust for room ${roomId}:`, error)
        }
      }
    }

    // Mark all members as left
    await prisma.roomMember.updateMany({
      where: { roomId, leftAt: null },
      data: { leftAt: new Date() },
    })

    // Create notifications for all members
    if (activeMembers.length > 0) {
      await prisma.notification.createMany({
        data: activeMembers.map((member) => ({
          userId: member.userId,
          type: 'ROOM_ACTIVITY',
          payload: {
            message: 'A Now Room you were in has expired',
            roomId,
            action: 'room_expired',
          },
        })),
      })
    }

    return { closed: true, notified: activeMembers.length }
  },
  { connection: redisConnection, concurrency },
)

new Worker<TimecapsuleUnlockPayload>(
  QUEUES.timecapsuleUnlock,
  async (job) => {
    const { timecapsuleId } = job.data

    // Get the timecapsule details
    const timecapsule = await prisma.timecapsule.findUnique({
      where: { id: timecapsuleId },
      include: {
        campus: true,
        creator: true,
      },
    })

    if (!timecapsule) {
      return { unlocked: false, error: 'Timecapsule not found' }
    }

    // Update the timecapsule
    await prisma.timecapsule.update({
      where: { id: timecapsuleId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        updatedAt: new Date()
      },
    })

    // Get users who should be notified (based on audience criteria)
    let targetUsers: { id: string }[] = []

    if (timecapsule.audience === 'campus' && timecapsule.campusId) {
      // Notify all users on the same campus
      targetUsers = await prisma.user.findMany({
        where: { campusId: timecapsule.campusId },
        select: { id: true },
      })
    } else if (timecapsule.audience === 'public') {
      // For public capsules, notify users on the same campus (avoid spamming everyone)
      targetUsers = await prisma.user.findMany({
        where: { campusId: timecapsule.campusId },
        select: { id: true },
        take: 100, // Limit to prevent overwhelming notifications
      })
    }

    // Create notifications
    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map((user) => ({
          userId: user.id,
          type: 'TIME_CAPSULE',
          payload: {
            message: `A timecapsule "${timecapsule.title}" has been unlocked!`,
            timecapsuleId,
            creatorAlias: timecapsule.creator.alias,
            action: 'timecapsule_unlocked',
          },
        })),
      })
    }

    return { unlocked: true, notified: targetUsers.length }
  },
  { connection: redisConnection, concurrency },
)

process.on('SIGTERM', async () => {
  if (redisConnection) {
    await redisConnection.quit()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  if (redisConnection) {
    await redisConnection.quit()
  }
  process.exit(0)
})


import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { maskProfileData } from '@/lib/utils/privacy'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser()
    const targetId = params.id

    // If viewing own profile, redirect to main profile API or handle here
    if (targetId === user.id) {
       const self = await prisma.user.findUnique({
         where: { id: user.id },
         include: { campus: true }
       })
       return NextResponse.json(self)
    }

    // Fetch target user and current connection
    const [targetUser, connection] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetId },
        include: {
          campus: true,
          _count: {
            select: { rooms: { where: { leftAt: null } } }
          }
        }
      }),
      prisma.connection.findFirst({
        where: {
          OR: [
            { userId: user.id, peerId: targetId },
            { userId: targetId, peerId: user.id }
          ]
        }
      })
    ])

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const trustLevel = connection?.trustLevel ?? 0
    const maskedProfile = maskProfileData(targetUser, trustLevel)

    return NextResponse.json({
      ...maskedProfile,
      trustLevel,
      connectionStatus: connection?.status || null,
      stats: {
        activeRooms: targetUser._count.rooms
      }
    })
  } catch (error) {
    console.error('[profile-view] error', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

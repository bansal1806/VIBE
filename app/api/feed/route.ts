import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth'
import { computeCompatibility } from '@/lib/utils/matching'
import { formatDistance, haversineDistanceKm } from '@/lib/utils/geo'
import { SwipeDirection, SwipeTargetType } from '@prisma/client'
import { maskProfileData } from '@/lib/utils/privacy'


export const dynamic = 'force-dynamic'

type FeedResponse = {
  items: FeedItem[]
}

type FeedItem =
  | {
      type: 'user'
      id: string
      alias: string
      name: string | null
      avatarUrl: string | null
      headline: string | null
      major: string | null
      year: string | null
      bio: string | null
      compatibilityScore: number
      sharedInterests: string[]
      sharedIntents: string[]
      proximity: string | null
      lastActiveAt: string | null
      campusName: string | null
      unlockLevel: number
      stats: {
        activeRooms: number
        mutualRooms: number
      }
      isConnected: boolean
      isPendingConnection: boolean
      alreadyLiked: boolean
    }
  | {
      type: 'room'
      id: string
      name: string
      description: string | null
      location: string
      expiresAt: string
      participants: number
      typeLabel: string
      distance: string | null
      tags: string[]
      inviteCode: string | null
      campusName: string | null
      isMember: boolean
      maxCapacity: number | null
    }
  | {
      type: 'event'
      id: string
      title: string
      description: string | null
      startTime: string
      endTime: string | null
      location: string
      hostName: string | null
      category: string
      coverImage: string | null
      campusName: string | null
      distance: string | null
      rsvpCount: number
      isGoing: boolean
      isInterested: boolean
    }

export async function GET(): Promise<NextResponse<FeedResponse | { error: string }>> {
  try {
    const user = await requireUser()

    const [
      enrichedUser,
      candidateUsers,
      activeRooms,
      upcomingEvents,
      swipes,
      connections,
      roomMemberships,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        include: { campus: true, rooms: { where: { leftAt: null } } },
      }),
      prisma.user.findMany({
        where: {
          id: { not: user.id },
          discoverable: true,
          campusId: user.campusId ?? undefined,
        },
        include: {
          rooms: {
            where: { leftAt: null },
            select: { roomId: true, room: { select: { campusId: true } } },
          },
        },
        orderBy: [{ lastActiveAt: 'desc' }, { createdAt: 'desc' }],
        take: 24,
      }),
      prisma.room.findMany({
        where: {
          active: true,
          OR: [{ campusId: user.campusId ?? undefined }, { campusId: null }],
        },
        include: {
          campus: true,
          members: {
            where: { leftAt: null },
            select: { userId: true },
          },
        },
        orderBy: [{ expiresAt: 'asc' }],
        take: 12,
      }),
      prisma.event.findMany({
        where: {
          startTime: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 12),
          },
          OR: [{ campusId: user.campusId ?? undefined }, { campusId: null }],
        },
        include: {
          campus: true,
          attendees: true,
        },
        orderBy: [{ startTime: 'asc' }],
        take: 12,
      }),
      prisma.swipe.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
          },
        },
      }),
      prisma.connection.findMany({
        where: {
          OR: [{ userId: user.id }, { peerId: user.id }],
        },
      }),
      prisma.roomMember.findMany({
        where: {
          userId: user.id,
          leftAt: null,
        },
        select: { roomId: true },
      }),
    ])

    if (!enrichedUser) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const mutualRooms = new Set(roomMemberships.map((r) => r.roomId))

    const feedUsers: FeedItem[] = candidateUsers.map((candidate) => {
      const compatibility = computeCompatibility(enrichedUser, candidate)
      const connection = connections.find(
        (c) => (c.userId === user.id && c.peerId === candidate.id) || (c.peerId === user.id && c.userId === candidate.id),
      )
      const swipe = swipes.find(
        (s) =>
          s.targetType === SwipeTargetType.USER &&
          s.targetId === candidate.id &&
          s.direction === SwipeDirection.LIKE,
      )
      const candidateRooms = candidate.rooms.map((r) => r.roomId)
      const sharedRooms = candidateRooms.filter((roomId) => mutualRooms.has(roomId)).length

      const trustLevel = connection?.trustLevel ?? 0
      const maskedCandidate = maskProfileData(candidate, trustLevel)

      return {
        type: 'user',
        id: candidate.id,
        alias: candidate.alias,
        name: maskedCandidate.name,
        avatarUrl: candidate.avatarUrl,
        headline: candidate.headline,
        major: maskedCandidate.major,
        year: maskedCandidate.year,
        bio: maskedCandidate.bio,
        compatibilityScore: compatibility.score,
        sharedInterests: (maskedCandidate.interests || []).slice(0, 6),
        sharedIntents: compatibility.sharedIntents.slice(0, 4),
        proximity: formatDistance(compatibility.proximityKm ?? undefined),
        lastActiveAt: candidate.lastActiveAt?.toISOString() ?? candidate.updatedAt.toISOString(),
        campusName: candidate.campusId ? enrichedUser.campus?.name ?? null : 'Open Network',
        unlockLevel: connection?.status === 'CONNECTED' ? 4 : 0,
        stats: {
          activeRooms: candidate.rooms.length,
          mutualRooms: sharedRooms,
        },
        isConnected: connection?.status === 'CONNECTED',
        isPendingConnection: connection?.status === 'PENDING',
        alreadyLiked: Boolean(swipe),
      }
    })

    const feedRooms: FeedItem[] = activeRooms.map((room) => {
      const isMember = room.members.some((member) => member.userId === user.id)
      const distance =
        enrichedUser.latitude != null && enrichedUser.longitude != null
          ? formatDistance(
              haversineDistanceKm(
                { latitude: enrichedUser.latitude, longitude: enrichedUser.longitude },
                { latitude: room.latitude, longitude: room.longitude },
              ),
            )
          : null

      return {
        type: 'room',
        id: room.id,
        name: room.name,
        description: room.description,
        location: room.location,
        expiresAt: room.expiresAt.toISOString(),
        participants: room.members.length,
        typeLabel: room.type,
        distance,
        tags: room.tags.slice(0, 6),
        inviteCode: room.inviteCode,
        campusName: room.campus?.name ?? 'Open Campus',
        isMember,
        maxCapacity: room.maxCapacity,
      }
    })

    const feedEvents: FeedItem[] = upcomingEvents.map((event) => {
      const attendance = event.attendees.find((attendee) => attendee.userId === user.id)
      const distance =
        enrichedUser.latitude != null &&
        enrichedUser.longitude != null &&
        event.latitude != null &&
        event.longitude != null
          ? formatDistance(
              haversineDistanceKm(
                { latitude: enrichedUser.latitude, longitude: enrichedUser.longitude },
                { latitude: event.latitude, longitude: event.longitude },
              ),
            )
          : null

      return {
        type: 'event',
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString() ?? null,
        location: event.location,
        hostName: event.hostName,
        category: event.category,
        coverImage: event.coverImage,
        campusName: event.campus?.name ?? 'Open Campus',
        distance,
        rsvpCount: event.attendees.filter((att) => att.status === 'GOING').length || event.rsvpCount,
        isGoing: attendance?.status === 'GOING',
        isInterested: attendance?.status === 'INTERESTED',
      }
    })

    const interleaved = interleaveFeedItems(feedUsers, feedRooms, feedEvents)

    return NextResponse.json({ items: interleaved })
  } catch (error) {
    console.error('[feed] failed to generate feed', error)
    return NextResponse.json({ error: 'Failed to build feed' }, { status: 500 })
  }
}

function interleaveFeedItems(...lists: FeedItem[][]) {
  const maxLength = Math.max(...lists.map((list) => list.length))
  const result: FeedItem[] = []

  for (let i = 0; i < maxLength; i++) {
    for (const list of lists) {
      if (list[i]) {
        result.push(list[i])
      }
    }
  }

  return result
}

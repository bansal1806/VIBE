import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../supabase/client'

export interface PresenceUser {
    userId: string
    alias: string
    avatarUrl?: string
    status: 'online' | 'away' | 'offline'
    lastSeen: string
}

const presenceChannels = new Map<string, RealtimeChannel>()

/**
 * Subscribe to room presence
 */
export function subscribeToRoomPresence(
    roomId: string,
    userId: string,
    userInfo: Pick<PresenceUser, 'alias' | 'avatarUrl'>,
    callbacks: {
        onJoin?: (user: PresenceUser) => void
        onLeave?: (user: PresenceUser) => void
        onSync?: (users: PresenceUser[]) => void
    }
): () => void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `room:${roomId}:presence`

    let channel = presenceChannels.get(channelName)

    if (!channel) {
        channel = supabase.channel(channelName, {
            config: {
                presence: {
                    key: userId,
                },
            },
        })
        presenceChannels.set(channelName, channel)
    }

    // Track presence
    channel
        .on('presence', { event: 'sync' }, () => {
            const state = channel!.presenceState<PresenceUser>()
            const users = extractPresenceUsers(state)
            callbacks.onSync?.(users)
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
            newPresences.forEach((presence) => {
                callbacks.onJoin?.(presence as unknown as PresenceUser)
            })
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            leftPresences.forEach((presence) => {
                callbacks.onLeave?.(presence as unknown as PresenceUser)
            })
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel!.track({
                    userId,
                    alias: userInfo.alias,
                    avatarUrl: userInfo.avatarUrl,
                    status: 'online',
                    lastSeen: new Date().toISOString(),
                } as PresenceUser)
            }
        })

    // Cleanup function
    return () => {
        channel?.untrack()
        channel?.unsubscribe()
        presenceChannels.delete(channelName)
    }
}

/**
 * Subscribe to user online status
 */
export function subscribeToUserPresence(
    targetUserId: string,
    callback: (isOnline: boolean, lastSeen?: string) => void
): () => void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `user:${targetUserId}:presence`

    const channel = supabase.channel(channelName, {
        config: {
            presence: {
                key: targetUserId,
            },
        },
    })

    channel
        .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState<PresenceUser>()
            const users = extractPresenceUsers(state)
            const user = users.find((u) => u.userId === targetUserId)

            if (user) {
                callback(user.status === 'online', user.lastSeen)
            } else {
                callback(false)
            }
        })
        .subscribe()

    return () => {
        channel.unsubscribe()
    }
}

/**
 * Broadcast typing indicator
 */
export function broadcastTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean
): void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `conversation:${conversationId}:typing`

    const channel = supabase.channel(channelName)

    channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
            userId,
            isTyping,
            timestamp: new Date().toISOString(),
        },
    })
}

/**
 * Subscribe to typing indicators
 */
export function subscribeToTyping(
    conversationId: string,
    currentUserId: string,
    callback: (userId: string, isTyping: boolean) => void
): () => void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `conversation:${conversationId}:typing`

    const channel = supabase.channel(channelName)

    channel
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
            // Don't show own typing indicator
            if (payload.userId !== currentUserId) {
                callback(payload.userId, payload.isTyping)
            }
        })
        .subscribe()

    return () => {
        channel.unsubscribe()
    }
}

/**
 * Update user status
 */
export async function updateUserStatus(
    userId: string,
    status: 'online' | 'away' | 'offline'
): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    const channelName = `user:${userId}:presence`

    const channel = supabase.channel(channelName)

    await channel.track({
        userId,
        status,
        lastSeen: new Date().toISOString(),
    })
}

/**
 * Helper to extract presence users from state
 */
function extractPresenceUsers(state: RealtimePresenceState<PresenceUser>): PresenceUser[] {
    return Object.values(state)
        .flat()
        .map(item => item as PresenceUser)
}

/**
 * Get current room members count
 */
export function getRoomMembersCount(roomId: string): number {
    const channelName = `room:${roomId}:presence`
    const channel = presenceChannels.get(channelName)

    if (!channel) return 0

    const state = channel.presenceState<PresenceUser>()
    return extractPresenceUsers(state).length
}

/**
 * Get current room members
 */
export function getRoomMembers(roomId: string): PresenceUser[] {
    const channelName = `room:${roomId}:presence`
    const channel = presenceChannels.get(channelName)

    if (!channel) return []

    const state = channel.presenceState<PresenceUser>()
    return extractPresenceUsers(state)
}

import { getSupabaseBrowserClient } from '../supabase/client'

const typingTimeouts = new Map<string, NodeJS.Timeout>()

/**
 * Send typing indicator
 */
export function sendTyping(conversationId: string, userId: string): void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `conversation:${conversationId}:typing`

    const channel = supabase.channel(channelName)

    channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
            userId,
            isTyping: true,
            timestamp: new Date().toISOString(),
        },
    })

    // Auto-stop typing after 3 seconds of inactivity
    const key = `${conversationId}:${userId}`
    if (typingTimeouts.has(key)) {
        clearTimeout(typingTimeouts.get(key)!)
    }

    typingTimeouts.set(
        key,
        setTimeout(() => {
            stopTyping(conversationId, userId)
            typingTimeouts.delete(key)
        }, 3000)
    )
}

/**
 * Stop typing indicator
 */
export function stopTyping(conversationId: string, userId: string): void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `conversation:${conversationId}:typing`

    const channel = supabase.channel(channelName)

    channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
            userId,
            isTyping: false,
            timestamp: new Date().toISOString(),
        },
    })

    const key = `${conversationId}:${userId}`
    if (typingTimeouts.has(key)) {
        clearTimeout(typingTimeouts.get(key)!)
        typingTimeouts.delete(key)
    }
}

/**
 * Subscribe to typing events
 */
export function subscribeToTypingEvents(
    conversationId: string,
    currentUserId: string,
    onTyping: (users: Set<string>) => void
): () => void {
    const supabase = getSupabaseBrowserClient()
    const channelName = `conversation:${conversationId}:typing`

    const typingUsers = new Set<string>()
    const userTimeouts = new Map<string, NodeJS.Timeout>()

    const channel = supabase.channel(channelName)

    channel
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
            const { userId, isTyping } = payload

            // Ignore own typing
            if (userId === currentUserId) return

            if (isTyping) {
                typingUsers.add(userId)

                // Clear existing timeout
                if (userTimeouts.has(userId)) {
                    clearTimeout(userTimeouts.get(userId)!)
                }

                // Auto-remove after 4 seconds
                const timeout = setTimeout(() => {
                    typingUsers.delete(userId)
                    userTimeouts.delete(userId)
                    onTyping(new Set(typingUsers))
                }, 4000)

                userTimeouts.set(userId, timeout)
            } else {
                typingUsers.delete(userId)

                if (userTimeouts.has(userId)) {
                    clearTimeout(userTimeouts.get(userId)!)
                    userTimeouts.delete(userId)
                }
            }

            onTyping(new Set(typingUsers))
        })
        .subscribe()

    // Cleanup function
    return () => {
        channel.unsubscribe()
        userTimeouts.forEach((timeout) => clearTimeout(timeout))
        userTimeouts.clear()
        typingUsers.clear()
    }
}

/**
 * Debounced typing handler for input fields
 */
export function createTypingHandler(
    conversationId: string,
    userId: string
): {
    handleTyping: () => void
    handleStop: () => void
    cleanup: () => void
} {
    let isTyping = false
    let timeout: NodeJS.Timeout | null = null

    return {
        handleTyping: () => {
            if (!isTyping) {
                sendTyping(conversationId, userId)
                isTyping = true
            }

            // Reset timeout
            if (timeout) {
                clearTimeout(timeout)
            }

            timeout = setTimeout(() => {
                stopTyping(conversationId, userId)
                isTyping = false
                timeout = null
            }, 2000)
        },

        handleStop: () => {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            if (isTyping) {
                stopTyping(conversationId, userId)
                isTyping = false
            }
        },

        cleanup: () => {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            if (isTyping) {
                stopTyping(conversationId, userId)
                isTyping = false
            }
        },
    }
}

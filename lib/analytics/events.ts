/**
 * Analytics event tracking utilities
 */

export enum AnalyticsEvent {
    // User events
    USER_SIGNUP = 'user_signup',
    USER_LOGIN = 'user_login',
    PROFILE_COMPLETED = 'profile_completed',
    PROFILE_UPDATED = 'profile_updated',

    // Discovery events
    SWIPE_LIKE = 'swipe_like',
    SWIPE_PASS = 'swipe_pass',
    MATCH_CREATED = 'match_created',

    // Room events
    ROOM_CREATED = 'room_created',
    ROOM_JOINED = 'room_joined',
    ROOM_LEFT = 'room_left',
    ROOM_MESSAGE_SENT = 'room_message_sent',

    // Chat events
    MESSAGE_SENT = 'message_sent',
    CONVERSATION_STARTED = 'conversation_started',

    // Event events
    EVENT_VIEWED = 'event_viewed',
    EVENT_RSVP = 'event_rsvp',

    // Timecapsule events
    TIMECAPSULE_CREATED = 'timecapsule_created',
    TIMECAPSULE_VIEWED = 'timecapsule_viewed',

    // Engagement
    APP_OPENED = 'app_opened',
    SESSION_START = 'session_start',
    SESSION_END = 'session_end',
}

export interface AnalyticsEventData {
    event: AnalyticsEvent
    userId?: string
    timestamp: number
    properties?: Record<string, any>
}

/**
 * Track an analytics event
 */
export function trackEvent(
    event: AnalyticsEvent,
    userId?: string,
    properties?: Record<string, any>
): void {
    const eventData: AnalyticsEventData = {
        event,
        userId,
        timestamp: Date.now(),
        properties,
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', eventData)
    }

    // Send to analytics service (would integrate with Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined') {
        // Store in localStorage for now
        const events = JSON.parse(localStorage.getItem('vibe_analytics') || '[]')
        events.push(eventData)

        // Keep only last 100 events
        if (events.length > 100) {
            events.shift()
        }

        localStorage.setItem('vibe_analytics', JSON.stringify(events))
    }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, userId?: string): void {
    trackEvent(AnalyticsEvent.APP_OPENED, userId, {
        page: pageName,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    })
}

/**
 * Track user action
 */
export function trackUserAction(
    action: string,
    userId?: string,
    metadata?: Record<string, any>
): void {
    trackEvent(action as AnalyticsEvent, userId, metadata)
}

/**
 * Get analytics events from localStorage
 */
export function getStoredEvents(): AnalyticsEventData[] {
    if (typeof window === 'undefined') return []

    try {
        return JSON.parse(localStorage.getItem('vibe_analytics') || '[]')
    } catch {
        return []
    }
}

/**
 * Clear stored analytics
 */
export function clearAnalytics(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('vibe_analytics')
    }
}

/**
 * Calculate basic metrics from events
 */
export function calculateMetrics(events: AnalyticsEventData[]): {
    totalEvents: number
    uniqueUsers: number
    eventCounts: Record<string, number>
    userActivity: Record<string, number>
} {
    const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId)).size
    const eventCounts: Record<string, number> = {}
    const userActivity: Record<string, number> = {}

    events.forEach((event) => {
        // Count by event type
        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1

        // Count by user
        if (event.userId) {
            userActivity[event.userId] = (userActivity[event.userId] || 0) + 1
        }
    })

    return {
        totalEvents: events.length,
        uniqueUsers,
        eventCounts,
        userActivity,
    }
}

'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistance } from 'date-fns'

interface Notification {
    id: string
    type: string
    payload: {
        message: string
        action?: string
        [key: string]: any
    }
    createdAt: string
    readAt: string | null
}

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        fetchNotificationCounts()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotificationCounts, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    async function fetchNotificationCounts() {
        try {
            const response = await fetch('/api/notifications?counts=true')
            const data = await response.json()
            if (data.success) {
                setUnreadCount(data.data.total)
            }
        } catch (error) {
            console.error('[notifications] Failed to fetch counts:', error)
        }
    }

    async function fetchNotifications() {
        setIsLoading(true)
        try {
            const response = await fetch('/api/notifications')
            const data = await response.json()
            if (data.success) {
                setNotifications(data.data)
            }
        } catch (error) {
            console.error('[notifications] Failed to fetch:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function markAsRead(notificationId?: string) {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationId,
                    markAll: !notificationId,
                }),
            })

            if (notificationId) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n))
                )
                setUnreadCount((prev) => Math.max(0, prev - 1))
            } else {
                setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })))
                setUnreadCount(0)
            }
        } catch (error) {
            console.error('[notifications] Failed to mark as read:', error)
        }
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case 'MATCH':
                return '💜'
            case 'ROOM_ACTIVITY':
                return '🏠'
            case 'EVENT_UPDATE':
                return '📅'
            case 'TIME_CAPSULE':
                return '⏰'
            case 'SYSTEM':
                return '🔔'
            default:
                return '📬'
        }
    }

    return (
        <>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative rounded-full p-2 text-white transition hover:bg-white/10"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-xs font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 p-4">
                                <h2 className="text-xl font-bold text-white">Notifications</h2>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAsRead()}
                                            className="text-sm text-cyan-400 transition hover:text-cyan-300"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="h-[calc(100%-4rem)] overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                                        <div className="text-6xl opacity-50">🔕</div>
                                        <p className="text-white/60">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`group relative p-4 transition hover:bg-white/5 ${!notification.readAt ? 'bg-white/5' : ''
                                                    }`}
                                            >
                                                {/* Unread indicator */}
                                                {!notification.readAt && (
                                                    <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400" />
                                                )}

                                                <div className="flex gap-3 pl-4">
                                                    {/* Icon */}
                                                    <div className="shrink-0 text-2xl">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <p className="text-sm text-white">{notification.payload.message}</p>
                                                        <p className="mt-1 text-xs text-white/50">
                                                            {formatDistance(new Date(notification.createdAt), new Date(), {
                                                                addSuffix: true,
                                                            })}
                                                        </p>
                                                    </div>

                                                    {/* Mark read button */}
                                                    {!notification.readAt && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="shrink-0 rounded-full p-1.5 text-cyan-400 opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

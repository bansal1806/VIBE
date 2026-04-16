'use client'

import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistance } from 'date-fns'
import BottomNav from '@/components/navigation/BottomNav'

interface Conversation {
    id: string
    type: 'DIRECT' | 'ROOM'
    participantAlias?: string
    participantAvatar?: string
    roomName?: string
    lastMessage?: string
    lastMessageAt?: Date
    unreadCount: number
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadConversations()
    }, [])

    async function loadConversations() {
        // Mock data - replace with actual API call
        setConversations([
            {
                id: '1',
                type: 'DIRECT',
                participantAlias: '@alexbuilds',
                participantAvatar: undefined,
                lastMessage: 'Hey! Want to grab coffee?',
                lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
                unreadCount: 2,
            },
            {
                id: '2',
                type: 'ROOM',
                roomName: 'Late Night Study',
                lastMessage: 'Anyone still up?',
                lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
                unreadCount: 0,
            },
        ])
    }

    const filteredConversations = conversations.filter((conv) => {
        const name = conv.type === 'DIRECT' ? conv.participantAlias : conv.roomName
        return name?.toLowerCase().includes(searchQuery.toLowerCase())
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Messages</h1>
                    <button className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-3 shadow-lg transition hover:shadow-cyan-500/50">
                        <Plus size={24} className="text-white" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="divide-y divide-white/10">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="text-6xl opacity-50">💬</div>
                        <h3 className="text-xl font-bold text-white">No conversations yet</h3>
                        <p className="text-white/60">Start connecting with people!</p>
                    </div>
                ) : (
                    filteredConversations.map((conv, index) => (
                        <motion.div
                            key={conv.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group flex items-center gap-4 p-4 transition hover:bg-white/5"
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-xl font-bold text-white">
                                    {conv.type === 'DIRECT'
                                        ? conv.participantAlias?.[1].toUpperCase()
                                        : '🏠'}
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden">
                                <div className="mb-1 flex items-baseline justify-between">
                                    <h3 className="font-semibold text-white">
                                        {conv.type === 'DIRECT' ? conv.participantAlias : conv.roomName}
                                    </h3>
                                    {conv.lastMessageAt && (
                                        <span className="text-xs text-white/40">
                                            {formatDistance(conv.lastMessageAt, new Date(), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-sm text-white/60">{conv.lastMessage || 'No messages yet'}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    )
}

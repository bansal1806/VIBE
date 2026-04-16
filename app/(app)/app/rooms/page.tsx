'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Users, Plus, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import BottomNav from '@/components/navigation/BottomNav'
import NowRoomCard from '@/components/NowRoomCard'

export default function RoomsPage() {
    const [rooms, setRooms] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'nearby' | 'trending'>('all')
    const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null)

    useEffect(() => {
        loadRooms()
    }, [filter])

    async function loadRooms() {
        // Mock data - replace with actual API call
        setRooms([
            {
                id: '1',
                name: 'Late Night Study',
                description: 'Cramming for CS finals',
                type: 'STUDY',
                location: 'Library 3rd Floor',
                distance: 0.1,
                memberCount: 8,
                expiresIn: '2h 15m',
            },
            {
                id: '2',
                name: 'Startup Ideas',
                description: 'Brainstorming the next big thing',
                type: 'SOCIAL',
                location: 'Coffee Shop',
                distance: 0.3,
                memberCount: 5,
                expiresIn: '1h 30m',
            },
        ])
    }

    async function handleJoinRoom(roomId: string) {
        setJoiningRoomId(roomId)
        try {
            // TODO: Implement actual room join API call
            await new Promise(resolve => setTimeout(resolve, 500))
            console.log('Joined room:', roomId)
        } catch (error) {
            console.error('Failed to join room:', error)
        } finally {
            setJoiningRoomId(null)
        }
    }

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Now Rooms</h1>
                        <p className="text-sm text-white/60">Discover what's happening nearby</p>
                    </div>
                    <button className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-3 shadow-lg transition hover:shadow-cyan-500/50">
                        <Plus size={24} className="text-white" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {(['all', 'nearby', 'trending'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === f
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                }`}
                        >
                            {f === 'all' && 'All'}
                            {f === 'nearby' && (
                                <>
                                    <MapPin size={14} className="mb-0.5 inline" /> Nearby
                                </>
                            )}
                            {f === 'trending' && (
                                <>
                                    <TrendingUp size={14} className="mb-0.5 inline" /> Trending
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rooms List */}
            <div className="space-y-4 p-4">
                {filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="text-6xl opacity-50">🏠</div>
                        <h3 className="text-xl font-bold text-white">No rooms found</h3>
                        <p className="text-white/60">Be the first to create one!</p>
                    </div>
                ) : (
                    filteredRooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <NowRoomCard
                                room={room}
                                isJoining={joiningRoomId === room.id}
                                onJoin={() => handleJoinRoom(room.id)}
                            />
                        </motion.div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    )
}

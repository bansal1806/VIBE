'use client'

import { useState, useEffect } from 'react'
import { Clock, Lock, Unlock, Plus, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import BottomNav from '@/components/navigation/BottomNav'

interface Timecapsule {
    id: string
    title: string
    description?: string
    creatorAlias: string
    unlockAt: Date
    isUnlocked: boolean
    audience: 'campus' | 'public' | 'friends'
    tags: string[]
    coverImage?: string
}

export default function TimecapsulesPage() {
    const [capsules, setCapsules] = useState<Timecapsule[]>([])
    const [filter, setFilter] = useState<'all' | 'locked' | 'unlocked'>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        loadTimecapsules()
    }, [filter])

    async function loadTimecapsules() {
        // Mock data - replace with actual API call
        setCapsules([
            {
                id: '1',
                title: 'CS 101 Survival Guide',
                description: 'Tips and tricks for incoming freshmen',
                creatorAlias: '@senior2024',
                unlockAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                isUnlocked: false,
                audience: 'campus',
                tags: ['cs', 'advice', 'freshman'],
            },
            {
                id: '2',
                title: 'Best Memories of 2024',
                description: 'A collection of our favorite moments',
                creatorAlias: '@classof2024',
                unlockAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                isUnlocked: true,
                audience: 'public',
                tags: ['memories', 'nostalgia'],
            },
        ])
    }

    const filteredCapsules = capsules.filter((capsule) => {
        if (filter === 'locked') return !capsule.isUnlocked
        if (filter === 'unlocked') return capsule.isUnlocked
        return true
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Timecapsules</h1>
                        <p className="text-sm text-white/60">Messages from the past & future</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 p-3 shadow-lg transition hover:shadow-cyan-500/50"
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {(['all', 'locked', 'unlocked'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${filter === f
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                }`}
                        >
                            {f === 'locked' && <Lock size={14} />}
                            {f === 'unlocked' && <Unlock size={14} />}
                            {f === 'all' && <Filter size={14} />}
                            <span className="capitalize">{f}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Timecapsules Grid */}
            <div className="grid gap-4 p-4 sm:grid-cols-2">
                {filteredCapsules.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="text-6xl opacity-50">⏰</div>
                        <h3 className="text-xl font-bold text-white">No timecapsules found</h3>
                        <p className="text-white/60">Create one to share with future students!</p>
                    </div>
                ) : (
                    filteredCapsules.map((capsule, index) => (
                        <motion.div
                            key={capsule.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative overflow-hidden rounded-2xl shadow-xl transition hover:scale-105 ${capsule.isUnlocked
                                    ? 'bg-gradient-to-br from-cyan-900/50 to-purple-900/50'
                                    : 'bg-gradient-to-br from-gray-900/50 to-black/50'
                                }`}
                        >
                            {/* Lock Indicator */}
                            <div className="absolute right-4 top-4 z-10">
                                {capsule.isUnlocked ? (
                                    <div className="rounded-full bg-cyan-500/20 p-2 backdrop-blur-sm">
                                        <Unlock size={20} className="text-cyan-400" />
                                    </div>
                                ) : (
                                    <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                                        <Lock size={20} className="text-white/60" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="mb-2 text-xl font-bold text-white">{capsule.title}</h3>

                                {capsule.isUnlocked ? (
                                    <p className="mb-4 text-sm text-white/80">{capsule.description}</p>
                                ) : (
                                    <p className="mb-4 text-sm text-white/50">🔒 Locked until unlocked</p>
                                )}

                                {/* Creator */}
                                <p className="mb-3 text-sm text-cyan-400">{capsule.creatorAlias}</p>

                                {/* Tags */}
                                {capsule.tags.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {capsule.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-md bg-white/10 px-2 py-1 text-xs text-white/70"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Unlock Time */}
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={16} className={capsule.isUnlocked ? 'text-cyan-400' : 'text-white/40'} />
                                    <span className={capsule.isUnlocked ? 'text-cyan-400' : 'text-white/60'}>
                                        {capsule.isUnlocked ? (
                                            <>Unlocked {formatDistanceToNow(capsule.unlockAt, { addSuffix: true })}</>
                                        ) : (
                                            <>Unlocks on {format(capsule.unlockAt, 'MMM dd, yyyy')}</>
                                        )}
                                    </span>
                                </div>

                                {/* View Button (only for unlocked) */}
                                {capsule.isUnlocked && (
                                    <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 py-2.5 font-semibold text-white shadow-lg transition hover:shadow-cyan-500/50">
                                        View Timecapsule
                                    </button>
                                )}
                            </div>

                            {/* Locked Overlay */}
                            {!capsule.isUnlocked && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition group-hover:bg-black/30" />
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    )
}

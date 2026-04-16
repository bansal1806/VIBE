'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MapPin, Clock, Heart, X, MessageCircle } from 'lucide-react'
import { getNearbyItems } from '@/lib/utils/geo'
import { getLocationWithCache } from '@/lib/location/permissions'
import BottomNav from '@/components/navigation/BottomNav'

export default function DiscoverPage() {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [cards, setCards] = useState<any[]>([])

    useEffect(() => {
        loadLocation()
        loadCards()
    }, [])

    async function loadLocation() {
        try {
            const location = await getLocationWithCache()
            setUserLocation(location)
        } catch (error) {
            console.error('Location error:', error)
        }
    }

    async function loadCards() {
        // Mock data - replace with actual API call
        setCards([
            {
                id: '1',
                type: 'user',
                name: 'Alex Chen',
                alias: '@alexbuilds',
                bio: 'CS major building cool stuff',
                interests: ['React', 'AI', 'Startups'],
                distance: 0.5,
            },
            {
                id: '2',
                type: 'room',
                name: 'Study Session',
                description: 'Cramming for finals together',
                members: 4,
                location: 'Library',
                distance: 0.2,
            },
        ])
    }

    function handleSwipe(direction: 'like' | 'pass') {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const currentCard = cards[currentIndex]

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-20">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <h1 className="text-2xl font-bold text-white">Discover</h1>
                <p className="text-sm text-white/60">Swipe to connect</p>
            </div>

            {/* Card Stack */}
            <div className="flex min-h-[calc(100vh-180px)] items-center justify-center p-4">
                <div className="relative h-[600px] w-full max-w-sm">
                    <AnimatePresence>
                        {currentCard && (
                            <motion.div
                                key={currentCard.id}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black shadow-2xl"
                            >
                                {/* Card Content */}
                                <div className="flex h-full flex-col p-6">
                                    {/* Type Badge */}
                                    <div className="mb-4">
                                        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-400">
                                            {currentCard.type === 'user' ? 'Person' : 'Now Room'}
                                        </span>
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1">
                                        <h2 className="mb-2 text-3xl font-bold text-white">{currentCard.name}</h2>

                                        {currentCard.type === 'user' ? (
                                            <>
                                                <p className="mb-4 text-lg text-cyan-400">{currentCard.alias}</p>
                                                <p className="mb-6 text-white/80">{currentCard.bio}</p>

                                                {/* Interests */}
                                                <div className="mb-4">
                                                    <p className="mb-2 text-sm font-semibold text-white/60">Interests</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentCard.interests?.map((interest: string) => (
                                                            <span
                                                                key={interest}
                                                                className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white"
                                                            >
                                                                {interest}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="mb-6 text-white/80">{currentCard.description}</p>

                                                {/* Room Info */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-white/80">
                                                        <Users size={18} />
                                                        <span>{currentCard.members} people</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white/80">
                                                        <MapPin size={18} />
                                                        <span>{currentCard.location}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Distance */}
                                    {currentCard.distance !== undefined && (
                                        <div className="mb-6 flex items-center gap-2 text-cyan-400">
                                            <MapPin size={16} />
                                            <span className="text-sm">{currentCard.distance} km away</span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleSwipe('pass')}
                                            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 transition hover:border-red-500 hover:bg-red-500/20"
                                        >
                                            <X size={28} className="text-red-400" />
                                        </button>

                                        <button
                                            onClick={() => handleSwipe('like')}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 py-4 font-semibold text-white shadow-lg transition hover:shadow-cyan-500/50"
                                        >
                                            <Heart size={20} />
                                            <span>Interested</span>
                                        </button>

                                        {currentCard.type === 'user' && (
                                            <button className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 transition hover:border-cyan-500 hover:bg-cyan-500/20">
                                                <MessageCircle size={24} className="text-cyan-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* No more cards */}
                    {currentIndex >= cards.length && (
                        <div className="flex h-full items-center justify-center rounded-3xl bg-white/5 p-8 text-center backdrop-blur-xl">
                            <div>
                                <div className="mb-4 text-6xl opacity-50">🎉</div>
                                <h3 className="mb-2 text-xl font-bold text-white">All caught up!</h3>
                                <p className="text-white/60">Check back later for more connections</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}

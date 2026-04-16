'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Heart, Share2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import BottomNav from '@/components/navigation/BottomNav'

interface Event {
    id: string
    title: string
    description: string
    category: 'SOCIAL' | 'ACADEMIC' | 'CAREER' | 'WELLNESS' | 'SPORTS' | 'OTHER'
    location: string
    startTime: Date
    endTime?: Date
    coverImage?: string
    hostName?: string
    rsvpCount: number
    userRsvp?: 'GOING' | 'INTERESTED' | null
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [filter, setFilter] = useState<'upcoming' | 'today' | 'this-week'>('upcoming')

    useEffect(() => {
        loadEvents()
    }, [filter])

    async function loadEvents() {
        // Mock data - replace with actual API call
        setEvents([
            {
                id: '1',
                title: 'Tech Talk: AI in 2025',
                description: 'Join us for an inspiring discussion about the future of AI',
                category: 'ACADEMIC',
                location: 'Auditorium Hall',
                startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                hostName: 'CS Department',
                rsvpCount: 45,
                userRsvp: 'INTERESTED',
            },
            {
                id: '2',
                title: 'Campus Mixer',
                description: 'Meet new people and make connections',
                category: 'SOCIAL',
                location: 'Student Center',
                startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                hostName: 'Student Activities',
                rsvpCount: 78,
            },
        ])
    }

    async function handleRsvp(eventId: string, status: 'GOING' | 'INTERESTED') {
        // Update local state optimistically
        setEvents((prev) =>
            prev.map((event) =>
                event.id === eventId
                    ? {
                        ...event,
                        userRsvp: event.userRsvp === status ? null : status,
                        rsvpCount: event.userRsvp === status ? event.rsvpCount - 1 : event.rsvpCount + 1,
                    }
                    : event
            )
        )

        // TODO: Call API
    }

    const categoryColors: Record<Event['category'], string> = {
        SOCIAL: 'from-pink-500 to-purple-500',
        ACADEMIC: 'from-blue-500 to-cyan-500',
        CAREER: 'from-green-500 to-emerald-500',
        WELLNESS: 'from-teal-500 to-blue-500',
        SPORTS: 'from-orange-500 to-red-500',
        OTHER: 'from-gray-500 to-slate-500',
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <h1 className="mb-1 text-2xl font-bold text-white">Events</h1>
                <p className="text-sm text-white/60">Discover campus happenings</p>

                {/* Filters */}
                <div className="mt-4 flex gap-2">
                    {(['upcoming', 'today', 'this-week'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === f
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                }`}
                        >
                            {f === 'upcoming' && 'Upcoming'}
                            {f === 'today' && 'Today'}
                            {f === 'this-week' && 'This Week'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-4 p-4">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="text-6xl opacity-50">📅</div>
                        <h3 className="text-xl font-bold text-white">No events found</h3>
                        <p className="text-white/60">Check back later for upcoming events</p>
                    </div>
                ) : (
                    events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-xl"
                        >
                            {/* Category Badge */}
                            <div className={`bg-gradient-to-r ${categoryColors[event.category]} p-3`}>
                                <span className="text-sm font-semibold text-white">{event.category}</span>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="mb-2 text-xl font-bold text-white">{event.title}</h3>
                                <p className="mb-4 text-sm text-white/70">{event.description}</p>

                                {/* Event Details */}
                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <Calendar size={16} />
                                        <span>{format(event.startTime, 'MMM dd, yyyy • h:mm a')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <MapPin size={16} />
                                        <span>{event.location}</span>
                                    </div>
                                    {event.hostName && (
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <Users size={16} />
                                            <span>Hosted by {event.hostName}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-cyan-400">
                                        <Heart size={16} />
                                        <span>{event.rsvpCount} interested</span>
                                    </div>
                                </div>

                                {/* RSVP Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRsvp(event.id, 'GOING')}
                                        className={`flex-1 rounded-xl py-2.5 font-semibold transition ${event.userRsvp === 'GOING'
                                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        Going
                                    </button>
                                    <button
                                        onClick={() => handleRsvp(event.id, 'INTERESTED')}
                                        className={`flex-1 rounded-xl py-2.5 font-semibold transition ${event.userRsvp === 'INTERESTED'
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        Interested
                                    </button>
                                    <button className="rounded-xl bg-white/10 px-4 py-2.5 text-white transition hover:bg-white/20">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    )
}

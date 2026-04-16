'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useFeed } from '@/lib/hooks/useFeed'
import { AR_RADAR } from '@/lib/constants'

interface RadarUser {
  id: string
  alias: string
  avatarUrl: string | null
  headline: string | null
  bio: string | null
  sharedInterests: string[]
  sharedIntents: string[]
  unlockLevel: number
  distance: string
  x: number // 0-100 percentage
  y: number // 0-100 percentage
}

interface ARRadarProps {
  className?: string
}

export default function ARRadar({ className }: ARRadarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<RadarUser | null>(null)
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)
  const { data: feedItems } = useFeed()

  // Convert feed users to radar users with deterministic positions
  // Using a simple hash function based on user ID to ensure consistent positioning
  const hashString = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  const users: RadarUser[] = (feedItems ?? [])
    .filter((item): item is Extract<typeof item, { type: 'user' }> => item.type === 'user')
    .slice(0, AR_RADAR.MAX_USERS_DISPLAYED)
    .map((user, index) => {
      // Generate deterministic positions based on user ID
      const userHash = hashString(user.id)
      const angle = (index / AR_RADAR.MAX_USERS_DISPLAYED) * Math.PI * 2
      // Use hash to create consistent radius between min-max from center
      const radiusRange = AR_RADAR.MAX_RADIUS_PERCENT - AR_RADAR.MIN_RADIUS_PERCENT
      const radius = AR_RADAR.MIN_RADIUS_PERCENT + ((userHash % 20) / 20) * radiusRange
      const x = 50 + Math.cos(angle) * radius
      const y = 50 + Math.sin(angle) * radius

      return {
        id: user.id,
        alias: user.alias,
        avatarUrl: user.avatarUrl,
        headline: user.headline,
        bio: user.bio,
        sharedInterests: user.sharedInterests,
        sharedIntents: user.sharedIntents,
        unlockLevel: user.unlockLevel,
        distance: user.proximity || `${50 + (userHash % 200)}m`,
        x: Math.max(AR_RADAR.POSITION_BUFFER, Math.min(100 - AR_RADAR.POSITION_BUFFER, x)),
        y: Math.max(AR_RADAR.POSITION_BUFFER, Math.min(100 - AR_RADAR.POSITION_BUFFER, y)),
      }
    })

  return (
    <>
      {/* AR Radar Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative z-[55] flex items-center justify-center rounded-full ${className || ''}`}
      >
        <motion.div
          className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-neon-cyan bg-black-deep/80 backdrop-blur-xl"
          animate={{
            boxShadow: [
              '0 0 10px rgba(0, 255, 240, 0.5)',
              '0 0 20px rgba(0, 255, 240, 0.8)',
              '0 0 10px rgba(0, 255, 240, 0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 rounded-full border border-neon-cyan/50 animate-radar-scan" />
          <MapPin className="h-5 w-5 text-neon-cyan" />
          {users.length > 0 && (
            <motion.span
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-pink text-xs font-bold text-black-pure"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {users.length}
            </motion.span>
          )}
        </motion.div>
      </button>

      {/* AR Radar Modal - Portaled to body to escape sidebar stacking context */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black-pure/80 backdrop-blur-sm"
                onClick={() => {
                  setIsOpen(false)
                  setSelectedUser(null)
                }}
              />
              <motion.div
                className="relative z-[101] w-full max-w-md rounded-3xl bg-black-deep border border-neon-cyan/30 p-6 shadow-neon-cyan"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold gradient-text">AR Radar</h2>
                    <p className="text-sm text-white/60">Active users nearby ({users.length})</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setSelectedUser(null)
                    }}
                    className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Radar Circle */}
                <div className="relative mx-auto mb-6 aspect-square w-full max-w-[300px] rounded-full border-2 border-neon-cyan/50 bg-black-pure/50">
                  {/* Radar scan line */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0%, rgba(0, 255, 240, 0.1) 5%, transparent 10%)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Center point (user location) */}
                  <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-green shadow-neon-green" />

                  {/* User blips */}
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="absolute group"
                      style={{
                        left: `${user.x}%`,
                        top: `${user.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onMouseEnter={() => setHoveredUserId(user.id)}
                      onMouseLeave={() => setHoveredUserId(null)}
                    >
                      <motion.button
                        onClick={() => setSelectedUser(user)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative rounded-full z-20"
                      >
                        <motion.div
                          className="h-4 w-4 rounded-full bg-neon-pink shadow-neon-pink"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        {/* Pulse rings */}
                        <motion.div
                          className="absolute inset-0 rounded-full border border-neon-pink/50"
                          animate={{
                            scale: [1, 2, 2],
                            opacity: [0.8, 0, 0],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.button>

                      {/* Hover Card */}
                      <AnimatePresence>
                        {hoveredUserId === user.id && (
                          <motion.div
                            className="absolute z-[110] w-64 pointer-events-auto"
                            style={{
                              left: user.x > 50 ? 'auto' : '100%',
                              right: user.x > 50 ? '100%' : 'auto',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              marginLeft: user.x > 50 ? '-8px' : '8px',
                              marginRight: user.x > 50 ? '8px' : '-8px',
                            }}
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            transition={{ duration: 0.2 }}
                            onMouseEnter={() => setHoveredUserId(user.id)}
                            onMouseLeave={() => setHoveredUserId(null)}
                          >
                            <div className="rounded-2xl border border-neon-cyan/50 bg-black-deep/95 backdrop-blur-xl p-4 shadow-neon-cyan">
                              {/* Avatar and Alias */}
                              <div className="mb-3 flex items-center gap-3">
                                {user.avatarUrl && user.unlockLevel >= 4 ? (
                                  <Image
                                    src={user.avatarUrl}
                                    alt={user.alias}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-xl object-cover border border-neon-cyan/50"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple text-sm font-bold text-black-pure border border-neon-cyan/50">
                                    {user.alias.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-white truncate">@{user.alias}</div>
                                  <div className="text-xs text-white/60">{user.distance} away</div>
                                </div>
                              </div>

                              {/* Description/Intent */}
                              {(user.headline || user.bio) && (
                                <div className="mb-3">
                                  <p className="text-xs text-white/80 line-clamp-2">
                                    {user.headline || user.bio}
                                  </p>
                                </div>
                              )}

                              {/* Shared Intents */}
                              {user.sharedIntents.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-white/60 mb-1.5">Intents</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.sharedIntents.slice(0, 3).map((intent) => (
                                      <span
                                        key={intent}
                                        className="rounded-full border border-neon-purple/50 bg-neon-purple/10 px-2 py-0.5 text-xs text-neon-purple capitalize"
                                      >
                                        {intent}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Shared Interests/Skills (if matchable) */}
                              {user.sharedInterests.length > 0 && (
                                <div>
                                  <div className="text-xs text-white/60 mb-1.5">Matching Skills</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.sharedInterests.slice(0, 4).map((interest) => (
                                      <span
                                        key={interest}
                                        className="rounded-full border border-neon-cyan/50 bg-neon-cyan/10 px-2 py-0.5 text-xs text-neon-cyan"
                                      >
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-neon-cyan/20" />
                    <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-neon-cyan/20" />
                  </div>
                </div>

                {/* User list */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full rounded-xl border p-3 text-left transition ${selectedUser?.id === user.id
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-white/10 bg-black-deep/50 hover:border-neon-cyan/50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl && user.unlockLevel >= 4 ? (
                              <Image
                                src={user.avatarUrl}
                                alt={user.alias}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover border border-neon-cyan/50"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-pink to-neon-purple text-sm font-bold text-black-pure">
                                {user.alias.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-white">@{user.alias}</div>
                              <div className="text-xs text-white/60">{user.distance} away</div>
                            </div>
                          </div>
                          {user.sharedIntents.length > 0 && (
                            <span className="rounded-full border border-neon-purple/50 bg-neon-purple/10 px-2 py-1 text-xs text-neon-purple capitalize">
                              {user.sharedIntents[0]}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-black-deep/30 p-4 text-center text-sm text-white/40">
                      No active users nearby
                    </div>
                  )}
                </div>
              </motion.div>

              {/* User Detail Modal */}
              <AnimatePresence>
                {selectedUser && (
                  <motion.div
                    className="absolute inset-0 z-[120] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedUser(null)}
                  >
                    <motion.div
                      className="relative w-full max-w-sm rounded-3xl bg-black-deep border border-neon-pink/30 p-6 shadow-neon-pink"
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="absolute right-4 top-4 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <div className="mb-4 flex items-center gap-4">
                        {selectedUser.avatarUrl && selectedUser.unlockLevel >= 4 ? (
                          <Image
                            src={selectedUser.avatarUrl}
                            alt={selectedUser.alias}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-2xl object-cover border border-neon-cyan/50"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple text-xl font-bold text-black-pure">
                            {selectedUser.alias.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-white">@{selectedUser.alias}</h3>
                          <p className="text-sm text-white/60">{selectedUser.distance} away</p>
                        </div>
                      </div>

                      {(selectedUser.headline || selectedUser.bio) && (
                        <div className="mb-4 rounded-xl border border-neon-green/30 bg-neon-green/10 p-3">
                          <div className="text-xs text-neon-green/80 mb-1">About</div>
                          <div className="font-semibold text-neon-green">
                            {selectedUser.headline || selectedUser.bio}
                          </div>
                        </div>
                      )}

                      {selectedUser.sharedIntents.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-white/60 mb-2">Intents</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.sharedIntents.map((intent) => (
                              <span
                                key={intent}
                                className="rounded-full border border-neon-purple/50 bg-neon-purple/10 px-3 py-1 text-xs text-neon-purple capitalize"
                              >
                                {intent}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedUser.sharedInterests.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-white/60 mb-2">Matching Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.sharedInterests.map((interest) => (
                              <span
                                key={interest}
                                className="rounded-full border border-neon-cyan/50 bg-neon-cyan/10 px-3 py-1 text-xs text-neon-cyan"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button className="flex-1 rounded-xl border border-neon-cyan bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition hover:bg-neon-cyan/20">
                          Quick Connect
                        </button>
                        <button className="flex-1 rounded-xl border border-neon-pink bg-neon-pink/10 px-4 py-2 text-sm font-semibold text-neon-pink transition hover:bg-neon-pink/20">
                          Chat
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}


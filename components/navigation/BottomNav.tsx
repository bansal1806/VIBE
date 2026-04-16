'use client'

import { Home, Flame, MessageCircle, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const navItems = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Discover', href: '/app/discover', icon: Flame },
    { name: 'Chat', href: '/app/chat', icon: MessageCircle },
    { name: 'Events', href: '/app/events', icon: Calendar },
    { name: 'Profile', href: '/app/profile', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent pb-safe">
            <div className="mx-auto max-w-lg">
                <div className="flex items-center justify-around border-t border-white/10 px-2 py-2 backdrop-blur-xl">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors"
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <div className="relative z-10">
                                    <Icon
                                        size={24}
                                        className={`transition-colors ${isActive
                                                ? 'text-cyan-400'
                                                : 'text-white/60 group-hover:text-white/80'
                                            }`}
                                    />
                                </div>

                                <span
                                    className={`relative z-10 text-xs font-medium transition-colors ${isActive ? 'text-cyan-400' : 'text-white/60'
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}

'use client'

import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export default function HeroPane() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-12 lg:p-24 overflow-hidden">
      {/* Background Texture: Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #8e8e8e 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-nexus-blue/10 blur-[150px] rounded-full animate-subtle-pulse" />
      
      <div className="relative z-10 flex flex-col items-center md:items-start max-w-xl w-full">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-nexus-blue via-neon-pink to-neon-yellow shadow-lg">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">Vibe</span>
        </motion.div>

        {/* trust badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-5 w-5 rounded-full border border-black-pure bg-gradient-to-br from-nexus-gray to-nexus-blue" />
            ))}
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Campus Verified Community
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-8"
        >
          Hyperlocal vibes for your{' '}
          <span className="nexus-gradient-text">campus connections.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 mb-16 max-w-md font-medium leading-relaxed"
        >
          Join your college community in real-time. Discover Now Rooms, unlock memories, and connect with purpose.
        </motion.p>

        {/* Floating Phone Stack Mockup - Repositioned to avoid overlap */}
        <div className="relative h-[300px] w-full mt-12 hidden lg:block">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 top-0 w-[220px] h-[440px] bg-black-deep rounded-[40px] border-[8px] border-nexus-gray shadow-2xl z-20 overflow-hidden"
          >
            {/* Screen Content Mockup */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black-deep to-nexus-blue/20 flex flex-col p-6">
              <div className="h-4 w-20 bg-white/10 rounded-full mb-8" />
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 bg-white/10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                      <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute left-[100px] top-[40px] w-[200px] h-[400px] bg-black-deep rounded-[40px] border-[8px] border-nexus-gray shadow-2xl z-10 overflow-hidden opacity-40 translate-x-12"
          >
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black-deep to-neon-pink/20" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

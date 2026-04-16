'use client'

import { motion } from 'framer-motion'
import HeroPane from './HeroPane'
import AuthPane from './AuthPane'

export default function NexusLanding() {
  return (
    <div className="min-h-screen bg-black-pure flex flex-col">
      {/* Main Split Section */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Hero & Branding */}
        <section className="w-full md:w-1/2 lg:w-[60%] nexus-split-left min-h-[50vh] md:min-h-screen">
          <HeroPane />
        </section>

        {/* Right Pane: Authentication */}
        <section className="w-full md:w-1/2 lg:w-[40%] nexus-split-right min-h-[50vh] md:min-h-screen">
          <div className="w-full max-w-[350px] py-20">
            <AuthPane />
          </div>
        </section>
      </div>

      {/* Meta-style Footer */}
      <footer className="w-full py-12 px-8 flex flex-col items-center gap-6 bg-black-pure">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-nexus-gray-muted font-medium">
          {['About', 'Blog', 'Jobs', 'Help', 'API', 'Privacy', 'Terms', 'Locations', 'Instagram Lite', 'Threads', 'Contact Uploading & Non-Users', 'Meta Verified'].map(link => (
            <button key={link} className="hover:underline cursor-pointer">{link}</button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-nexus-gray-muted font-medium">
          <select className="bg-transparent border-none outline-none cursor-pointer">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
          <span>© 2026 Vibe from Campus Connections</span>
        </div>
      </footer>
    </div>
  )
}

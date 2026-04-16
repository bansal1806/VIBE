'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/lib/hooks/useSession'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useSession()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace('/sign-in?redirect=' + encodeURIComponent('/onboarding'))
      return
    }

    // Load profile completion state from API
    async function checkProfileStatus() {
      try {
        const response = await fetch('/api/profile/status')
        if (response.ok) {
          const data = await response.json()
          // If profile is complete, redirect to main app
          if (data.isComplete) {
            router.replace('/app')
          }
        }
      } catch (error) {
        console.error('Failed to check profile status:', error)
      }
    }

    checkProfileStatus()
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-sm text-slate-500">Preparing your campus experience…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-white/40 text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-200">
            Step 1 of 3
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold gradient-text">Let’s build your Vibe profile</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300 sm:text-lg">
            Tell us about your campus journey so we can tailor rooms, events, and connections.
          </p>
        </header>

        <div className="grid gap-6">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-300 font-semibold">
              Campus Email
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {user?.email}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              We’ll keep this private. Only verified students can join your campus network.
            </p>
          </div>

          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-300 font-semibold">
              Next up
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-200">
              <li>• Choose your studio alias and avatar</li>
              <li>• Share your major, year, and interests</li>
              <li>• Set privacy preferences for dual identity mode</li>
            </ul>
            <button
              className="mt-6 inline-flex items-center justify-center rounded-full professional-gradient text-white font-semibold px-6 py-3 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition"
              onClick={() => router.push('/onboarding/profile')}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


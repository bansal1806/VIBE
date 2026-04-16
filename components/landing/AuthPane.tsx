'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock } from 'lucide-react'

export default function AuthPane() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP')

      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Invalid OTP')

      // Redirect based on whether user is new or existing
      // Logic from existing components: router.push('/app')
      router.push('/app')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Boxed Form */}
      <div className="w-full bg-black-deep md:border border-white/10 rounded-sm p-10 flex flex-col items-center">
        {/* Instagram style branding */}
        <h2 className="text-xl font-semibold text-white mb-8">
          {step === 'email' ? 'Enter Campus Email' : 'Verify Identity'}
        </h2>

        {error && (
          <div className="w-full mb-4 py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-sm text-[11px] text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={step === 'email' ? handleSendOTP : handleVerifyOTP} className="w-full space-y-3">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <motion.div
                key="email-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <input
                  type="email"
                  placeholder="Student email address (@university.edu)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="nexus-input"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !email.includes('.edu')}
                  className="nexus-button-primary mt-2"
                >
                  {loading ? 'Sending Code...' : 'Get Access Code'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="nexus-input text-center tracking-[1em] text-lg font-bold"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="nexus-button-primary mt-2"
                >
                  {loading ? 'Verifying...' : 'Log In'}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[11px] text-nexus-blue hover:text-white transition-colors mt-4"
                  >
                    Change email address
                  </button>
                </div>
              </motion.div>
            )
          }
          </AnimatePresence>
        </form>

        <div className="nexus-separator">
          <div className="nexus-separator-line" />
          <span className="text-nexus-gray-muted text-[11px] font-semibold uppercase">OR</span>
          <div className="nexus-separator-line" />
        </div>

        <button className="flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors">
          <Mail className="h-4 w-4" />
          Request an invite
        </button>
      </div>

      {/* Secondary Box */}
      <div className="w-full bg-black-deep md:border border-white/10 rounded-sm p-6 mt-4 flex justify-center text-sm">
        <p className="text-white/80">
          Already verified? <button onClick={() => setStep('email')} className="text-nexus-blue font-semibold ml-1">Log in</button>
        </p>
      </div>

      {/* Get the app Section */}
      <div className="mt-8 flex flex-col items-center gap-5 w-full">
        <span className="text-sm text-white/90">Get the app.</span>
        <div className="flex gap-2 w-full max-w-[300px]">
          {/* Mock App Store Badge */}
          <div className="flex-1 h-10 bg-nexus-gray rounded-md border border-white/10 flex items-center justify-center p-2 cursor-not-allowed hover:bg-nexus-gray-light transition-colors">
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] text-white/60 uppercase">Download on the</span>
              <span className="text-sm font-semibold text-white">App Store</span>
            </div>
          </div>
          {/* Mock Play Store Badge */}
          <div className="flex-1 h-10 bg-nexus-gray rounded-md border border-white/10 flex items-center justify-center p-2 cursor-not-allowed hover:bg-nexus-gray-light transition-colors">
             <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] text-white/60 uppercase">Get it on</span>
              <span className="text-sm font-semibold text-white">Google Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Branding */}
      <div className="mt-12 flex flex-col items-center gap-1 opacity-20 hover:opacity-100 transition-opacity grayscale cursor-default">
        <span className="text-[10px] text-white/60 tracking-widest uppercase font-bold">From</span>
        <div className="flex items-center gap-2">
           <div className="h-3 w-3 rounded-full border border-white" />
           <span className="text-xs font-black text-white px-1">VIBE</span>
        </div>
      </div>
    </div>
  )
}

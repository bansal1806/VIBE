'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    isGeolocationSupported,
    getLocationPermissionStatus,
    requestLocation,
    type LocationPermissionStatus,
} from '@/lib/location/permissions'

interface LocationPermissionDialogProps {
    isOpen: boolean
    onClose: () => void
    onLocationGranted: (location: { latitude: number; longitude: number }) => void
}

export default function LocationPermissionDialog({
    isOpen,
    onClose,
    onLocationGranted,
}: LocationPermissionDialogProps) {
    const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('prompt')
    const [isRequesting, setIsRequesting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            checkPermission()
        }
    }, [isOpen])

    async function checkPermission() {
        const status = await getLocationPermissionStatus()
        setPermissionStatus(status)
    }

    async function handleRequestLocation() {
        setIsRequesting(true)
        setError(null)

        try {
            const location = await requestLocation()

            // Update server
            await fetch('/api/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                }),
            })

            onLocationGranted({
                latitude: location.latitude,
                longitude: location.longitude,
            })
            onClose()
        } catch (err: any) {
            console.error('[location] Error:', err)
            setError(err.message || 'Failed to get location')
            setPermissionStatus('denied')
        } finally {
            setIsRequesting(false)
        }
    }

    if (!isGeolocationSupported()) {
        return null
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br from-purple-900/95 to-pink-900/95 p-6 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        {/* Icon */}
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-4">
                                <MapPin size={32} className="text-white" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                            <h2 className="mb-2 text-2xl font-bold text-white">Enable Location</h2>
                            <p className="mb-6 text-sm text-white/80">
                                Discover Now Rooms and people nearby based on your location. Your privacy is our
                                priority.
                            </p>

                            {/* Benefits */}
                            <div className="mb-6 space-y-3 rounded-xl bg-white/10 p-4 text-left">
                                <h3 className="font-semibold text-white">Why we need this:</h3>
                                <ul className="space-y-2 text-sm text-white/90">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 text-cyan-400">•</span>
                                        <span>Find nearby Now Rooms in real-time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 text-cyan-400">•</span>
                                        <span>Connect with people on your campus</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 text-cyan-400">•</span>
                                        <span>See distance to events and activities</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Privacy note */}
                            <p className="mb-6 text-xs text-white/60">
                                🔒 Your exact location is never shared. Only campus and approximate distances are
                                visible to others.
                            </p>

                            {/* Error message */}
                            {error && (
                                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/20 p-3 text-left">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 rounded-xl border border-white/20 px-4 py-3 font-medium text-white transition hover:bg-white/10"
                                >
                                    Not Now
                                </button>
                                <button
                                    onClick={handleRequestLocation}
                                    disabled={isRequesting || permissionStatus === 'denied'}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRequesting ? 'Requesting...' : 'Enable Location'}
                                </button>
                            </div>

                            {permissionStatus === 'denied' && (
                                <p className="mt-3 text-xs text-yellow-300">
                                    Location permission was denied. Please enable it in your browser settings to use
                                    this feature.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

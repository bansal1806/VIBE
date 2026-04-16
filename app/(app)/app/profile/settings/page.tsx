'use client'

import { useState } from 'react'
import { Settings, Bell, Shield, MapPin, Eye, UserX, LogOut, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import BottomNav from '@/components/navigation/BottomNav'

export default function ProfileSettingsPage() {
    const [settings, setSettings] = useState({
        notifications: {
            matches: true,
            messages: true,
            roomActivity: false,
            events: true,
            timecapsules: true,
        },
        privacy: {
            discoverable: true,
            showLocation: true,
            profileVisibility: 'campus' as 'public' | 'campus' | 'connections',
            allowMessagesFrom: 'campus' as 'everyone' | 'campus' | 'connections',
        },
        preferences: {
            dualIdentityMode: true,
            shareAnalytics: false,
            recruiterOptIn: false,
        },
    })

    function updateNotification(key: keyof typeof settings.notifications, value: boolean) {
        setSettings((prev) => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: value },
        }))
    }

    function updatePrivacy(key: keyof typeof settings.privacy, value: any) {
        setSettings((prev) => ({
            ...prev,
            privacy: { ...prev.privacy, [key]: value },
        }))
    }

    function updatePreference(key: keyof typeof settings.preferences, value: boolean) {
        setSettings((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, [key]: value },
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 pb-20">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <Settings className="text-cyan-400" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-sm text-white/60">Manage your preferences</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-4">
                {/* Notifications Section */}
                <Section title="Notifications" icon={Bell}>
                    <Toggle
                        label="Match notifications"
                        description="Get notified when you match with someone"
                        value={settings.notifications.matches}
                        onChange={(v) => updateNotification('matches', v)}
                    />
                    <Toggle
                        label="Message notifications"
                        description="Get notified about new messages"
                        value={settings.notifications.messages}
                        onChange={(v) => updateNotification('messages', v)}
                    />
                    <Toggle
                        label="Room activity"
                        description="Updates from rooms you've joined"
                        value={settings.notifications.roomActivity}
                        onChange={(v) => updateNotification('roomActivity', v)}
                    />
                    <Toggle
                        label="Event reminders"
                        description="Reminders for events you're interested in"
                        value={settings.notifications.events}
                        onChange={(v) => updateNotification('events', v)}
                    />
                    <Toggle
                        label="Timecapsule unlocks"
                        description="When a timecapsule is unlocked"
                        value={settings.notifications.timecapsules}
                        onChange={(v) => updateNotification('timecapsules', v)}
                    />
                </Section>

                {/* Privacy Section */}
                <Section title="Privacy & Safety" icon={Shield}>
                    <Toggle
                        label="Discoverable"
                        description="Show your profile in discovery feed"
                        value={settings.privacy.discoverable}
                        onChange={(v) => updatePrivacy('discoverable', v)}
                    />
                    <Toggle
                        label="Show location"
                        description="Display approximate distance to others"
                        value={settings.privacy.showLocation}
                        onChange={(v) => updatePrivacy('showLocation', v)}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white">Profile visibility</label>
                        <select
                            value={settings.privacy.profileVisibility}
                            onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        >
                            <option value="public">Public</option>
                            <option value="campus">Campus only</option>
                            <option value="connections">Connections only</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-white">Allow messages from</label>
                        <select
                            value={settings.privacy.allowMessagesFrom}
                            onChange={(e) => updatePrivacy('allowMessagesFrom', e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        >
                            <option value="everyone">Everyone</option>
                            <option value="campus">Campus only</option>
                            <option value="connections">Connections only</option>
                        </select>
                    </div>

                    <ActionButton icon={UserX} label="Blocked users" onClick={() => { }} />
                </Section>

                {/* Preferences Section */}
                <Section title="Preferences" icon={Eye}>
                    <Toggle
                        label="Dual identity mode"
                        description="Use studio alias until trust threshold"
                        value={settings.preferences.dualIdentityMode}
                        onChange={(v) => updatePreference('dualIdentityMode', v)}
                    />
                    <Toggle
                        label="Share analytics"
                        description="Help improve Vibe with usage data"
                        value={settings.preferences.shareAnalytics}
                        onChange={(v) => updatePreference('shareAnalytics', v)}
                    />
                    <Toggle
                        label="Recruiter opt-in"
                        description="Allow recruiters to find you"
                        value={settings.preferences.recruiterOptIn}
                        onChange={(v) => updatePreference('recruiterOptIn', v)}
                    />
                </Section>

                {/* Account Actions */}
                <Section title="Account">
                    <ActionButton icon={LogOut} label="Log out" onClick={() => { }} danger />
                    <ActionButton
                        icon={UserX}
                        label="Delete account"
                        onClick={() => { }}
                        danger
                        description="Permanently delete your account and data"
                    />
                </Section>

                {/* Save Button */}
                <button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 py-4 font-semibold text-white shadow-lg transition hover:shadow-cyan-500/50">
                    Save Changes
                </button>
            </div>

            <BottomNav />
        </div>
    )
}

function Section({
    title,
    icon: Icon,
    children,
}: {
    title: string
    icon?: any
    children: React.ReactNode
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 p-6 backdrop-blur-sm"
        >
            <div className="mb-4 flex items-center gap-3">
                {Icon && <Icon className="text-cyan-400" size={24} />}
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            <div className="space-y-4">{children}</div>
        </motion.div>
    )
}

function Toggle({
    label,
    description,
    value,
    onChange,
}: {
    label: string
    description?: string
    value: boolean
    onChange: (value: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="font-medium text-white">{label}</p>
                {description && <p className="text-sm text-white/60">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/20'
                    }`}
            >
                <motion.div
                    animate={{ x: value ? 20 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg"
                />
            </button>
        </div>
    )
}

function ActionButton({
    icon: Icon,
    label,
    description,
    onClick,
    danger,
}: {
    icon: any
    label: string
    description?: string
    onClick: () => void
    danger?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
        >
            <div className="flex items-center gap-3">
                <Icon className={danger ? 'text-red-400' : 'text-white/60'} size={20} />
                <div className="text-left">
                    <p className={`font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
                    {description && <p className="text-xs text-white/50">{description}</p>}
                </div>
            </div>
            <ChevronRight className="text-white/40" size={20} />
        </button>
    )
}

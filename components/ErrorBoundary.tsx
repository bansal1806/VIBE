'use client'

import React, { Component, ReactNode } from 'react'
import { log } from '@/lib/logger'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to logging service
        log.error('React Error Boundary caught an error', error, {
            componentStack: errorInfo.componentStack,
        })

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
                    <div className="max-w-md w-full glass rounded-3xl p-8 text-center">
                        <div className="mb-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-red-600 dark:text-red-400"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs bg-slate-900 text-red-400 p-4 rounded-lg overflow-auto max-h-40">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3 hover:from-indigo-700 hover:to-purple-700 transition"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Simple error fallback component
 */
export function SimpleErrorFallback({ error }: { error?: Error }) {
    return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Something went wrong
            </p>
            {error && process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-mono">
                    {error.message}
                </p>
            )}
        </div>
    )
}

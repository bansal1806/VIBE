/**
 * Simple structured logging utility
 * Provides consistent logging across the application with environment-based levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    [key: string]: unknown
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development'
    private minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
        return levels.indexOf(level) >= levels.indexOf(this.minLevel)
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString()
        const contextStr = context ? ` ${JSON.stringify(context)}` : ''
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
    }

    debug(message: string, context?: LogContext) {
        if (!this.shouldLog('debug')) return
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message, context))
        }
    }

    info(message: string, context?: LogContext) {
        if (!this.shouldLog('info')) return
        console.log(this.formatMessage('info', message, context))
    }

    warn(message: string, context?: LogContext) {
        if (!this.shouldLog('warn')) return
        console.warn(this.formatMessage('warn', message, context))
    }

    error(message: string, error?: Error | unknown, context?: LogContext) {
        if (!this.shouldLog('error')) return

        const errorContext = {
            ...context,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: this.isDevelopment ? error.stack : undefined,
            } : error,
        }

        console.error(this.formatMessage('error', message, errorContext))
    }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const log = {
    debug: (message: string, context?: LogContext) => logger.debug(message, context),
    info: (message: string, context?: LogContext) => logger.info(message, context),
    warn: (message: string, context?: LogContext) => logger.warn(message, context),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
        logger.error(message, error, context),
}

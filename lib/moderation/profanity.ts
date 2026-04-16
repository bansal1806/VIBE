/**
 * Profanity filter for content moderation
 */

const PROFANITY_PATTERNS = [
    // Basic profanity list - expandable
    /\b(badword1|badword2)\b/gi,
    // Add more patterns as needed
]

const OFFENSIVE_PATTERNS = [
    /hate speech pattern/gi,
    /harassment pattern/gi,
]

export interface ModerationResult {
    clean: boolean
    filtered: string
    detectedIssues: string[]
    severity: 'none' | 'low' | 'medium' | 'high'
}

/**
 * Filter profanity from text
 */
export function filterProfanity(text: string): ModerationResult {
    let filtered = text
    const detectedIssues: string[] = []
    let severity: ModerationResult['severity'] = 'none'

    // Check for profanity
    PROFANITY_PATTERNS.forEach((pattern, index) => {
        if (pattern.test(filtered)) {
            filtered = filtered.replace(pattern, '***')
            detectedIssues.push(`profanity_${index}`)
            severity = 'low'
        }
    })

    // Check for offensive content
    OFFENSIVE_PATTERNS.forEach((pattern, index) => {
        if (pattern.test(filtered)) {
            filtered = filtered.replace(pattern, '[removed]')
            detectedIssues.push(`offensive_${index}`)
            severity = 'high'
        }
    })

    return {
        clean: detectedIssues.length === 0,
        filtered,
        detectedIssues,
        severity,
    }
}

/**
 * Check if text contains inappropriate content (without filtering)
 */
export function containsProfanity(text: string): boolean {
    return [...PROFANITY_PATTERNS, ...OFFENSIVE_PATTERNS].some((pattern) => pattern.test(text))
}

/**
 * Get severity level of content
 */
export function getContentSeverity(text: string): ModerationResult['severity'] {
    let severity: ModerationResult['severity'] = 'none'

    if (PROFANITY_PATTERNS.some((p) => p.test(text))) {
        severity = 'low'
    }

    if (OFFENSIVE_PATTERNS.some((p) => p.test(text))) {
        severity = 'high'
    }

    return severity
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(text: string): string {
    // Remove potential XSS
    const sanitized = text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')

    // Filter profanity
    const { filtered } = filterProfanity(sanitized)

    return filtered
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): {
    valid: boolean
    error?: string
    severity?: ModerationResult['severity']
} {
    if (!content || content.trim().length === 0) {
        return { valid: false, error: 'Message cannot be empty' }
    }

    if (content.length > 2000) {
        return { valid: false, error: 'Message too long (max 2000 characters)' }
    }

    const severity = getContentSeverity(content)

    if (severity === 'high') {
        return {
            valid: false,
            error: 'Message contains inappropriate content',
            severity,
        }
    }

    return { valid: true }
}

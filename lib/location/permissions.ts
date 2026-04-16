/**
 * Location permissions and browser geolocation wrapper
 */

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported'

export interface GeolocationPosition {
    latitude: number
    longitude: number
    accuracy: number
    timestamp: number
}

export interface LocationError {
    code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED'
    message: string
}

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
    return 'geolocation' in navigator
}

/**
 * Get current location permission status
 */
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!isGeolocationSupported()) {
        return 'unsupported'
    }

    // Check if Permissions API is supported
    if ('permissions' in navigator) {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' })
            return permission.state as LocationPermissionStatus
        } catch (error) {
            console.warn('[location] Permissions API not fully supported:', error)
        }
    }

    // Fallback to prompt
    return 'prompt'
}

/**
 * Request location permission and get current position
 */
export async function requestLocation(
    highAccuracy: boolean = true
): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!isGeolocationSupported()) {
            reject({
                code: 'UNSUPPORTED',
                message: 'Geolocation is not supported by this browser',
            } as LocationError)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                })
            },
            (error) => {
                let code: LocationError['code']
                let message: string

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        code = 'PERMISSION_DENIED'
                        message = 'Location permission denied'
                        break
                    case error.POSITION_UNAVAILABLE:
                        code = 'POSITION_UNAVAILABLE'
                        message = 'Location information unavailable'
                        break
                    case error.TIMEOUT:
                        code = 'TIMEOUT'
                        message = 'Location request timed out'
                        break
                    default:
                        code = 'POSITION_UNAVAILABLE'
                        message = 'Unknown error occurred'
                }

                reject({ code, message } as LocationError)
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: 10000,
                maximumAge: 60000, // Accept cached location up to 1 minute old
            }
        )
    })
}

/**
 * Watch location changes
 */
export function watchLocation(
    onUpdate: (position: GeolocationPosition) => void,
    onError: (error: LocationError) => void,
    highAccuracy: boolean = false
): () => void {
    if (!isGeolocationSupported()) {
        onError({
            code: 'UNSUPPORTED',
            message: 'Geolocation is not supported by this browser',
        })
        return () => { }
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            onUpdate({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
            })
        },
        (error) => {
            let code: LocationError['code']
            let message: string

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    code = 'PERMISSION_DENIED'
                    message = 'Location permission denied'
                    break
                case error.POSITION_UNAVAILABLE:
                    code = 'POSITION_UNAVAILABLE'
                    message = 'Location information unavailable'
                    break
                case error.TIMEOUT:
                    code = 'TIMEOUT'
                    message = 'Location request timed out'
                    break
                default:
                    code = 'POSITION_UNAVAILABLE'
                    message = 'Unknown error occurred'
            }

            onError({ code, message })
        },
        {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 30000, // Accept cached location up to 30 seconds old for watching
        }
    )

    // Return cleanup function
    return () => {
        navigator.geolocation.clearWatch(watchId)
    }
}

/**
 * Get cached location from localStorage
 */
export function getCachedLocation(): GeolocationPosition | null {
    try {
        const cached = localStorage.getItem('vibe_location')
        if (!cached) return null

        const location = JSON.parse(cached) as GeolocationPosition

        // Check if cache is less than 5 minutes old
        const age = Date.now() - location.timestamp
        if (age > 5 * 60 * 1000) {
            localStorage.removeItem('vibe_location')
            return null
        }

        return location
    } catch (error) {
        console.error('[location] Failed to get cached location:', error)
        return null
    }
}

/**
 * Cache location to localStorage
 */
export function cacheLocation(location: GeolocationPosition): void {
    try {
        localStorage.setItem('vibe_location', JSON.stringify(location))
    } catch (error) {
        console.error('[location] Failed to cache location:', error)
    }
}

/**
 * Clear cached location
 */
export function clearCachedLocation(): void {
    try {
        localStorage.removeItem('vibe_location')
    } catch (error) {
        console.error('[location] Failed to clear cached location:', error)
    }
}

/**
 * Get location with fallback to cache
 */
export async function getLocationWithCache(): Promise<GeolocationPosition> {
    // Try to get fresh location
    try {
        const location = await requestLocation()
        cacheLocation(location)
        return location
    } catch (error) {
        // Fallback to cached location
        const cached = getCachedLocation()
        if (cached) {
            return cached
        }
        throw error
    }
}

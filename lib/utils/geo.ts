export function haversineDistanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const R = 6371 // Earth radius in km
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)

  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav))
  return R * c
}

export function formatDistance(distanceKm: number | null | undefined) {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return null
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`
  }
  return `${Math.round(distanceKm)} km`
}

/**
 * Check if location is within proximity radius
 */
export function isWithinProximity(
  location1: { latitude: number; longitude: number },
  location2: { latitude: number; longitude: number },
  radiusKm: number
): boolean {
  const distance = haversineDistanceKm(location1, location2)
  return distance <= radiusKm
}

/**
 * Filter items by proximity
 */
export function filterByProximity<T extends { latitude: number; longitude: number }>(
  items: T[],
  userLocation: { latitude: number; longitude: number },
  radiusKm: number
): T[] {
  return items.filter((item) => isWithinProximity(userLocation, item, radiusKm))
}

/**
 * Sort items by distance from user location
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  items: T[],
  userLocation: { latitude: number; longitude: number }
): (T & { distanceKm: number })[] {
  return items
    .map((item) => ({
      ...item,
      distanceKm: haversineDistanceKm(userLocation, item),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

/**
 * Get items within proximity, sorted by distance
 */
export function getNearbyItems<T extends { latitude: number; longitude: number }>(
  items: T[],
  userLocation: { latitude: number; longitude: number },
  radiusKm: number = 5
): (T & { distanceKm: number })[] {
  return sortByDistance(items, userLocation).filter((item) => item.distanceKm <= radiusKm)
}

/**
 * Check if point is within a bounding box (campus boundary)
 */
export function isWithinBoundingBox(
  point: { latitude: number; longitude: number },
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
): boolean {
  return (
    point.latitude <= bounds.north &&
    point.latitude >= bounds.south &&
    point.longitude <= bounds.east &&
    point.longitude >= bounds.west
  )
}

/**
 * Calculate bearing between two points (direction in degrees)
 */
export function calculateBearing(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const toDeg = (radians: number) => (radians * 180) / Math.PI

  const dLon = toRad(to.longitude - from.longitude)
  const lat1 = toRad(from.latitude)
  const lat2 = toRad(to.latitude)

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)

  const bearing = toDeg(Math.atan2(y, x))
  return (bearing + 360) % 360
}

/**
 * Get cardinal direction from bearing
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

/**
 * Create geofence checker for a location
 */
export function createGeofence(
  center: { latitude: number; longitude: number },
  radiusKm: number
): {
  isInside: (point: { latitude: number; longitude: number }) => boolean
  getDistance: (point: { latitude: number; longitude: number }) => number
} {
  return {
    isInside: (point) => isWithinProximity(center, point, radiusKm),
    getDistance: (point) => haversineDistanceKm(center, point),
  }
}

/**
 * Campus proximity levels for Now Rooms
 */
export enum ProximityLevel {
  IMMEDIATE = 0.1, // 100m
  NEARBY = 0.5, // 500m
  CAMPUS = 2, // 2km
  EXTENDED = 5, // 5km
}

/**
 * Get proximity level for a distance
 */
export function getProximityLevel(distanceKm: number): keyof typeof ProximityLevel | null {
  if (distanceKm <= ProximityLevel.IMMEDIATE) return 'IMMEDIATE'
  if (distanceKm <= ProximityLevel.NEARBY) return 'NEARBY'
  if (distanceKm <= ProximityLevel.CAMPUS) return 'CAMPUS'
  if (distanceKm <= ProximityLevel.EXTENDED) return 'EXTENDED'
  return null
}

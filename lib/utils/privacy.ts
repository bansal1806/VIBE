import { type User } from '@prisma/client'
import { getUnlockedFields } from '../connection/trust'

/**
 * Partial user type containing fields that can be masked
 */
export type MaskableUser = Pick<
  User,
  | 'id'
  | 'alias'
  | 'name'
  | 'avatarUrl'
  | 'bio'
  | 'major'
  | 'year'
  | 'headline'
  | 'pronouns'
  | 'hometown'
  | 'interests'
>

/**
 * Mask profile data based on trust level
 * Returns a new object with restricted fields set to null or empty
 */
export function maskProfileData<T extends MaskableUser>(
  user: T,
  trustLevel: number = 0,
): T {
  const unlocked = getUnlockedFields(trustLevel)
  const masked = { ...user }

  // Fields that are ALWAYS visible (Studio Identity)
  // alias, avatarUrl (Studio Avatar), headline, id

  // Level 1: Name, Major, Year (Acquaintance - 20+)
  if (!unlocked.name) {
    masked.name = null
  }
  if (!unlocked.major) {
    masked.major = null
  }
  if (!unlocked.year) {
    masked.year = null
  }

  // Level 2: Bio, Interests (Friend - 50+)
  if (!unlocked.bio) {
    masked.bio = 'Choose to connect and build trust to see more about this student.'
  }
  if (!unlocked.interests) {
    masked.interests = []
  }

  // Level 3: Pronouns, Hometown (Close Friend - 80+)
  if (!unlocked.contactInfo) {
    // Note: Contact info might be handled via specific fields in future
    masked.pronouns = null
    masked.hometown = null
  }

  return masked
}

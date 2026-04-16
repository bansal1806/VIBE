import { getSupabaseBrowserClient } from './supabase/client'
import { getSupabaseServerClient } from './supabase/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export const STORAGE_BUCKETS = {
    avatars: 'avatars',
    media: 'media',
    timecapsules: 'timecapsules',
} as const

type BucketName = keyof typeof STORAGE_BUCKETS

interface UploadOptions {
    bucket: BucketName
    userId: string
    file: File | Blob
    filename?: string
    optimize?: boolean
}

interface UploadResult {
    url: string
    path: string
    publicUrl: string
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
    return file.size <= maxSize
}

/**
 * Generate unique filename
 */
function generateFilename(userId: string, originalName: string): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    return `${userId}/${timestamp}-${randomStr}.${extension}`
}

/**
 * Compress and optimize image
 */
async function optimizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Resize if too large
                const MAX_DIMENSION = 1920
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = (height / width) * MAX_DIMENSION
                        width = MAX_DIMENSION
                    } else {
                        width = (width / height) * MAX_DIMENSION
                        height = MAX_DIMENSION
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Failed to create blob'))
                        }
                    },
                    'image/jpeg',
                    0.85 // Quality
                )
            }
            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Upload file to Supabase Storage (client-side)
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { bucket, userId, file, filename, optimize = true } = options

    // Validate file
    if (file instanceof File) {
        if (!validateFileSize(file)) {
            throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        }

        if (bucket === 'avatars' || bucket === 'media') {
            const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
            if (!validateFileType(file, allowedTypes)) {
                throw new Error('Invalid file type')
            }
        }
    }

    // Optimize image if needed
    let uploadBlob: Blob = file
    if (optimize && file instanceof File && ALLOWED_IMAGE_TYPES.includes(file.type)) {
        try {
            uploadBlob = await optimizeImage(file)
        } catch (error) {
            console.warn('[storage] Image optimization failed, using original:', error)
            uploadBlob = file
        }
    }

    // Generate path
    const path = filename || generateFilename(userId, file instanceof File ? file.name : 'upload')

    const supabase = getSupabaseBrowserClient()

    // Upload to Supabase
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .upload(path, uploadBlob, {
            cacheControl: '3600',
            upsert: false,
        })

    if (error) {
        console.error('[storage] Upload failed:', error)
        throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .getPublicUrl(data.path)

    return {
        url: urlData.publicUrl,
        path: data.path,
        publicUrl: urlData.publicUrl,
    }
}

/**
 * Upload avatar (convenience function)
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    return uploadFile({
        bucket: 'avatars',
        userId,
        file,
        optimize: true,
    })
}

/**
 * Upload media for messages/rooms (convenience function)
 */
export async function uploadMedia(userId: string, file: File): Promise<UploadResult> {
    return uploadFile({
        bucket: 'media',
        userId,
        file,
        optimize: file.type.startsWith('image/'),
    })
}

/**
 * Upload timecapsule media (convenience function)
 */
export async function uploadTimecapsuleMedia(userId: string, file: File): Promise<UploadResult> {
    return uploadFile({
        bucket: 'timecapsules',
        userId,
        file,
        optimize: file.type.startsWith('image/'),
    })
}

/**
 * Delete file from storage (server-side)
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<void> {
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.storage.from(STORAGE_BUCKETS[bucket]).remove([path])

    if (error) {
        console.error('[storage] Delete failed:', error)
        throw new Error(`Delete failed: ${error.message}`)
    }
}

/**
 * Get signed URL for private files (server-side)
 */
export async function getSignedUrl(
    bucket: BucketName,
    path: string,
    expiresIn: number = 3600
): Promise<string> {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .createSignedUrl(path, expiresIn)

    if (error) {
        console.error('[storage] Failed to create signed URL:', error)
        throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
}

/**
 * List files in a user's folder (server-side)
 */
export async function listUserFiles(
    bucket: BucketName,
    userId: string
): Promise<{ name: string; size: number; createdAt: string }[]> {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.storage.from(STORAGE_BUCKETS[bucket]).list(userId)

    if (error) {
        console.error('[storage] List failed:', error)
        throw new Error(`List failed: ${error.message}`)
    }

    return (
        data?.map((file) => ({
            name: file.name,
            size: file.metadata?.size ?? 0,
            createdAt: file.created_at,
        })) ?? []
    )
}

import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getSession()
        if (!session?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const bucket = formData.get('bucket') as 'avatars' | 'media' | 'timecapsules'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!bucket || !['avatars', 'media', 'timecapsules'].includes(bucket)) {
            return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
        }

        // Upload file
        const result = await uploadFile({
            bucket,
            userId: session.id,
            file,
            optimize: file.type.startsWith('image/'),
        })

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error: any) {
        console.error('[upload] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}

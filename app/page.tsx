import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import NexusLanding from '@/components/landing/NexusLanding'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('vibe_session')?.value

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      redirect('/app')
    }
  }

  return <NexusLanding />
}

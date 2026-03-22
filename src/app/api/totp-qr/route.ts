import { getUser } from '@/lib/auth/user'
import { totpQrCodeDataUrl } from '@/lib/auth/totp'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { user } = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const uri = searchParams.get('uri')
  if (!uri) return NextResponse.json({ error: 'Missing uri' }, { status: 400 })

  const dataUrl = await totpQrCodeDataUrl(uri)
  return NextResponse.json({ dataUrl })
}

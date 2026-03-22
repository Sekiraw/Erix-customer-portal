'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyTotpCode } from '@/lib/auth/totp'
import type { User } from '@/payload-types'

export type TwoFactorState = { error?: string }

const copy = {
  noPending: {
    en: 'Session expired. Please sign in again.',
    hu: 'A munkamenet lejárt. Kérjük, jelentkezzen be újra.',
  },
  required: { en: 'Please enter the 6-digit code.', hu: 'Adja meg a 6 jegyű kódot.' },
  invalid: {
    en: 'Invalid code. Please try again.',
    hu: 'Érvénytelen kód. Kérjük, próbálja újra.',
  },
  generic: { en: 'Verification failed. Please try again.', hu: 'Hiba történt. Próbálja újra.' },
} as const

export async function verifyTwoFactorAction(
  _prev: TwoFactorState | void,
  formData: FormData,
): Promise<TwoFactorState | void> {
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'hu'
  const code = formData.get('code')?.toString().trim().replace(/\s/g, '')

  if (!code) return { error: copy.required[locale] }

  const jar = await cookies()
  const pendingToken = jar.get('payload-2fa-pending')?.value

  if (!pendingToken) return { error: copy.noPending[locale] }

  // Decode the user ID from the Payload JWT to look up the secret
  let userId: number
  try {
    const [, payloadB64] = pendingToken.split('.')
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    userId = decoded.id
  } catch {
    jar.delete('payload-2fa-pending')
    return { error: copy.generic[locale] }
  }

  const payload = await getPayload({ config })

  let user: User
  try {
    user = await payload.findByID({
      collection: 'users',
      id: userId,
      overrideAccess: true,
    })
  } catch {
    jar.delete('payload-2fa-pending')
    return { error: copy.generic[locale] }
  }

  if (!user.twoFactorSecret || !verifyTotpCode(user.twoFactorSecret, code)) {
    return { error: copy.invalid[locale] }
  }

  // TOTP valid — promote the pending token to the real session cookie
  // Re-login to get a fresh token with full expiry
  const exp = (() => {
    try {
      const [, b64] = pendingToken.split('.')
      const decoded = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'))
      return decoded.exp ? new Date(decoded.exp * 1000) : undefined
    } catch {
      return undefined
    }
  })()

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(exp ? { expires: exp } : {}),
  }

  jar.set('payload-token', pendingToken, cookieOpts)
  jar.set('payload-2fa-ok', '1', cookieOpts)
  jar.delete('payload-2fa-pending')

  redirect('/admin')
}

'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyTotpCode } from '@/lib/auth/totp'

export type SetupMfaState = { error?: string }

const copy = {
  noPending: {
    en: 'Session expired. Please log in again.',
    hu: 'A munkamenet lejárt. Kérjük, jelentkezzen be újra.',
  },
  invalidCode: {
    en: 'Invalid code. Please try again.',
    hu: 'Érvénytelen kód. Kérjük, próbálja újra.',
  },
  generic: {
    en: 'Something went wrong. Please try again.',
    hu: 'Hiba történt. Kérjük, próbálja újra.',
  },
} as const

/** Decode the payload portion of a JWT without verifying signature. */
function decodeJwtPayload(token: string): { id: string; exp?: number } | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = Buffer.from(part, 'base64url').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function completeMfaSetupAction(
  _prev: SetupMfaState | void,
  formData: FormData,
): Promise<SetupMfaState | void> {
  const jar = await cookies()
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'hu'

  const pendingToken = jar.get('payload-mfa-setup')?.value
  if (!pendingToken) return { error: copy.noPending[locale] }

  const secret = formData.get('secret')?.toString()
  const code = formData.get('code')?.toString().trim().replace(/\s/g, '')

  if (!secret || !code) return { error: copy.invalidCode[locale] }
  if (!verifyTotpCode(secret, code)) return { error: copy.invalidCode[locale] }

  const decoded = decodeJwtPayload(pendingToken)
  if (!decoded?.id) return { error: copy.generic[locale] }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'users',
      id: decoded.id,
      data: { twoFactorEnabled: true, twoFactorSecret: secret },
      overrideAccess: true,
    })
  } catch {
    return { error: copy.generic[locale] }
  }

  const exp = decoded.exp ? new Date(decoded.exp * 1000) : undefined
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }

  jar.delete('payload-mfa-setup')
  jar.set('payload-token', pendingToken, { ...cookieOpts, ...(exp ? { expires: exp } : {}) })
  jar.set('payload-2fa-ok', '1', { ...cookieOpts, ...(exp ? { expires: exp } : {}) })

  redirect('/admin')
}

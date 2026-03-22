'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUser } from '@/lib/auth/user'
import { generateTotpSecret, verifyTotpCode } from '@/lib/auth/totp'
import type { User } from '@/payload-types'

export type SetupState = { error?: string; success?: boolean }

const copy = {
  notLoggedIn: { en: 'You must be logged in.', hu: 'Be kell jelentkezve lennie.' },
  invalidCode: {
    en: 'Invalid code. Scan the QR code again and try once more.',
    hu: 'Érvénytelen kód. Olvassa be újra a QR-kódot, és próbálja újra.',
  },
  generic: { en: 'Something went wrong. Please try again.', hu: 'Hiba történt. Próbálja újra.' },
} as const

/** Step 1: generate a new secret and return it for QR display (does NOT save yet). */
export async function generateTwoFactorSetupAction(): Promise<{
  secret: string
  uri: string
} | null> {
  const { user } = await getUser()
  if (!user) return null
  return generateTotpSecret((user as User).email)
}

/** Step 2: user confirms the code — save secret and enable 2FA. */
export async function enableTwoFactorAction(
  _prev: SetupState | void,
  formData: FormData,
): Promise<SetupState | void> {
  const { user } = await getUser()
  if (!user) return { error: copy.notLoggedIn['hu'] }

  const secret = formData.get('secret')?.toString()
  const code = formData.get('code')?.toString().trim().replace(/\s/g, '')
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'hu'

  if (!secret || !code) return { error: copy.invalidCode[locale] }

  if (!verifyTotpCode(secret, code)) {
    return { error: copy.invalidCode[locale] }
  }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'users',
      id: (user as User).id,
      data: { twoFactorEnabled: true, twoFactorSecret: secret },
      overrideAccess: true,
    })
  } catch {
    return { error: copy.generic['hu'] }
  }

  revalidatePath('/account/2fa')
  return { success: true }
}

/** Disable 2FA for the current user. */
export async function disableTwoFactorAction(
  _prev: SetupState | void,
  formData: FormData,
): Promise<SetupState | void> {
  const { user } = await getUser()
  if (!user) return { error: copy.notLoggedIn['hu'] }

  const code = formData.get('code')?.toString().trim().replace(/\s/g, '')
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'hu'
  const typedUser = user as User

  if (!code || !typedUser.twoFactorSecret || !verifyTotpCode(typedUser.twoFactorSecret, code)) {
    return { error: copy.invalidCode[locale] }
  }

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'users',
      id: typedUser.id,
      data: { twoFactorEnabled: false, twoFactorSecret: null },
      overrideAccess: true,
    })
  } catch {
    return { error: copy.generic[locale] }
  }

  revalidatePath('/account/2fa')
  return { success: true }
}

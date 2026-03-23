'use server'

import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export type ResetPasswordState = {
  error?: string
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = (formData.get('token') as string | null) ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const confirm = (formData.get('confirm') as string | null) ?? ''

  if (!token) return { error: 'Érvénytelen visszaállítási link.' }
  if (password.length < 8) return { error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' }
  if (password !== confirm) return { error: 'A két jelszó nem egyezik.' }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'users',
    where: { resetPasswordToken: { equals: token } },
    limit: 1,
    overrideAccess: true,
  })

  if (docs.length === 0) return { error: 'Érvénytelen vagy lejárt visszaállítási link.' }

  const user = docs[0]!

  const expiresAt = user.resetPasswordTokenExpiresAt
    ? new Date(user.resetPasswordTokenExpiresAt as string)
    : null

  if (!expiresAt || expiresAt < new Date()) {
    return { error: 'A visszaállítási link lejárt. Kérjen újat.' }
  }

  // Use payload.resetPassword() — this is the only local API method that
  // properly hashes the password. payload.update({ password }) stores plain text.
  await payload.resetPassword({
    collection: 'users',
    data: { token, password },
    overrideAccess: true,
  })

  // Clear our custom expiry field (resetPassword already clears resetPasswordToken)
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { resetPasswordTokenExpiresAt: null } as never,
    overrideAccess: true,
  })

  redirect('/login?passwordReset=1')
}

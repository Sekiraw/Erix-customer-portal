'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'

export type LoginState = { error?: string }

const copy = {
  required: { en: 'Email and password are required.', hu: 'Az e-mail és jelszó megadása kötelező.' },
  invalid: { en: 'Invalid email or password.', hu: 'Hibás e-mail cím vagy jelszó.' },
  generic: { en: 'Login failed. Please try again.', hu: 'Bejelentkezés sikertelen. Próbálja újra.' },
} as const

export async function loginAction(
  _prev: LoginState | void,
  formData: FormData,
): Promise<LoginState | void> {
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'hu'

  if (!email || !password) return { error: copy.required[locale] }

  const payload = await getPayload({ config })

  let loginResult: Awaited<ReturnType<typeof payload.login>>
  try {
    loginResult = await payload.login({ collection: 'users', data: { email, password } })
  } catch {
    return { error: copy.invalid[locale] }
  }

  if (!loginResult?.token) return { error: copy.generic[locale] }

  // Fetch the full user document — loginResult.user may omit custom fields
  const user = await payload.findByID({
    collection: 'users',
    id: loginResult.user.id,
    overrideAccess: true,
  }) as User

  const token = loginResult.token
  const exp = loginResult.exp ? new Date(loginResult.exp * 1000) : undefined
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
  const jar = await cookies()

  if (user.twoFactorEnabled) {
    // Park the valid token until the TOTP step is completed
    jar.set('payload-2fa-pending', token, { ...cookieOpts, maxAge: 5 * 60 })
    redirect('/login/2fa')
  }

  // No 2FA required — grant session and mark auth as complete
  jar.set('payload-token', token, { ...cookieOpts, ...(exp ? { expires: exp } : {}) })
  jar.set('payload-2fa-ok', '1', { ...cookieOpts, ...(exp ? { expires: exp } : {}) })

  redirect('/admin')
}

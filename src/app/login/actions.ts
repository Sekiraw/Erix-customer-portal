'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'
import { sendFailedLoginAttemptsEmail } from '@/lib/email/service'

export type LoginState = { error?: string }

const FAILED_LOGIN_ALERT_THRESHOLD = 5

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
    // Increment failed attempt counter for this email (if account exists)
    void trackFailedLogin(payload, email)
    return { error: copy.invalid[locale] }
  }

  if (!loginResult?.token) return { error: copy.generic[locale] }

  // Fetch the full user document — loginResult.user may omit custom fields
  const user = await payload.findByID({
    collection: 'users',
    id: loginResult.user.id,
    overrideAccess: true,
  }) as User

  // Reset failed login counter on successful authentication
  if ((user.failedLoginAttempts ?? 0) > 0) {
    void payload.update({
      collection: 'users',
      id: user.id,
      data: { failedLoginAttempts: 0, lastFailedLoginAt: null } as never,
      overrideAccess: true,
    })
  }

  const token = loginResult.token
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
  const jar = await cookies()

  if (user.twoFactorEnabled) {
    // Destroy any existing session before the 2FA step.
    // Without this, a user with a still-valid payload-token + payload-2fa-ok
    // from a previous session could skip the 2FA page by navigating directly
    // to /admin — those stale cookies would still satisfy the middleware.
    jar.delete('payload-token')
    jar.delete('payload-2fa-ok')
    // Park the new token until TOTP is verified
    jar.set('payload-2fa-pending', token, { ...cookieOpts, maxAge: 5 * 60 })
    redirect('/login/2fa')
  }

  // MFA not yet configured — force setup before granting a session
  jar.set('payload-mfa-setup', token, { ...cookieOpts, maxAge: 5 * 60 })
  redirect('/login/setup-mfa')
}

async function trackFailedLogin(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  email: string,
): Promise<void> {
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  if (docs.length === 0) return

  const user = docs[0]!
  const attempts = ((user.failedLoginAttempts as number | null) ?? 0) + 1

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { failedLoginAttempts: attempts, lastFailedLoginAt: new Date().toISOString() } as never,
    overrideAccess: true,
  })

  // Send notification at the threshold and every multiple thereafter
  if (attempts % FAILED_LOGIN_ALERT_THRESHOLD === 0) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const resetUrl = `${appUrl}/forgot-password`
    await sendFailedLoginAttemptsEmail(
      { firstName: user.firstName, lastName: user.lastName, email: user.email },
      attempts,
      resetUrl,
    )
  }
}

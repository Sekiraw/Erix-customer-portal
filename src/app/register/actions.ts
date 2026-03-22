'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendRegistrationConfirmationEmail } from '@/lib/email/service'

export type RegisterState = {
  error?: string
}

const TERMS_VERSION = '1.0'
/** Verification token is valid for 24 hours */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

const copy = {
  required: { en: 'All fields are required.', hu: 'Minden mező kötelező.' },
  mismatch: { en: 'Passwords must match.', hu: 'A jelszavaknak egyezniük kell.' },
  termsRequired: {
    en: 'You must accept the Terms and Conditions.',
    hu: 'El kell fogadnia az Általános Szerződési Feltételeket.',
  },
  emailTaken: {
    en: 'This email address is already registered.',
    hu: 'Ez az e-mail cím már regisztrálva van.',
  },
  passwordWeak: {
    en: 'Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character.',
    hu: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, és tartalmaznia kell nagybetűt, kisbetűt, számot és speciális karaktert.',
  },
  generic: {
    en: 'Registration failed. Please try again.',
    hu: 'A regisztráció sikertelen. Kérjük, próbálja újra.',
  },
} as const

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

export async function registerAction(
  _prevState: RegisterState | void,
  formData: FormData,
): Promise<RegisterState | void> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const firstName = formData.get('firstName')?.toString().trim()
  const lastName = formData.get('lastName')?.toString().trim()
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()
  const termsAccepted = formData.get('termsAccepted') === 'on'
  const locale = formData.get('locale')?.toString() === 'en' ? 'en' : 'hu'

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return { error: copy.required[locale] }
  }
  if (!termsAccepted) {
    return { error: copy.termsRequired[locale] }
  }
  if (password !== confirmPassword) {
    return { error: copy.mismatch[locale] }
  }
  if (!isStrongPassword(password)) {
    return { error: copy.passwordWeak[locale] }
  }

  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
  })
  if (totalDocs > 0) {
    return { error: copy.emailTaken[locale] }
  }

  const ip =
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    requestHeaders.get('x-real-ip') ??
    'unknown'

  const verificationToken = randomBytes(32).toString('hex')
  const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString()

  try {
    await payload.create({
      collection: 'users',
      data: {
        firstName,
        lastName,
        email,
        password,
        role: 'customer',
        termsAcceptedAt: new Date().toISOString(),
        termsAcceptedIp: ip,
        termsVersion: TERMS_VERSION,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: tokenExpiresAt,
      },
      overrideAccess: true,
    })

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
    const verificationUrl = `${appUrl}/api/verify-email?token=${verificationToken}`

    await sendRegistrationConfirmationEmail({ email, firstName, lastName }, verificationUrl)
  } catch (err) {
    console.error('registration error', err)
    return { error: copy.generic[locale] }
  }

  redirect('/register/check-email')
}

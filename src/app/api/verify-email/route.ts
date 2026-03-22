import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendRegistrationSuccessEmail, notifyAllEmployeesByEmail } from '@/lib/email/service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    redirect('/register/verify?error=missing-token')
  }

  const payload = await getPayload({ config })

  // Find the user with this token
  const { docs } = await payload.find({
    collection: 'users',
    where: { emailVerificationToken: { equals: token } },
    overrideAccess: true,
    limit: 1,
  })

  const user = docs[0]

  if (!user) {
    redirect('/register/verify?error=invalid-token')
  }

  if (user.emailVerified) {
    redirect('/register/verify?error=already-verified')
  }

  const expiresAt = user.emailVerificationTokenExpiresAt
  if (expiresAt && new Date(expiresAt) < new Date()) {
    redirect('/register/verify?error=token-expired')
  }

  // Activate the account
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    },
    overrideAccess: true,
  })

  const userData = {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }

  // Email 2 — account is now active
  await sendRegistrationSuccessEmail(userData)

  // Notify all staff + create portal notification
  await notifyAllEmployeesByEmail(userData, payload)
  await payload.create({
    collection: 'notifications',
    data: {
      type: 'new_registration',
      message: `Új ügyfél regisztrált: ${user.lastName} ${user.firstName} (${user.email})`,
      read: false,
      relatedUser: user.id,
    },
    overrideAccess: true,
  })

  // Auto-login the now-verified user — we need the password from the login endpoint,
  // but Payload's payload.login() requires the plaintext password which we don't have here.
  // Instead, generate a short-lived Payload token by calling the REST API internally.
  // Since we can't re-use the password here, we redirect to login with a success flag.
  redirect('/admin/login?verified=1')
}

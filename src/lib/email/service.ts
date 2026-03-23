import { sendEmail } from './client'
import {
  failedLoginAttemptsTemplate,
  passwordResetTemplate,
  registrationConfirmationTemplate,
  registrationSuccessTemplate,
  staffNewUserNotificationTemplate,
  type UserData,
} from './templates'

export type { UserData }

// ---------------------------------------------------------------------------
// Registration flow
// ---------------------------------------------------------------------------

/**
 * Email 1 — sent immediately after the user submits the registration form.
 * Contains the verification link the user must click to activate their account.
 */
export async function sendRegistrationConfirmationEmail(
  user: UserData,
  verificationUrl: string,
): Promise<void> {
  const { subject, html } = registrationConfirmationTemplate(user, verificationUrl)
  await sendEmail({ to: user.email, subject, html })
}

/**
 * Email 2 — sent right after auto-confirmation.
 * Tells the user their account is active and ready to use.
 */
export async function sendRegistrationSuccessEmail(user: UserData): Promise<void> {
  const { subject, html } = registrationSuccessTemplate(user)
  await sendEmail({ to: user.email, subject, html })
}

// ---------------------------------------------------------------------------
// Failed login alerts
// ---------------------------------------------------------------------------

/**
 * Notifies the account owner about multiple consecutive failed login attempts.
 * The resetUrl lets them immediately change their password if the attempts were unauthorized.
 */
export async function sendFailedLoginAttemptsEmail(
  user: UserData,
  attempts: number,
  resetUrl: string,
): Promise<void> {
  const { subject, html } = failedLoginAttemptsTemplate(user, attempts, resetUrl)
  await sendEmail({ to: user.email, subject, html })
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

/**
 * Sends a password reset link to the user.
 */
export async function sendPasswordResetEmail(user: UserData, resetUrl: string): Promise<void> {
  const { subject, html } = passwordResetTemplate(user, resetUrl)
  await sendEmail({ to: user.email, subject, html })
}

// ---------------------------------------------------------------------------
// Staff notifications
// ---------------------------------------------------------------------------

/**
 * Notifies a single staff member about the newly registered client.
 */
async function sendStaffNotificationEmail(
  newUser: UserData,
  recipient: { email: string; firstName: string; lastName: string },
): Promise<void> {
  const recipientName = `${recipient.lastName} ${recipient.firstName}`
  const { subject, html } = staffNewUserNotificationTemplate(newUser, recipientName)
  await sendEmail({ to: recipient.email, subject, html })
}

/**
 * Looks up every employee / manager / IT staff in the database and sends
 * each one a notification email about the newly registered client.
 */
export async function notifyAllEmployeesByEmail(
  newUser: UserData,
  payload: import('payload').Payload,
): Promise<void> {
  const { docs: staff } = await payload.find({
    collection: 'users',
    where: { role: { in: ['employee', 'manager', 'it_staff'] } },
    overrideAccess: true,
    limit: 200,
  })

  await Promise.all(staff.map((member) => sendStaffNotificationEmail(newUser, member)))
}

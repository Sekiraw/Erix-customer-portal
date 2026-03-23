import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10)
  const secure = process.env.SMTP_SECURE === 'true' // true only for port 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'Missing SMTP configuration. Set SMTP_HOST, SMTP_USER and SMTP_PASS in your environment.',
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

// Lazy singleton — transport is created on first use so the app still boots
// even when SMTP vars are absent (useful in CI / non-email environments).
let _transport: nodemailer.Transporter | null = null

function getTransport(): nodemailer.Transporter {
  if (!_transport) _transport = createTransport()
  return _transport
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  /** Falls back to EMAIL_FROM env var */
  from?: string
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
  const sender = from ?? process.env.EMAIL_FROM ?? 'Customer Portal <noreply@example.com>'
  const transport = getTransport()

  await transport.sendMail({
    from: sender,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}

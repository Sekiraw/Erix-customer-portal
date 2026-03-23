// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

function layout(title: string, body: string): string {
  const appUrl = process.env.APP_URL ?? '#'
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;border-radius:12px 12px 0 0;padding:32px 40px 24px;border-bottom:1px solid #e4e4e7;">
              <a href="${appUrl}" style="text-decoration:none;font-size:20px;font-weight:700;color:#18181b;">
                Customer Portal
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#ffffff;border-radius:0 0 12px 12px;padding:20px 40px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:13px;color:#71717a;">
                Ez egy automatikus üzenet — kérjük, ne válaszoljon rá.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">${text}</h1>`
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">${text}</p>`
}

function button(label: string, href: string): string {
  // Table-based "bulletproof button" — works in Gmail, Outlook, Apple Mail, etc.
  return `<table cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td style="border-radius:8px;background:#22c55e;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
    </td>
  </tr>
</table>`
}

function infoBox(rows: [string, string][]): string {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#71717a;width:40%;">${label}</td>
        <td style="padding:8px 0;font-size:14px;color:#18181b;font-weight:500;">${value}</td>
      </tr>`,
    )
    .join('')
  return `<table cellpadding="0" cellspacing="0" width="100%"
    style="border:1px solid #e4e4e7;border-radius:8px;padding:4px 16px;margin:16px 0;">
    <tbody>${cells}</tbody>
  </table>`
}

// ---------------------------------------------------------------------------
// Exported templates
// ---------------------------------------------------------------------------

export type UserData = {
  firstName: string
  lastName: string
  email: string
}

/**
 * Email 1 — sent immediately on form submit.
 * Contains the verification link the user must click to activate their account.
 */
export function registrationConfirmationTemplate(
  user: UserData,
  verificationUrl: string,
): { subject: string; html: string } {
  const html = layout(
    'Regisztráció visszaigazolása',
    [
      h1('Erősítse meg e-mail címét!'),
      p(`Kedves <strong>${user.lastName} ${user.firstName}</strong>,`),
      p(
        'Köszönjük a regisztrációt! A fiókja aktiválásához kérjük, kattintson az alábbi gombra. ' +
          'A megerősítő link <strong>24 óráig</strong> érvényes.',
      ),
      button('E-mail cím megerősítése', verificationUrl),
      p(`Ha a gomb nem működik, másolja be ezt a linket a böngészőjébe:<br><a href="${verificationUrl}" style="color:#22c55e;word-break:break-all;">${verificationUrl}</a>`),
      infoBox([
        ['Név', `${user.lastName} ${user.firstName}`],
        ['E-mail', user.email],
      ]),
      p(
        'Ha nem Ön kezdeményezte ezt a regisztrációt, hagyja figyelmen kívül ezt az üzenetet — ' +
          'fiókja nem kerül aktiválásra.',
      ),
    ].join(''),
  )

  return { subject: 'E-mail cím megerősítése — Customer Portal', html }
}

/**
 * Email 2 — sent right after auto-confirmation.
 * Confirms that the account is active and ready to use.
 */
export function registrationSuccessTemplate(user: UserData): { subject: string; html: string } {
  const appUrl = process.env.APP_URL ?? '#'

  const html = layout(
    'Sikeres regisztráció',
    [
      h1('Fiókja aktiválva!'),
      p(`Kedves <strong>${user.lastName} ${user.firstName}</strong>,`),
      p(
        'Regisztrációja sikeresen megerősítésre került. Bejelentkezhet az Customer Portalra ' +
          'az alábbi gombra kattintva.',
      ),
      button('Bejelentkezés', `${appUrl}/admin/login`),
      infoBox([['E-mail', user.email]]),
      p('Köszönjük, hogy csatlakozott hozzánk!'),
    ].join(''),
  )

  return { subject: 'Sikeres regisztráció — Customer Portal', html }
}

/**
 * Failed login alert — sent when multiple consecutive failed attempts are detected.
 */
export function failedLoginAttemptsTemplate(
  user: UserData,
  attempts: number,
  resetUrl: string,
): { subject: string; html: string } {
  const html = layout(
    'Sikertelen bejelentkezési kísérletek',
    [
      h1('Gyanús bejelentkezési tevékenység'),
      p(`Kedves <strong>${user.lastName} ${user.firstName}</strong>,`),
      p(
        `Értesítjük, hogy az Ön fiókjához (<strong>${user.email}</strong>) az elmúlt időszakban ` +
          `<strong>${attempts} egymást követő sikertelen bejelentkezési kísérlet</strong> történt.`,
      ),
      p(
        'Ha nem Ön próbált bejelentkezni, javasoljuk, hogy azonnal változtassa meg jelszavát az alábbi gombra kattintva.',
      ),
      button('Jelszó megváltoztatása', resetUrl),
      p(`Ha a gomb nem működik, másolja be ezt a linket a böngészőjébe:<br><a href="${resetUrl}" style="color:#22c55e;word-break:break-all;">${resetUrl}</a>`),
      p(
        'Ha Ön próbált bejelentkezni és elfelejtette jelszavát, szintén a fenti gombbal tud újat beállítani.',
      ),
    ].join(''),
  )

  return { subject: `Sikertelen bejelentkezési kísérletek — Customer Portal`, html }
}

/**
 * Password reset — sent when user requests a password reset link.
 */
export function passwordResetTemplate(
  user: UserData,
  resetUrl: string,
): { subject: string; html: string } {
  const html = layout(
    'Jelszó visszaállítása',
    [
      h1('Jelszó visszaállítása'),
      p(`Kedves <strong>${user.lastName} ${user.firstName}</strong>,`),
      p(
        'Jelszó-visszaállítási kérést kaptunk a fiókjához. Kattintson az alábbi gombra az új jelszó beállításához. ' +
          'A link <strong>1 óráig</strong> érvényes.',
      ),
      button('Jelszó visszaállítása', resetUrl),
      p(`Ha a gomb nem működik, másolja be ezt a linket a böngészőjébe:<br><a href="${resetUrl}" style="color:#22c55e;word-break:break-all;">${resetUrl}</a>`),
      p(
        'Ha nem Ön kérte a jelszó visszaállítását, hagyja figyelmen kívül ezt az üzenetet — ' +
          'jelszava nem változik.',
      ),
    ].join(''),
  )

  return { subject: 'Jelszó visszaállítása — Customer Portal', html }
}

/**
 * Staff notification — sent to every employee / manager / IT staff.
 */
export function staffNewUserNotificationTemplate(
  newUser: UserData,
  recipientName: string,
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL ?? '#'

  const html = layout(
    'Új ügyfél regisztrált',
    [
      h1('Új ügyfél regisztrált'),
      p(`Kedves <strong>${recipientName}</strong>,`),
      p('Egy új ügyfél regisztrált az Customer Portalra. Az adatok az alábbiakban láthatók.'),
      infoBox([
        ['Név', `${newUser.lastName} ${newUser.firstName}`],
        ['E-mail', newUser.email],
        ['Regisztráció', new Date().toLocaleString('hu-HU')],
      ]),
      button('Felhasználók megtekintése', `${appUrl}/admin/collections/users`),
    ].join(''),
  )

  return {
    subject: `Új ügyfél regisztrált: ${newUser.lastName} ${newUser.firstName}`,
    html,
  }
}

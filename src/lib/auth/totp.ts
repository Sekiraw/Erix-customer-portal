import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'

const ISSUER = 'ERP Portál'

/** Generate a new TOTP secret and the otpauth:// URI for QR scanning. */
export function generateTotpSecret(userEmail: string): {
  secret: string
  uri: string
} {
  const secret = new OTPAuth.Secret()

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  })

  return {
    secret: secret.base32,
    uri: totp.toString(),
  }
}

/** Verify a 6-digit TOTP code against the stored base32 secret.
 *  Accepts one step of clock drift in each direction. */
export function verifyTotpCode(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

/** Return a data-URL PNG of the QR code for the given otpauth:// URI. */
export async function totpQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 256, margin: 2 })
}

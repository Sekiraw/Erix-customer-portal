import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateTotpSecret, totpQrCodeDataUrl } from '@/lib/auth/totp'
import SetupMfaForm from './SetupMfaForm'

const copy = {
  title: { en: 'Set up two-factor authentication', hu: 'Kétlépéses hitelesítés beállítása' },
  subtitle: {
    en: 'Your account requires two-factor authentication. Set it up now to continue.',
    hu: 'A fiókja kétlépéses hitelesítést igényel. A folytatáshoz most állítsa be.',
  },
}

function decodeEmail(token: string): string | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = Buffer.from(part, 'base64url').toString('utf-8')
    const parsed = JSON.parse(json)
    return typeof parsed.email === 'string' ? parsed.email : null
  } catch {
    return null
  }
}

export default async function SetupMfaPage() {
  const jar = await cookies()
  const pendingToken = jar.get('payload-mfa-setup')?.value
  // Middleware guarantees this is present; redirect defensively anyway
  if (!pendingToken) redirect('/login')

  const email = decodeEmail(pendingToken)
  if (!email) redirect('/login')

  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'

  const { secret, uri } = generateTotpSecret(email)
  const qrDataUrl = await totpQrCodeDataUrl(uri)

  return (
    <main className="flex min-h-screen w-full flex-col items-center px-4 py-10">
      <div className="my-auto w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-3/10 text-chart-3 text-2xl mb-2">
            🔐
          </div>
          <h1 className="text-3xl font-bold text-black">{copy.title[lang]}</h1>
          <p className="text-sm text-black/60">{copy.subtitle[lang]}</p>
        </div>

        <SetupMfaForm lang={lang} secret={secret} qrDataUrl={qrDataUrl} />
      </div>
    </main>
  )
}

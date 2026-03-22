import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUser } from '@/lib/auth/user'
import type { User } from '@/payload-types'
import TwoFactorSetupClient from './TwoFactorSetupClient'

const copy = {
  title: { en: 'Two-factor authentication', hu: 'Kétlépéses hitelesítés' },
  subtitle: {
    en: 'Protect your account with a time-based one-time password (TOTP). Works with Google Authenticator, Microsoft Authenticator, Authy, Duo, and any compatible app.',
    hu: 'Védje fiókját egyszer használatos időalapú jelszóval (TOTP). Kompatibilis: Google Authenticator, Microsoft Authenticator, Authy, Duo és minden kompatibilis alkalmazás.',
  },
}

export default async function TwoFactorSetupPage() {
  const { user } = await getUser()
  if (!user) redirect('/login')

  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'
  const typedUser = user as User

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black">{copy.title[lang]}</h1>
            <p className="text-sm text-black/60">{copy.subtitle[lang]}</p>
          </div>

          <TwoFactorSetupClient
            enabled={typedUser.twoFactorEnabled ?? false}
            qrDataUrl={null}
            secret={null}
          />

          <div className="mt-8">
            <a href="/admin" className="text-sm text-black/50 hover:underline">
              ← {lang === 'hu' ? 'Vissza az irányítópultra' : 'Back to dashboard'}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

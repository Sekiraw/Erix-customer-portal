import { headers } from 'next/headers'
import TwoFactorForm from './TwoFactorForm'


const copy = {
  title: { en: 'Two-factor authentication', hu: 'Kétlépéses hitelesítés' },
  subtitle: {
    en: 'Open your authenticator app and enter the code shown for this account.',
    hu: 'Nyissa meg a hitelesítő alkalmazást, és írja be a fiókjához tartozó kódot.',
  },
}

export default async function TwoFactorPage() {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-120 items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-6 flex flex-col items-center text-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-chart-3/10 text-chart-3 text-2xl mb-2">
              🔐
            </div>
            <h1 className="text-3xl font-bold text-black">{copy.title[lang]}</h1>
            <p className="text-sm text-black/60">{copy.subtitle[lang]}</p>
          </div>

          <TwoFactorForm lang={lang} />
        </div>
      </div>
    </main>
  )
}

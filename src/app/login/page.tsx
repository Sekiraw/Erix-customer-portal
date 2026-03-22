import { headers } from 'next/headers'
import LoginForm from './LoginForm'

const copy = {
  title: { en: 'Sign in', hu: 'Bejelentkezés' },
  subtitle: { en: 'Welcome back to the portal.', hu: 'Üdvözöljük vissza a portálon.' },
  noAccount: { en: "Don't have an account?", hu: 'Még nincs fiókja?' },
  register: { en: 'Register', hu: 'Regisztráció' },
  verified: {
    en: 'Your email has been verified. You can now sign in.',
    hu: 'Az e-mail cím megerősítve. Bejelentkezhet.',
  },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>
}) {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'
  const { verified } = await searchParams

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-120 items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-black">{copy.title[lang]}</h1>
            <p className="text-md text-black/70">{copy.subtitle[lang]}</p>
          </div>

          {verified === '1' && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {copy.verified[lang]}
            </div>
          )}

          <LoginForm lang={lang} />

          <p className="mt-6 text-sm text-black/60 text-center">
            {copy.noAccount[lang]}{' '}
            <a href="/register" className="text-chart-3 font-medium hover:underline">
              {copy.register[lang]}
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

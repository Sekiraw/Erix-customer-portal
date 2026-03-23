import { headers } from 'next/headers'
import LoginForm from './LoginForm'

const copy = {
  title: { en: 'Sign in', hu: 'Bejelentkezés' },
  subtitle: { en: 'Welcome back to the portal.', hu: 'Üdvözöljük vissza a portálon.' },
  noAccount: { en: "Don't have an account?", hu: 'Még nincs fiókja?' },
  register: { en: 'Register', hu: 'Regisztráció' },
  forgotPassword: { en: 'Forgot password?', hu: 'Elfelejtette jelszavát?' },
  verified: {
    en: 'Your email has been verified. You can now sign in.',
    hu: 'Az e-mail cím megerősítve. Bejelentkezhet.',
  },
  passwordReset: {
    en: 'Your password has been reset. You can now sign in.',
    hu: 'A jelszava sikeresen visszaállítva. Bejelentkezhet.',
  },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; passwordReset?: string }>
}) {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'
  const { verified, passwordReset } = await searchParams

  return (
    <main className="flex min-h-screen w-full flex-col items-center px-4 py-10">
      <div className="my-auto w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">{copy.title[lang]}</h1>
          <p className="text-sm text-black/70">{copy.subtitle[lang]}</p>
        </div>

        {verified === '1' && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {copy.verified[lang]}
          </div>
        )}

        {passwordReset === '1' && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {copy.passwordReset[lang]}
          </div>
        )}

        <LoginForm lang={lang} />

        <p className="mt-4 text-sm text-black/60 text-center">
          <a href="/forgot-password" className="text-chart-3 font-medium hover:underline">
            {copy.forgotPassword[lang]}
          </a>
        </p>

        <p className="mt-4 text-sm text-black/60 text-center">
          {copy.noAccount[lang]}{' '}
          <a href="/register" className="text-chart-3 font-medium hover:underline">
            {copy.register[lang]}
          </a>
        </p>
      </div>
    </main>
  )
}

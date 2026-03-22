import { headers } from 'next/headers'
import RegisterForm from './RegisterForm'

const copy = {
  title: { en: 'Registration', hu: 'Regisztráció' },
  subtitle: {
    en: 'Create a customer account to access the portal.',
    hu: 'Hozzon létre ügyfélfiókot a portál eléréséhez.',
  },
  loginLink: { en: 'Already have an account?', hu: 'Már van fiókja?' },
  loginLinkAnchor: { en: 'Sign in', hu: 'Bejelentkezés' },
}

export default async function RegisterPage() {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-black">
              <h1 className="text-3xl font-bold mb-4">{copy.title[lang]}</h1>
              <p className="text-md mt-1">{copy.subtitle[lang]}</p>
            </div>
          </div>

          <RegisterForm />

          <p className="mt-6 text-sm text-black/60 text-center">
            {copy.loginLink[lang]}{' '}
            <a href="/login" className="text-chart-3 font-medium hover:underline">
              {copy.loginLinkAnchor[lang]}
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

import { headers } from 'next/headers'
import ForgotPasswordForm from './ForgotPasswordForm'

const copy = {
  title: { en: 'Forgot password', hu: 'Elfelejtett jelszó' },
  subtitle: {
    en: "Enter your email and we'll send you a reset link.",
    hu: 'Adja meg az e-mail címét, és küldünk egy visszaállítási linket.',
  },
  back: { en: 'Back to login', hu: 'Vissza a bejelentkezéshez' },
}

export default async function ForgotPasswordPage() {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'

  return (
    <main className="flex min-h-screen w-full flex-col items-center px-4 py-10">
      <div className="my-auto w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">{copy.title[lang]}</h1>
          <p className="text-sm text-black/70">{copy.subtitle[lang]}</p>
        </div>

        <ForgotPasswordForm lang={lang} />

        <p className="mt-6 text-sm text-black/60 text-center">
          <a href="/login" className="text-chart-3 font-medium hover:underline">
            {copy.back[lang]}
          </a>
        </p>
      </div>
    </main>
  )
}

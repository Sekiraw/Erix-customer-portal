import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ResetPasswordForm from './ResetPasswordForm'

const copy = {
  title: { en: 'Set new password', hu: 'Új jelszó beállítása' },
  subtitle: { en: 'Enter your new password below.', hu: 'Adja meg az új jelszavát.' },
  invalidLink: {
    en: 'This reset link is invalid or has expired.',
    hu: 'Ez a visszaállítási link érvénytelen vagy lejárt.',
  },
  requestNew: { en: 'Request a new one', hu: 'Kérjen újat' },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'
  const { token } = await searchParams

  if (!token) redirect('/forgot-password')

  return (
    <main className="flex min-h-screen w-full flex-col items-center px-4 py-10">
      <div className="my-auto w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-black">{copy.title[lang]}</h1>
          <p className="text-sm text-black/70">{copy.subtitle[lang]}</p>
        </div>

        <ResetPasswordForm lang={lang} token={token} />
      </div>
    </main>
  )
}

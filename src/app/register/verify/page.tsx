import { headers } from 'next/headers'
import Link from 'next/link'

type ErrorCode = 'missing-token' | 'invalid-token' | 'already-verified' | 'token-expired'

const errors: Record<ErrorCode, { en: string; hu: string }> = {
  'missing-token': {
    en: 'No verification token was provided.',
    hu: 'Nem érkezett megerősítő token.',
  },
  'invalid-token': {
    en: 'This verification link is invalid.',
    hu: 'Ez a megerősítő link érvénytelen.',
  },
  'already-verified': {
    en: 'Your email address has already been verified. You can log in.',
    hu: 'Az e-mail cím már korábban megerősítésre került. Bejelentkezhet.',
  },
  'token-expired': {
    en: 'This verification link has expired. Please register again.',
    hu: 'A megerősítő link lejárt. Kérjük, regisztráljon újra.',
  },
}

const copy = {
  title: { en: 'Verification failed', hu: 'Sikertelen megerősítés' },
  fallback: {
    en: 'Something went wrong during verification.',
    hu: 'Hiba történt a megerősítés során.',
  },
  login: { en: 'Go to login', hu: 'Bejelentkezés' },
  register: { en: 'Register again', hu: 'Újra regisztráció' },
}

export default async function VerifyErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'
  const { error } = await searchParams
  const errorCode = error as ErrorCode | undefined
  const message =
    (errorCode && errors[errorCode]?.[lang]) ?? copy.fallback[lang]
  const alreadyVerified = errorCode === 'already-verified'

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-8 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 text-3xl">
              ✕
            </div>
            <h1 className="text-3xl font-bold text-black">{copy.title[lang]}</h1>
            <p className="text-base text-black/70">{message}</p>
          </div>

          <div className="flex flex-col gap-3 text-center">
            {alreadyVerified ? (
              <Link
                href="/admin/login"
                className="inline-flex w-full items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold hover:bg-chart-3/90 transition-colors"
              >
                {copy.login[lang]}
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold hover:bg-chart-3/90 transition-colors"
              >
                {copy.register[lang]}
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

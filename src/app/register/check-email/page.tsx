import { headers } from 'next/headers'
import Link from 'next/link'

const copy = {
  title: { en: 'Check your email', hu: 'Ellenőrizze e-mailjét' },
  body: {
    en: 'We sent a confirmation link to your email address. Click the link to activate your account.',
    hu: 'Megerősítő linket küldtünk az e-mail címére. A fiókja aktiválásához kattintson a levélben lévő linkre.',
  },
  note: {
    en: 'The link is valid for 24 hours. If you don\'t see the email, check your spam folder.',
    hu: 'A link 24 óráig érvényes. Ha nem találja az e-mailt, ellenőrizze a spam mappáját.',
  },
  back: { en: 'Back to registration', hu: 'Vissza a regisztrációhoz' },
}

export default async function CheckEmailPage() {
  const acceptLang = (await headers()).get('accept-language')?.toLowerCase() ?? ''
  const lang = acceptLang.startsWith('en') ? 'en' : 'hu'

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[480px] items-center">
        <div className="w-full p-10 text-foreground">
          <div className="mb-8 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-3xl">
              ✉
            </div>
            <h1 className="text-3xl font-bold text-black">{copy.title[lang]}</h1>
            <p className="text-base text-black/70">{copy.body[lang]}</p>
            <p className="text-sm text-black/50">{copy.note[lang]}</p>
          </div>

          <div className="text-center">
            <Link href="/register" className="text-sm text-chart-3 font-medium hover:underline">
              {copy.back[lang]}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { completeMfaSetupAction, type SetupMfaState } from './actions'

const labels = {
  scanTitle: { en: 'Scan with your authenticator app', hu: 'Olvassa be a hitelesítő alkalmazással' },
  scanHint: {
    en: 'Works with Google Authenticator, Microsoft Authenticator, Authy, Duo, 1Password, and any TOTP-compatible app.',
    hu: 'Kompatibilis: Google Authenticator, Microsoft Authenticator, Authy, Duo, 1Password és minden TOTP-alkalmazás.',
  },
  confirmTitle: { en: 'Confirm setup', hu: 'Megerősítés' },
  confirmHint: {
    en: 'Enter the 6-digit code from your app to confirm.',
    hu: 'Írja be a 6 jegyű kódot az alkalmazásból a megerősítéshez.',
  },
  codePlaceholder: { en: '000000', hu: '000000' },
  confirmBtn: { en: 'Confirm & continue', hu: 'Megerősítés és folytatás' },
  confirmBtnPending: { en: 'Saving...', hu: 'Mentés...' },
} as const

function SubmitButton({ lang }: { lang: 'en' | 'hu' }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-chart-3/90"
    >
      {pending ? labels.confirmBtnPending[lang] : labels.confirmBtn[lang]}
    </button>
  )
}

export default function SetupMfaForm({
  lang,
  secret,
  qrDataUrl,
}: {
  lang: 'en' | 'hu'
  secret: string
  qrDataUrl: string
}) {
  const [state, action] = useActionState(completeMfaSetupAction, {} as SetupMfaState)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-black mb-1">{labels.scanTitle[lang]}</p>
        <p className="text-xs text-black/50 mb-4">{labels.scanHint[lang]}</p>
        <img
          src={qrDataUrl}
          alt="2FA QR code"
          width={200}
          height={200}
          className="rounded-lg border border-border"
        />
      </div>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={lang} />
        <input type="hidden" name="secret" value={secret} />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-black" htmlFor="code">
            {labels.confirmTitle[lang]}
          </label>
          <p className="text-xs text-black/50">{labels.confirmHint[lang]}</p>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9 ]*"
            maxLength={7}
            required
            autoComplete="one-time-code"
            placeholder={labels.codePlaceholder[lang]}
            className="h-12 text-center text-2xl font-mono tracking-widest text-black w-full px-3 rounded-md border border-border bg-input"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton lang={lang} />
      </form>
    </div>
  )
}

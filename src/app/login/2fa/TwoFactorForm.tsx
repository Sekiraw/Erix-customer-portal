'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { verifyTwoFactorAction, type TwoFactorState } from './actions'

type Lang = 'en' | 'hu'

const labels = {
  code: { en: 'Authenticator code', hu: 'Hitelesítő kód' },
  hint: {
    en: 'Enter the 6-digit code from your authenticator app.',
    hu: 'Adja meg a 6 jegyű kódot a hitelesítő alkalmazásból.',
  },
  submit: { en: 'Verify', hu: 'Ellenőrzés' },
  submitPending: { en: 'Verifying...', hu: 'Ellenőrzés...' },
  back: { en: 'Back to login', hu: 'Vissza a bejelentkezéshez' },
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full hover:cursor-pointer items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold border border-chart-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-chart-3/90"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export default function TwoFactorForm({ lang }: { lang: Lang }) {
  const [state, formAction] = useActionState(verifyTwoFactorAction, {} as TwoFactorState)

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="locale" value={lang} />

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="code">
          {labels.code[lang]}
        </label>
        <p className="text-sm text-black/60">{labels.hint[lang]}</p>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9 ]*"
          maxLength={7}
          required
          autoComplete="one-time-code"
          autoFocus
          className="h-12 text-center text-2xl font-mono tracking-widest text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} />

      <div className="text-center">
        <a href="/login" className="text-sm text-black/60 hover:underline">
          {labels.back[lang]}
        </a>
      </div>
    </form>
  )
}

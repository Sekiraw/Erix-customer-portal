'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { forgotPasswordAction, type ForgotPasswordState } from './actions'

type Lang = 'en' | 'hu'

const labels = {
  email: { en: 'Email', hu: 'E-mail cím' },
  submit: { en: 'Send reset link', hu: 'Visszaállítási link küldése' },
  submitPending: { en: 'Sending...', hu: 'Küldés...' },
  success: {
    en: 'If an account with that email exists, you will receive a reset link shortly.',
    hu: 'Ha létezik fiók ezzel az e-mail címmel, hamarosan megkapja a visszaállítási linket.',
  },
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

export default function ForgotPasswordForm({ lang }: { lang: Lang }) {
  const [state, formAction] = useActionState(forgotPasswordAction, {} as ForgotPasswordState)

  if (state?.success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        {labels.success[lang]}
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="email">
          {labels.email[lang]}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} />
    </form>
  )
}

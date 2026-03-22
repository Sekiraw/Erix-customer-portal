'use client'

import React, { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction, type LoginState } from './actions'

type Lang = 'en' | 'hu'

const labels = {
  email: { en: 'Email', hu: 'E-mail' },
  password: { en: 'Password', hu: 'Jelszó' },
  submit: { en: 'Sign in', hu: 'Bejelentkezés' },
  submitPending: { en: 'Signing in...', hu: 'Bejelentkezés...' },
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

export default function LoginForm({ lang }: { lang: Lang }) {
  const [state, formAction] = useActionState(loginAction, {} as LoginState)

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="locale" value={lang} />

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
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="password">
          {labels.password[lang]}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} />
    </form>
  )
}

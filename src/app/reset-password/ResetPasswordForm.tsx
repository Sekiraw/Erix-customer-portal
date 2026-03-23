'use client'

import React, { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetPasswordAction, type ResetPasswordState } from './actions'

type Lang = 'en' | 'hu'

const labels = {
  password: { en: 'New password', hu: 'Új jelszó' },
  confirm: { en: 'Confirm password', hu: 'Jelszó megerősítése' },
  submit: { en: 'Set new password', hu: 'Jelszó beállítása' },
  submitPending: { en: 'Saving...', hu: 'Mentés...' },
  strength: {
    weak: { en: 'Weak', hu: 'Gyenge' },
    fair: { en: 'Fair', hu: 'Közepes' },
    good: { en: 'Good', hu: 'Jó' },
    strong: { en: 'Strong', hu: 'Erős' },
  },
  rules: {
    en: 'At least 8 characters, one uppercase letter, one number.',
    hu: 'Legalább 8 karakter, egy nagybetű, egy szám.',
  },
}

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score as 0 | 1 | 2 | 3 | 4
}

const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
const strengthLabels: Array<keyof typeof labels.strength> = ['weak', 'weak', 'fair', 'good', 'strong']

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

export default function ResetPasswordForm({ lang, token }: { lang: Lang; token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, {} as ResetPasswordState)
  const [password, setPassword] = useState('')
  const strength = getStrength(password)

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="password">
          {labels.password[lang]}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />

        {password.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-black/60">
              {labels.strength[strengthLabels[strength]][lang]}
            </span>
          </div>
        )}

        <p className="text-xs text-black/50">{labels.rules[lang]}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="confirm">
          {labels.confirm[lang]}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} />
    </form>
  )
}

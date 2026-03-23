'use client'

import React, { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { registerAction, type RegisterState } from './actions'

const initialState: RegisterState = {}

type Lang = 'en' | 'hu'

const labels = {
  firstName: { en: 'First Name', hu: 'Keresztnév' },
  lastName: { en: 'Last Name', hu: 'Vezetéknév' },
  email: { en: 'Email', hu: 'E-mail' },
  password: { en: 'Password', hu: 'Jelszó' },
  confirmPassword: { en: 'Confirm Password', hu: 'Jelszó megerősítése' },
  submit: { en: 'Register', hu: 'Regisztráció' },
  submitPending: { en: 'Registering...', hu: 'Regisztráció...' },
  terms: {
    en: 'I have read and accept the Terms and Conditions.',
    hu: 'Elolvastam és elfogadom az Általános Szerződési Feltételeket.',
  },
  passwordRequirementsTitle: {
    en: 'Password requirements:',
    hu: 'Jelszó követelmények:',
  },
} as const

const passwordRules = [
  {
    key: 'min8',
    test: (p: string) => p.length >= 8,
    label: { en: 'At least 8 characters', hu: 'Legalább 8 karakter' },
  },
  {
    key: 'uppercase',
    test: (p: string) => /[A-Z]/.test(p),
    label: { en: 'At least one uppercase letter', hu: 'Legalább egy nagybetű' },
  },
  {
    key: 'lowercase',
    test: (p: string) => /[a-z]/.test(p),
    label: { en: 'At least one lowercase letter', hu: 'Legalább egy kisbetű' },
  },
  {
    key: 'number',
    test: (p: string) => /[0-9]/.test(p),
    label: { en: 'At least one number', hu: 'Legalább egy szám' },
  },
  {
    key: 'special',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    label: {
      en: 'At least one special character',
      hu: 'Legalább egy speciális karakter',
    },
  },
] as const

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

export default function RegisterForm({ lang }: { lang: Lang }) {

  const [state, formAction] = useActionState(registerAction, initialState)
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)

  const inputClass =
    'h-12 text-base text-black w-full px-3 rounded-md border border-border bg-input'

  return (
    <form action={formAction} className="flex flex-col gap-6 w-full">
      <input type="hidden" name="locale" value={lang} />

      {/* Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-base text-black" htmlFor="lastName">
            {labels.lastName[lang]}
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base text-black" htmlFor="firstName">
            {labels.firstName[lang]}
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
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
          className={inputClass}
        />
      </div>

      {/* Password */}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          className={inputClass}
        />
        {/* Live password requirements */}
        {(passwordTouched || password.length > 0) && (
          <ul className="mt-1 flex flex-col gap-1">
            <li className="text-xs text-black/60">{labels.passwordRequirementsTitle[lang]}</li>
            {passwordRules.map((rule) => {
              const met = rule.test(password)
              return (
                <li
                  key={rule.key}
                  className={`text-xs flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-red-500'}`}
                >
                  <span>{met ? '✓' : '✗'}</span>
                  {rule.label[lang]}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-2">
        <label className="text-base text-black" htmlFor="confirmPassword">
          {labels.confirmPassword[lang]}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3">
        <input
          id="termsAccepted"
          name="termsAccepted"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-chart-3 cursor-pointer"
        />
        <label htmlFor="termsAccepted" className="text-sm text-black cursor-pointer leading-snug">
          {labels.terms[lang]}
        </label>
      </div>

      {/* Server-side error */}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex w-full">
        <SubmitButton label={labels.submit[lang]} pendingLabel={labels.submitPending[lang]} />
      </div>
    </form>
  )
}

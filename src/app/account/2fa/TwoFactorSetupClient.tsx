'use client'

import React, { useActionState, useState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import {
  generateTwoFactorSetupAction,
  enableTwoFactorAction,
  type SetupState,
} from './actions'

const labels = {
  statusEnabled: { en: '2FA is enabled', hu: 'A 2FA engedélyezve van' },
  statusDisabled: { en: '2FA is not enabled', hu: 'A 2FA nincs engedélyezve' },
  enableBtn: { en: 'Enable 2FA', hu: '2FA bekapcsolása' },
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
  confirmBtn: { en: 'Confirm & enable', hu: 'Megerősítés és bekapcsolás' },
  confirmBtnPending: { en: 'Saving...', hu: 'Mentés...' },
  successEnabled: { en: '2FA has been enabled.', hu: 'A 2FA engedélyezve lett.' },
  cancel: { en: 'Cancel', hu: 'Mégse' },
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center px-4 py-3 rounded-md bg-chart-3 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-chart-3/90"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export default function TwoFactorSetupClient({
  lang,
  enabled,
  qrDataUrl: initialQr,
  secret: initialSecret,
}: {
  lang: 'en' | 'hu'
  enabled: boolean
  qrDataUrl: string | null
  secret: string | null
}) {

  const [mode, setMode] = useState<'idle' | 'setup'>('idle')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(initialQr)
  const [secret, setSecret] = useState<string | null>(initialSecret)
  const [isPending, startTransition] = useTransition()

  const [enableState, enableAction] = useActionState(enableTwoFactorAction, {} as SetupState)

  const handleStartSetup = () => {
    startTransition(async () => {
      const result = await generateTwoFactorSetupAction()
      if (result) {
        // Fetch the QR as a data URL via a separate server-side call
        const res = await fetch(`/api/totp-qr?uri=${encodeURIComponent(result.uri)}`)
        const { dataUrl } = await res.json()
        setQrDataUrl(dataUrl)
        setSecret(result.secret)
        setMode('setup')
      }
    })
  }

  if (enableState?.success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        {labels.successEnabled[lang]}
      </div>
    )
  }

  if (mode === 'idle') {
    return (
      <div className="flex flex-col gap-4">
        <div
          className={`flex items-center gap-2 text-sm font-medium ${enabled ? 'text-green-600' : 'text-black/50'}`}
        >
          <span>{enabled ? '✓' : '○'}</span>
          <span>{enabled ? labels.statusEnabled[lang] : labels.statusDisabled[lang]}</span>
        </div>

        {!enabled && (
          <button
            onClick={handleStartSetup}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-chart-3 text-white text-sm font-semibold hover:bg-chart-3/90 transition-colors disabled:opacity-60"
          >
            {labels.enableBtn[lang]}
          </button>
        )}
      </div>
    )
  }

  // setup mode
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-black mb-1">{labels.scanTitle[lang]}</p>
        <p className="text-xs text-black/50 mb-4">{labels.scanHint[lang]}</p>
        {qrDataUrl && (
          <img
            src={qrDataUrl}
            alt="2FA QR code"
            width={200}
            height={200}
            className="rounded-lg border border-border"
          />
        )}
      </div>

      <form action={enableAction} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={lang} />
        <input type="hidden" name="secret" value={secret ?? ''} />

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

        {enableState?.error && <p className="text-sm text-red-600">{enableState.error}</p>}

        <SubmitButton
          label={labels.confirmBtn[lang]}
          pendingLabel={labels.confirmBtnPending[lang]}
        />
        <button
          type="button"
          onClick={() => setMode('idle')}
          className="text-sm text-black/50 hover:underline"
        >
          {labels.cancel[lang]}
        </button>
      </form>
    </div>
  )
}

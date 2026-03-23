import '@/app/(payload)/custom.css'
import '@/styles/payloadStyles.css'

export const metadata = {
  title: 'Jelszó visszaállítása — Customer Portal',
  description: 'Új jelszó beállítása',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  )
}

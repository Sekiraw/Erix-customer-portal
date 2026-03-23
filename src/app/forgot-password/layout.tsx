import '@/app/(payload)/custom.css'
import '@/styles/payloadStyles.css'

export const metadata = {
  title: 'Elfelejtett jelszó — Customer Portal',
  description: 'Jelszó visszaállítása',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  )
}

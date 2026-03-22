import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ── 1. Redirect Payload's built-in login to our 2FA-aware login ─────────
  if (pathname === '/admin/login') {
    const destination = new URL('/login', request.url)
    destination.search = search
    return NextResponse.redirect(destination)
  }

  // ── 2. Guard /admin/* ────────────────────────────────────────────────────
  // Every admin route (except the login redirect above) requires BOTH:
  //   • payload-token  — a valid Payload session
  //   • payload-2fa-ok — proof the user went through our full auth flow
  //
  // If payload-token is present but payload-2fa-ok is missing, the user
  // either has a stale pre-2FA session or bypassed the 2FA step.
  // Force them back to login and clear the orphaned token.
  if (pathname.startsWith('/admin')) {
    const hasToken = request.cookies.has('payload-token')
    const has2faOk = request.cookies.has('payload-2fa-ok')

    if (hasToken && !has2faOk) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('payload-token')
      return response
    }
  }

  // ── 3. Guard /login/2fa — must have a pending cookie to get here ─────────
  if (pathname === '/login/2fa') {
    const hasPending = request.cookies.has('payload-2fa-pending')
    if (!hasPending) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login/2fa'],
}

import { auth } from '@/lib/auth/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard']
const ADMIN_ROUTES = ['/dashboard/schema-forge', '/dashboard/team']
const AUTH_ROUTES = ['/login']

export default auth(function middleware(req) {
  const { nextUrl, auth: session } = req as typeof req & { auth: { user?: { role?: string } } | null }
  const isLoggedIn = !!session?.user
  const userRole = session?.user?.role

  const isProtected = PROTECTED_ROUTES.some(r => nextUrl.pathname.startsWith(r))
  const isAdminOnly = ADMIN_ROUTES.some(r => nextUrl.pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => nextUrl.pathname.startsWith(r))

  // Redirect logged in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect unauthenticated users to login
  if (isProtected && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  // RBAC: Admin-only routes
  if (isAdminOnly && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

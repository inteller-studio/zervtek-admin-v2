import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { type Role } from '@/lib/rbac/types'
import {
  isPublicRoute,
  hasRouteAccess,
} from '@/lib/rbac/permissions'
import { AUTH_CONSTANTS } from '@/lib/constants'

const { ACCESS_TOKEN_COOKIE, USER_DATA_COOKIE } = AUTH_CONSTANTS

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for access token
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check role-based access
  const userDataCookie = request.cookies.get(USER_DATA_COOKIE)?.value

  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie)
      const userRoles: Role[] = userData.role || []

      if (!hasRouteAccess(userRoles, pathname)) {
        return NextResponse.redirect(new URL('/forbidden', request.url))
      }
    } catch {
      // Invalid cookie data, continue to client-side handling
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
}

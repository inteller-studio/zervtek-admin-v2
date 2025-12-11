import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  type Role,
  type RoutePermission,
  ROLES,
} from '@/lib/rbac/types'

const ACCESS_TOKEN_COOKIE = 'thisisjustarandomstring'
const USER_DATA_COOKIE = 'user_data'

// Public routes (no auth required)
const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-in-2',
  '/sign-up',
  '/forgot-password',
  '/otp',
]

// Role group shortcuts
const ALL_ROLES: Role[] = Object.values(ROLES) as Role[]
const SALES_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF]
const FINANCE_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT]
const CONTENT_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CONTENT_MANAGER]
const MANAGEMENT_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER]
const ADMIN_ONLY: Role[] = [ROLES.ADMIN]

// Route permissions configuration (duplicated here for middleware - Edge runtime compatibility)
const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/', roles: ALL_ROLES, exact: true },
  { path: '/dashboard', roles: ALL_ROLES },
  { path: '/auctions', roles: SALES_ROLES },
  { path: '/purchases', roles: SALES_ROLES },
  { path: '/bids', roles: SALES_ROLES },
  { path: '/stock-vehicles', roles: SALES_ROLES },
  { path: '/invoices', roles: FINANCE_ROLES },
  { path: '/requests', roles: FINANCE_ROLES },
  { path: '/tv-display', roles: FINANCE_ROLES },
  { path: '/payments', roles: FINANCE_ROLES },
  { path: '/blogs', roles: CONTENT_ROLES },
  { path: '/admin/makes', roles: CONTENT_ROLES },
  { path: '/admin/models', roles: CONTENT_ROLES },
  { path: '/customers', roles: MANAGEMENT_ROLES },
  { path: '/users', roles: ADMIN_ONLY },
  { path: '/settings', roles: ALL_ROLES },
  { path: '/security', roles: ALL_ROLES },
  { path: '/help-center', roles: ALL_ROLES },
  { path: '/forbidden', roles: ALL_ROLES },
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

function getRoutePermission(pathname: string): RoutePermission | null {
  const exactMatch = ROUTE_PERMISSIONS.find(
    (p) => p.exact && p.path === pathname
  )
  if (exactMatch) return exactMatch

  const prefixMatches = ROUTE_PERMISSIONS
    .filter((p) => !p.exact && pathname.startsWith(p.path))
    .sort((a, b) => b.path.length - a.path.length)

  return prefixMatches[0] || null
}

function hasRouteAccess(userRoles: Role[], pathname: string): boolean {
  if (isPublicRoute(pathname)) return true

  const permission = getRoutePermission(pathname)
  if (!permission) return true

  return userRoles.some((role) => permission.roles.includes(role))
}

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

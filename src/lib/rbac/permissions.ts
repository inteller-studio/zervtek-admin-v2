import { type Role, type RoutePermission, ROLES, ROLE_HIERARCHY } from './types'

// Role group shortcuts
const ALL_ROLES: Role[] = Object.values(ROLES) as Role[]
const SALES_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_STAFF]
const FINANCE_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT]
const CONTENT_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.CONTENT_MANAGER]
const MANAGEMENT_ROLES: Role[] = [ROLES.ADMIN, ROLES.MANAGER]
const ADMIN_ONLY: Role[] = [ROLES.ADMIN]

// Route permissions configuration
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard - All roles
  { path: '/', roles: ALL_ROLES, exact: true },
  { path: '/dashboard', roles: ALL_ROLES },

  // Sales section
  { path: '/auctions', roles: SALES_ROLES },
  { path: '/purchases', roles: SALES_ROLES },
  { path: '/bids', roles: SALES_ROLES },
  { path: '/stock-vehicles', roles: SALES_ROLES },

  // Services/Finance section
  { path: '/invoices', roles: FINANCE_ROLES },
  { path: '/requests', roles: FINANCE_ROLES },
  { path: '/tv-display', roles: FINANCE_ROLES },
  { path: '/payments', roles: FINANCE_ROLES },

  // Content section
  { path: '/blogs', roles: CONTENT_ROLES },
  { path: '/admin/makes', roles: CONTENT_ROLES },
  { path: '/admin/models', roles: CONTENT_ROLES },

  // Users section
  { path: '/customers', roles: MANAGEMENT_ROLES },
  { path: '/users', roles: ADMIN_ONLY },

  // System section - All roles
  { path: '/settings', roles: ALL_ROLES },
  { path: '/security', roles: ALL_ROLES },

  // Forbidden page - All roles (must be accessible to show error)
  { path: '/forbidden', roles: ALL_ROLES },
]

// Public routes (no auth required)
export const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-in-2',
  '/sign-up',
  '/forgot-password',
  '/otp',
]

// Check if route is public
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

// Find permission config for a given path
export function getRoutePermission(pathname: string): RoutePermission | null {
  // First try exact match
  const exactMatch = ROUTE_PERMISSIONS.find(
    (p) => p.exact && p.path === pathname
  )
  if (exactMatch) return exactMatch

  // Then try prefix match (longest path first)
  const prefixMatches = ROUTE_PERMISSIONS
    .filter((p) => !p.exact && pathname.startsWith(p.path))
    .sort((a, b) => b.path.length - a.path.length)

  return prefixMatches[0] || null
}

// Check if user has access to route
export function hasRouteAccess(userRoles: Role[], pathname: string): boolean {
  if (isPublicRoute(pathname)) return true

  const permission = getRoutePermission(pathname)
  if (!permission) return true // No permission defined = accessible

  return userRoles.some((role) => permission.roles.includes(role))
}

// Check if user has any of the required roles
export function hasRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return userRoles.some((role) => requiredRoles.includes(role))
}

// Check if user has higher or equal role in hierarchy
export function hasMinimumRole(userRoles: Role[], minimumRole: Role): boolean {
  const minimumLevel = ROLE_HIERARCHY[minimumRole]
  return userRoles.some((role) => ROLE_HIERARCHY[role] >= minimumLevel)
}

// Export role groups for use in components
export {
  ALL_ROLES,
  SALES_ROLES,
  FINANCE_ROLES,
  CONTENT_ROLES,
  MANAGEMENT_ROLES,
  ADMIN_ONLY,
}

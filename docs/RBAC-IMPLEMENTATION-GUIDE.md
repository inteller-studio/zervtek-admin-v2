# RBAC Implementation Guide for Zervtek Admin Dashboard

## Overview

This guide covers implementing **Role-Based Access Control (RBAC)** for the dashboard with:
- **5 Roles**: admin, manager, sales_staff, accountant, content_manager
- **Hierarchy**: Admin > Manager > Staff-level roles
- **Frontend Mock** authentication (no real backend)
- **Dual protection**: Middleware (server) + Component (client)

---

## Role Access Matrix

| Route | Admin | Manager | Sales Staff | Accountant | Content Manager |
|-------|-------|---------|-------------|------------|-----------------|
| Dashboard `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auctions `/auctions` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Won Auctions `/won-auctions` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Bids `/bids` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Stock Vehicles `/stock-vehicles` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invoices `/invoices` | ✅ | ✅ | ❌ | ✅ | ❌ |
| Requests `/requests` | ✅ | ✅ | ❌ | ✅ | ❌ |
| Payments `/payments` | ✅ | ✅ | ❌ | ✅ | ❌ |
| Blogs `/blogs` | ✅ | ✅ | ❌ | ❌ | ✅ |
| SEO `/admin/makes`, `/admin/models` | ✅ | ✅ | ❌ | ❌ | ✅ |
| Customers `/customers` | ✅ | ✅ | ❌ | ❌ | ❌ |
| User Management `/users` | ✅ | ❌ | ❌ | ❌ | ❌ |
| Settings `/settings/*` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Security `/security` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Help Center `/help-center` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## File Structure

```
src/
├── lib/
│   └── rbac/
│       ├── types.ts           # Role, Permission types
│       ├── permissions.ts     # Route permissions config & helpers
│       ├── filter-sidebar.ts  # Sidebar filtering logic
│       └── mock-users.ts      # Mock user data for testing
├── hooks/
│   └── use-rbac.ts           # React hook for RBAC
├── components/
│   └── auth/
│       ├── protected-route.tsx  # Route wrapper component
│       └── require-role.tsx     # Conditional render component
├── stores/
│   └── auth-store.ts         # Updated with Role types
├── middleware.ts             # Server-side route protection
└── app/
    └── (dashboard)/
        ├── layout.tsx        # Updated with ProtectedRoute
        └── forbidden/
            └── page.tsx      # 403 page
```

---

## Implementation Steps

### Step 1: Create RBAC Types

**File**: `/src/lib/rbac/types.ts`

```typescript
import { type LucideIcon } from 'lucide-react'

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_STAFF: 'sales_staff',
  ACCOUNTANT: 'accountant',
  CONTENT_MANAGER: 'content_manager',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Role hierarchy (higher number = higher authority)
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 4,
  manager: 3,
  sales_staff: 2,
  accountant: 2,
  content_manager: 2,
}

// Route access configuration type
export type RoutePermission = {
  path: string
  roles: Role[]
  exact?: boolean
}

// Sidebar item with role requirements
export type RBACNavItem = {
  title: string
  url?: string
  icon?: LucideIcon
  badge?: string
  roles?: Role[]
  items?: RBACNavItem[]
}

export type RBACNavGroup = {
  title: string
  items: RBACNavItem[]
  roles?: Role[]
}
```

---

### Step 2: Create Permissions Configuration

**File**: `/src/lib/rbac/permissions.ts`

```typescript
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
  { path: '/won-auctions', roles: SALES_ROLES },
  { path: '/bids', roles: SALES_ROLES },
  { path: '/stock-vehicles', roles: SALES_ROLES },

  // Services/Finance section
  { path: '/invoices', roles: FINANCE_ROLES },
  { path: '/requests', roles: FINANCE_ROLES },
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
  { path: '/help-center', roles: ALL_ROLES },
]

// Public routes (no auth required)
export const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/otp',
]

// Check if route is public
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

// Find permission config for a given path
export function getRoutePermission(pathname: string): RoutePermission | null {
  // First try exact match
  const exactMatch = ROUTE_PERMISSIONS.find(
    p => p.exact && p.path === pathname
  )
  if (exactMatch) return exactMatch

  // Then try prefix match (longest path first)
  const prefixMatches = ROUTE_PERMISSIONS
    .filter(p => !p.exact && pathname.startsWith(p.path))
    .sort((a, b) => b.path.length - a.path.length)

  return prefixMatches[0] || null
}

// Check if user has access to route
export function hasRouteAccess(userRoles: Role[], pathname: string): boolean {
  if (isPublicRoute(pathname)) return true

  const permission = getRoutePermission(pathname)
  if (!permission) return true // No permission defined = accessible

  return userRoles.some(role => permission.roles.includes(role))
}

// Check if user has any of the required roles
export function hasRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role))
}

// Check if user has higher or equal role in hierarchy
export function hasMinimumRole(userRoles: Role[], minimumRole: Role): boolean {
  const minimumLevel = ROLE_HIERARCHY[minimumRole]
  return userRoles.some(role => ROLE_HIERARCHY[role] >= minimumLevel)
}

// Export role groups for use in components
export { ALL_ROLES, SALES_ROLES, FINANCE_ROLES, CONTENT_ROLES, MANAGEMENT_ROLES, ADMIN_ONLY }
```

---

### Step 3: Create RBAC Hook

**File**: `/src/hooks/use-rbac.ts`

```typescript
'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { type Role, ROLES, ROLE_HIERARCHY } from '@/lib/rbac/types'
import {
  hasRole,
  hasMinimumRole,
  hasRouteAccess,
  getRoutePermission,
} from '@/lib/rbac/permissions'

export function useRBAC() {
  const { auth } = useAuthStore()
  const userRoles = (auth.user?.role || []) as Role[]

  return useMemo(() => ({
    // Current user roles
    roles: userRoles,

    // Check if user has specific role(s)
    hasRole: (requiredRoles: Role | Role[]) => {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
      return hasRole(userRoles, roles)
    },

    // Check if user meets minimum role level
    hasMinimumRole: (minimumRole: Role) => {
      return hasMinimumRole(userRoles, minimumRole)
    },

    // Check route access
    canAccessRoute: (pathname: string) => {
      return hasRouteAccess(userRoles, pathname)
    },

    // Convenience booleans
    isAdmin: hasRole(userRoles, [ROLES.ADMIN]),
    isManagerOrAbove: hasMinimumRole(userRoles, ROLES.MANAGER),

    // Get highest role level
    highestRoleLevel: Math.max(
      0,
      ...userRoles.map(role => ROLE_HIERARCHY[role] || 0)
    ),

    // Get permission config for route
    getRoutePermission,
  }), [userRoles])
}

// Shorthand hook for checking specific roles
export function useCanAccess(requiredRoles: Role | Role[]): boolean {
  const { hasRole } = useRBAC()
  return hasRole(requiredRoles)
}
```

---

### Step 4: Create Mock Users

**File**: `/src/lib/rbac/mock-users.ts`

```typescript
import { type Role, ROLES } from './types'

export interface MockUser {
  id: string
  accountNo: string
  email: string
  firstName: string
  lastName: string
  role: Role[]
  exp: number
}

// Generate expiry 24 hours from now
const getExpiry = () => Date.now() + 24 * 60 * 60 * 1000

export const MOCK_USERS: Record<string, MockUser> = {
  admin: {
    id: '1',
    accountNo: 'ACC001',
    email: 'admin@zervtek.com',
    firstName: 'Admin',
    lastName: 'User',
    role: [ROLES.ADMIN],
    exp: getExpiry(),
  },
  manager: {
    id: '2',
    accountNo: 'ACC002',
    email: 'manager@zervtek.com',
    firstName: 'Manager',
    lastName: 'User',
    role: [ROLES.MANAGER],
    exp: getExpiry(),
  },
  sales: {
    id: '3',
    accountNo: 'ACC003',
    email: 'sales@zervtek.com',
    firstName: 'Sales',
    lastName: 'Staff',
    role: [ROLES.SALES_STAFF],
    exp: getExpiry(),
  },
  accountant: {
    id: '4',
    accountNo: 'ACC004',
    email: 'accountant@zervtek.com',
    firstName: 'Finance',
    lastName: 'User',
    role: [ROLES.ACCOUNTANT],
    exp: getExpiry(),
  },
  content: {
    id: '5',
    accountNo: 'ACC005',
    email: 'content@zervtek.com',
    firstName: 'Content',
    lastName: 'Manager',
    role: [ROLES.CONTENT_MANAGER],
    exp: getExpiry(),
  },
  // Multi-role user example
  multiRole: {
    id: '6',
    accountNo: 'ACC006',
    email: 'multi@zervtek.com',
    firstName: 'Multi',
    lastName: 'Role',
    role: [ROLES.SALES_STAFF, ROLES.CONTENT_MANAGER],
    exp: getExpiry(),
  },
}

export function getMockUser(userType: keyof typeof MOCK_USERS): MockUser {
  // Refresh expiry on access
  const user = { ...MOCK_USERS[userType] }
  user.exp = getExpiry()
  return user
}

export function getMockUserCredentials() {
  return Object.entries(MOCK_USERS).map(([key, user]) => ({
    key,
    email: user.email,
    password: 'password123', // All mock users use same password
    role: user.role.join(', '),
    name: `${user.firstName} ${user.lastName}`,
  }))
}
```

---

### Step 5: Update Auth Store

**File**: `/src/stores/auth-store.ts`

```typescript
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { type Role } from '@/lib/rbac/types'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_DATA_COOKIE = 'user_data'

interface AuthUser {
  accountNo: string
  email: string
  role: Role[]
  exp: number
  firstName?: string
  lastName?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''

  // Try to restore user from cookie
  const userCookie = getCookie(USER_DATA_COOKIE)
  const initUser = userCookie ? JSON.parse(userCookie) : null

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          // Sync user data to cookie for middleware access
          if (user) {
            setCookie(USER_DATA_COOKIE, JSON.stringify(user))
          } else {
            removeCookie(USER_DATA_COOKIE)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(USER_DATA_COOKIE)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
```

---

### Step 6: Create Middleware

**File**: `/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicRoute, hasRouteAccess } from '@/lib/rbac/permissions'
import { type Role } from '@/lib/rbac/types'

const ACCESS_TOKEN_COOKIE = 'thisisjustarandomstring'
const USER_DATA_COOKIE = 'user_data'

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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}
```

---

### Step 7: Create Protected Route Component

**File**: `/src/components/auth/protected-route.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useRBAC } from '@/hooks/use-rbac'
import { type Role } from '@/lib/rbac/types'
import { ForbiddenError } from '@/features/errors/forbidden'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: Role[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { auth } = useAuthStore()
  const { hasRole, canAccessRoute } = useRBAC()

  const isAuthenticated = !!auth.user && !!auth.accessToken
  const hasRequiredRole = requiredRoles
    ? hasRole(requiredRoles)
    : canAccessRoute(pathname)

  useEffect(() => {
    if (!isAuthenticated) {
      const redirectUrl = `/sign-in?redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
    }
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated) {
    return fallback || null
  }

  if (!hasRequiredRole) {
    if (redirectTo) {
      router.push(redirectTo)
      return fallback || null
    }
    return <ForbiddenError />
  }

  return <>{children}</>
}
```

---

### Step 8: Create RequireRole Component

**File**: `/src/components/auth/require-role.tsx`

```typescript
'use client'

import { type Role } from '@/lib/rbac/types'
import { useRBAC } from '@/hooks/use-rbac'

interface RequireRoleProps {
  children: React.ReactNode
  roles: Role | Role[]
  fallback?: React.ReactNode
}

/**
 * Conditionally renders children based on user role.
 * Use for hiding UI elements, not route protection.
 */
export function RequireRole({
  children,
  roles,
  fallback = null
}: RequireRoleProps) {
  const { hasRole } = useRBAC()

  if (!hasRole(roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

---

### Step 9: Create Sidebar Filter

**File**: `/src/lib/rbac/filter-sidebar.ts`

```typescript
import { type Role, type RBACNavGroup, type RBACNavItem } from './types'
import { hasRole } from './permissions'

/**
 * Filters sidebar navigation based on user roles
 */
export function filterSidebarByRole(
  navGroups: RBACNavGroup[],
  userRoles: Role[]
): RBACNavGroup[] {
  return navGroups
    .filter(group => {
      if (group.roles && !hasRole(userRoles, group.roles)) {
        return false
      }
      return true
    })
    .map(group => ({
      ...group,
      items: filterNavItems(group.items, userRoles, group.roles),
    }))
    .filter(group => group.items.length > 0)
}

function filterNavItems(
  items: RBACNavItem[],
  userRoles: Role[],
  parentRoles?: Role[]
): RBACNavItem[] {
  return items
    .filter(item => {
      const requiredRoles = item.roles || parentRoles
      if (requiredRoles && !hasRole(userRoles, requiredRoles)) {
        return false
      }
      return true
    })
    .map(item => {
      if (item.items) {
        return {
          ...item,
          items: filterNavItems(item.items, userRoles, item.roles || parentRoles),
        }
      }
      return item
    })
    .filter(item => {
      if (item.items && item.items.length === 0) {
        return false
      }
      return true
    })
}
```

---

### Step 10: Update Sidebar Data

**File**: `/src/components/layout/data/sidebar-data.ts`

Add role requirements to each navigation group and item:

```typescript
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Gavel,
  Hand,
  Trophy,
  Car,
  MessageSquare,
  Tv,
  Globe,
  Database,
  Tag,
  Shield,
  Settings,
  HelpCircle,
  Command,
} from 'lucide-react'
import { type RBACNavGroup, ROLES } from '@/lib/rbac/types'
import {
  ALL_ROLES,
  SALES_ROLES,
  FINANCE_ROLES,
  CONTENT_ROLES,
  MANAGEMENT_ROLES,
  ADMIN_ONLY
} from '@/lib/rbac/permissions'

export const sidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@zervtek.com',
    avatar: '/avatars/admin.svg',
  },
  teams: [
    {
      name: 'Zervtek',
      logo: Command,
      plan: 'Admin Panel',
    },
  ],
}

export const sidebarNavGroups: RBACNavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        // No roles = available to all authenticated users
      },
    ],
  },
  {
    title: 'Sales',
    roles: SALES_ROLES,
    items: [
      { title: 'Auctions', url: '/auctions', icon: Gavel },
      { title: 'Won Auctions', url: '/won-auctions', icon: Trophy },
      { title: 'Bids', url: '/bids', icon: Hand },
      { title: 'Stock Vehicles', url: '/stock-vehicles', icon: Car },
    ],
  },
  {
    title: 'Services',
    roles: FINANCE_ROLES,
    items: [
      { title: 'Invoice Generator', url: '/invoices', icon: FileText },
      { title: 'Requests', url: '/requests', icon: MessageSquare },
      { title: 'TV Display', url: '/requests/tv-display', icon: Tv },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Content',
    roles: CONTENT_ROLES,
    items: [
      { title: 'Blogs', url: '/blogs', icon: FileText },
      {
        title: 'SEO Management',
        icon: Globe,
        items: [
          { title: 'Makes SEO', url: '/admin/makes', icon: Database },
          { title: 'Models SEO', url: '/admin/models', icon: Tag },
        ],
      },
    ],
  },
  {
    title: 'Users',
    roles: MANAGEMENT_ROLES,
    items: [
      { title: 'Customers', url: '/customers', icon: Users },
      {
        title: 'User Management',
        url: '/users',
        icon: Shield,
        roles: ADMIN_ONLY, // Override: Admin only
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        icon: Settings,
        items: [
          { title: 'Profile', url: '/settings' },
          { title: 'Account', url: '/settings/account' },
          { title: 'Appearance', url: '/settings/appearance' },
          { title: 'Notifications', url: '/settings/notifications' },
        ],
      },
      { title: 'Security', url: '/security', icon: Shield },
      { title: 'Help Center', url: '/help-center', icon: HelpCircle },
    ],
  },
]
```

---

### Step 11: Update App Sidebar

**File**: `/src/components/layout/app-sidebar.tsx`

```typescript
'use client'

import { useMemo } from 'react'
import { useRBAC } from '@/hooks/use-rbac'
import { filterSidebarByRole } from '@/lib/rbac/filter-sidebar'
import { sidebarData, sidebarNavGroups } from './data/sidebar-data'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { roles } = useRBAC()

  // Filter navigation based on user roles
  const filteredNavGroups = useMemo(
    () => filterSidebarByRole(sidebarNavGroups, roles),
    [roles]
  )

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

---

### Step 12: Create Forbidden Page

**File**: `/src/app/(dashboard)/forbidden/page.tsx`

```typescript
import { ForbiddenError } from '@/features/errors/forbidden'

export default function ForbiddenPage() {
  return <ForbiddenError />
}
```

---

### Step 13: Update Dashboard Layout

**File**: `/src/app/(dashboard)/layout.tsx`

```typescript
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </ProtectedRoute>
  )
}
```

---

### Step 14: Update Sign-in Form for Testing

**File**: `/src/features/auth/sign-in/components/user-auth-form.tsx`

Add a development-only role selector:

```typescript
// Add imports
import { MOCK_USERS, getMockUser } from '@/lib/rbac/mock-users'
import { setCookie } from '@/lib/cookies'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Inside the component, add this before or after the form:
{process.env.NODE_ENV === 'development' && (
  <div className="space-y-2">
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Quick Login (Dev Only)
        </span>
      </div>
    </div>
    <Select
      onValueChange={(value) => {
        const user = getMockUser(value as keyof typeof MOCK_USERS)
        if (user) {
          auth.setUser(user)
          auth.setAccessToken('mock-access-token')
          setCookie('user_data', JSON.stringify(user))
          router.push('/')
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a role to login" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(MOCK_USERS).map(([key, user]) => (
          <SelectItem key={key} value={key}>
            {user.firstName} {user.lastName} ({user.role.join(', ')})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
```

---

## Usage Examples

### 1. Protecting an Entire Page

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ROLES } from '@/lib/rbac/types'

export default function AdminOnlyPage() {
  return (
    <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
      <h1>Admin Only Content</h1>
    </ProtectedRoute>
  )
}
```

### 2. Conditional UI Rendering

```tsx
import { RequireRole } from '@/components/auth/require-role'
import { ROLES } from '@/lib/rbac/types'

function UserActions({ userId }: { userId: string }) {
  return (
    <div className="flex gap-2">
      {/* Everyone can view */}
      <Button variant="outline">View</Button>

      {/* Only managers and above can edit */}
      <RequireRole roles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <Button>Edit</Button>
      </RequireRole>

      {/* Only admin can delete */}
      <RequireRole roles={ROLES.ADMIN}>
        <Button variant="destructive">Delete</Button>
      </RequireRole>
    </div>
  )
}
```

### 3. Using the Hook Directly

```tsx
import { useRBAC } from '@/hooks/use-rbac'
import { ROLES } from '@/lib/rbac/types'

function DashboardStats() {
  const { hasRole, isAdmin, roles } = useRBAC()

  return (
    <div>
      <p>Your roles: {roles.join(', ')}</p>

      {hasRole([ROLES.ADMIN, ROLES.MANAGER]) && (
        <StatsCard title="Revenue" value="$50,000" />
      )}

      {isAdmin && (
        <StatsCard title="System Health" value="OK" />
      )}
    </div>
  )
}
```

### 4. Checking Access Programmatically

```tsx
import { useRBAC } from '@/hooks/use-rbac'

function Navigation() {
  const { canAccessRoute } = useRBAC()

  const links = [
    { href: '/auctions', label: 'Auctions' },
    { href: '/invoices', label: 'Invoices' },
    { href: '/users', label: 'Users' },
  ]

  return (
    <nav>
      {links
        .filter(link => canAccessRoute(link.href))
        .map(link => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
    </nav>
  )
}
```

---

## Testing Different Roles

Use the Quick Login selector on the sign-in page (development mode only) to test each role:

| User | Email | Roles | Can Access |
|------|-------|-------|------------|
| Admin | admin@zervtek.com | admin | Everything |
| Manager | manager@zervtek.com | manager | All except User Management |
| Sales Staff | sales@zervtek.com | sales_staff | Dashboard, Sales section, System |
| Accountant | accountant@zervtek.com | accountant | Dashboard, Services section, System |
| Content Manager | content@zervtek.com | content_manager | Dashboard, Content section, System |
| Multi-Role | multi@zervtek.com | sales_staff, content_manager | Dashboard, Sales, Content, System |

---

## Key Design Decisions

1. **Dual Protection**: Server middleware catches requests early, client components provide UI feedback
2. **Role Arrays**: Users can have multiple roles for flexible permissions
3. **Hierarchical Roles**: Higher roles (admin, manager) inherit access to lower-level features
4. **Type Safety**: Full TypeScript support prevents role typos
5. **Centralized Config**: All permissions in `/src/lib/rbac/permissions.ts`
6. **Automatic Sidebar**: Navigation filters based on role automatically

---

## Extending the System

### Adding a New Role

1. Add to `ROLES` constant in `/src/lib/rbac/types.ts`
2. Add hierarchy level in `ROLE_HIERARCHY`
3. Create role group if needed in `/src/lib/rbac/permissions.ts`
4. Add to relevant `ROUTE_PERMISSIONS` entries
5. Add mock user in `/src/lib/rbac/mock-users.ts`

### Adding a New Protected Route

1. Add route permission in `ROUTE_PERMISSIONS` array
2. Add sidebar item with `roles` property if needed
3. Optionally wrap page with `<ProtectedRoute>` for additional checks

### Creating Role Groups

```typescript
// In permissions.ts
const CUSTOM_ROLES: Role[] = [ROLES.ADMIN, ROLES.CUSTOM_ROLE]

// Use in route permissions
{ path: '/custom-feature', roles: CUSTOM_ROLES }
```

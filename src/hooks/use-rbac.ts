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

  return useMemo(
    () => ({
      // Current user roles
      roles: userRoles,

      // Check if user has specific role(s)
      hasRole: (requiredRoles: Role | Role[]) => {
        const roles = Array.isArray(requiredRoles)
          ? requiredRoles
          : [requiredRoles]
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
        ...userRoles.map((role) => ROLE_HIERARCHY[role] || 0)
      ),

      // Get permission config for route
      getRoutePermission,
    }),
    [userRoles]
  )
}

// Shorthand hook for checking specific roles
export function useCanAccess(requiredRoles: Role | Role[]): boolean {
  const { hasRole } = useRBAC()
  return hasRole(requiredRoles)
}

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
  fallback = null,
}: RequireRoleProps) {
  const { hasRole } = useRBAC()

  if (!hasRole(roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

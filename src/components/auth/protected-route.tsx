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

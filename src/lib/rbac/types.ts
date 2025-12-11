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

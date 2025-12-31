import { type IconType } from 'react-icons'

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_STAFF: 'sales_staff',
  ACCOUNTANT: 'accountant',
  CONTENT_MANAGER: 'content_manager',
  BACKOFFICE_STAFF: 'backoffice_staff',
  TV_DISPLAY: 'tv_display',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Role hierarchy (higher number = higher authority)
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 4,
  manager: 3,
  sales_staff: 2,
  accountant: 2,
  content_manager: 2,
  backoffice_staff: 2,
  tv_display: 1,
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
  icon?: IconType
  badge?: string
  roles?: Role[]
  items?: RBACNavItem[]
}

export type RBACNavGroup = {
  title: string
  items: RBACNavItem[]
  roles?: Role[]
}

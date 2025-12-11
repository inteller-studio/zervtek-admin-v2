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
    .filter((group) => {
      if (group.roles && !hasRole(userRoles, group.roles)) {
        return false
      }
      return true
    })
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, userRoles, group.roles),
    }))
    .filter((group) => group.items.length > 0)
}

function filterNavItems(
  items: RBACNavItem[],
  userRoles: Role[],
  parentRoles?: Role[]
): RBACNavItem[] {
  return items
    .filter((item) => {
      const requiredRoles = item.roles || parentRoles
      if (requiredRoles && !hasRole(userRoles, requiredRoles)) {
        return false
      }
      return true
    })
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: filterNavItems(
            item.items,
            userRoles,
            item.roles || parentRoles
          ),
        }
      }
      return item
    })
    .filter((item) => {
      if (item.items && item.items.length === 0) {
        return false
      }
      return true
    })
}

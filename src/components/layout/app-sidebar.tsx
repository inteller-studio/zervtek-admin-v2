'use client'

import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import { useRBAC } from '@/hooks/use-rbac'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  sidebarNavGroups,
  sidebarTeams,
  sidebarUser,
} from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { type NavGroup as NavGroupType, type NavItem } from './types'
import { type Role } from '@/lib/rbac/types'

// Filter nav items based on user roles
function filterNavItems(
  items: NavItem[],
  userRoles: Role[],
  parentRoles?: Role[]
): NavItem[] {
  return items
    .filter((item) => {
      const requiredRoles = item.roles || parentRoles
      if (requiredRoles && requiredRoles.length > 0) {
        return userRoles.some((role) => requiredRoles.includes(role))
      }
      return true
    })
    .map((item) => {
      if ('items' in item && item.items) {
        return {
          ...item,
          items: filterNavItems(
            item.items as NavItem[],
            userRoles,
            item.roles || parentRoles
          ) as (typeof item.items)[number][],
        }
      }
      return item
    })
    .filter((item) => {
      if ('items' in item && item.items && item.items.length === 0) {
        return false
      }
      return true
    })
}

// Filter nav groups based on user roles
function filterSidebarByRole(
  navGroups: NavGroupType[],
  userRoles: Role[]
): NavGroupType[] {
  return navGroups
    .filter((group) => {
      if (group.roles && group.roles.length > 0) {
        return userRoles.some((role) => group.roles!.includes(role))
      }
      return true
    })
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, userRoles, group.roles),
    }))
    .filter((group) => group.items.length > 0)
}

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
      <SidebarHeader className='border-b border-border/50'>
        <TeamSwitcher teams={sidebarTeams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className='border-t border-border/50'>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

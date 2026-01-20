'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MdChevronRight } from 'react-icons/md'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavGroup as NavGroupProps,
} from './types'

export function NavGroup({ title: _title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarMenu className='gap-0.5'>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} pathname={pathname} />

          if (state === 'collapsed' && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} pathname={pathname} />
            )

          return <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'warning' | 'success' }) {
  return (
    <span
      className={cn(
        'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums transition-colors',
        variant === 'default' && 'bg-primary/10 text-primary',
        variant === 'warning' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        variant === 'success' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
      )}
    >
      {children}
    </span>
  )
}

function SidebarMenuLink({ item, pathname }: { item: NavLink; pathname: string }) {
  const { setOpenMobile, setOpen } = useSidebar()
  const isActive = checkIsActive(pathname, item)

  // Determine badge variant based on title (for pending approvals, use warning)
  const getBadgeVariant = () => {
    if (item.title === 'Bids') return 'warning'
    return 'default'
  }

  const handleClick = () => {
    setOpenMobile(false)
    // Collapse sidebar when navigating to WhatsApp
    if (item.url === '/whatsapp') {
      setOpen(false)
    }
    // Expand sidebar when navigating away from WhatsApp
    else if (pathname === '/whatsapp') {
      setOpen(true)
    }
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'group/nav-item relative transition-all duration-200',
          'hover:bg-muted/40',
          isActive && [
            'bg-muted/60 font-medium',
            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
            'before:h-6 before:w-[3px] before:rounded-full before:bg-primary'
          ]
        )}
      >
        <Link href={item.url} onClick={handleClick}>
          {item.icon && (
            <item.icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover/nav-item:text-foreground'
              )}
            />
          )}
          <span className={cn(
            'transition-colors duration-200',
            isActive ? 'text-foreground' : 'text-muted-foreground group-hover/nav-item:text-foreground'
          )}>
            {item.title}
          </span>
          {item.badge && <NavBadge variant={getBadgeVariant()}>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: NavCollapsible
  pathname: string
}) {
  const { setOpenMobile, setOpen } = useSidebar()
  const isParentActive = checkIsActive(pathname, item, true)

  const handleSubItemClick = (subItemUrl: string) => {
    setOpenMobile(false)
    // Expand sidebar when navigating away from WhatsApp
    if (pathname === '/whatsapp' && subItemUrl !== '/whatsapp') {
      setOpen(true)
    }
  }

  return (
    <Collapsible
      asChild
      defaultOpen={isParentActive}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={cn(
              'group/nav-item transition-all duration-200',
              'hover:bg-muted/40'
            )}
          >
            {item.icon && (
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-200',
                  'text-muted-foreground group-hover/nav-item:text-foreground'
                )}
              />
            )}
            <span className='text-muted-foreground group-hover/nav-item:text-foreground transition-colors duration-200'>
              {item.title}
            </span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <MdChevronRight className='ms-auto h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub className='border-l border-border/40 ml-3 pl-3'>
            {item.items.map((subItem) => {
              const isSubActive = checkIsActive(pathname, subItem)
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={cn(
                      'group/sub-item relative transition-all duration-200',
                      'hover:bg-muted/40',
                      isSubActive && [
                        'bg-muted/60 font-medium text-foreground',
                        'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                        'before:h-5 before:w-[2px] before:rounded-full before:bg-primary'
                      ]
                    )}
                  >
                    <Link href={subItem.url} onClick={() => handleSubItemClick(subItem.url)}>
                      {subItem.icon && (
                        <subItem.icon
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 transition-colors duration-200',
                            isSubActive
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover/sub-item:text-foreground'
                          )}
                        />
                      )}
                      <span className={cn(
                        'transition-colors duration-200',
                        isSubActive ? 'text-foreground' : 'text-muted-foreground group-hover/sub-item:text-foreground'
                      )}>
                        {subItem.title}
                      </span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  pathname,
}: {
  item: NavCollapsible
  pathname: string
}) {
  const { setOpen } = useSidebar()
  const isActive = checkIsActive(pathname, item)

  const handleSubItemClick = (subItemUrl: string) => {
    // Expand sidebar when navigating away from WhatsApp
    if (pathname === '/whatsapp' && subItemUrl !== '/whatsapp') {
      setOpen(true)
    }
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={cn(
              'group/nav-item relative transition-all duration-200',
              'hover:bg-muted/40',
              isActive && [
                'bg-muted/60',
                'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                'before:h-6 before:w-[3px] before:rounded-full before:bg-primary'
              ]
            )}
          >
            {item.icon && (
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover/nav-item:text-foreground'
                )}
              />
            )}
            <span className={cn(
              'transition-colors duration-200',
              isActive ? 'text-foreground' : 'text-muted-foreground group-hover/nav-item:text-foreground'
            )}>
              {item.title}
            </span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <MdChevronRight className='ms-auto h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='right' align='start' sideOffset={4} className='min-w-48'>
          <DropdownMenuLabel className='text-xs font-semibold text-muted-foreground'>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const isSubActive = checkIsActive(pathname, sub)
            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  href={sub.url}
                  onClick={() => handleSubItemClick(sub.url)}
                  className={cn(
                    'flex items-center gap-2 transition-colors',
                    isSubActive && 'bg-muted/60 font-medium'
                  )}
                >
                  {sub.icon && (
                    <sub.icon
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        isSubActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  )}
                  <span className='max-w-52 text-wrap'>{sub.title}</span>
                  {sub.badge && (
                    <span className='ms-auto text-[10px] font-medium text-muted-foreground'>{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(pathname: string, item: NavItem, mainNav = false) {
  return (
    pathname === item.url || // /endpoint
    pathname.split('?')[0] === item.url || // endpoint without query
    !!item?.items?.filter((i) => i.url === pathname).length || // if child nav is active
    (mainNav &&
      pathname.split('/')[1] !== '' &&
      pathname.split('/')[1] === item?.url?.split('/')[1])
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  homeHref?: string
  showHome?: boolean
  className?: string
  separator?: React.ReactNode
}

// Route label mapping for automatic breadcrumbs
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  auctions: 'Auctions',
  bids: 'Bids',
  'won-auctions': 'Purchases',
  'stock-vehicles': 'Stock Vehicles',
  customers: 'Customers',
  payments: 'Payments',
  invoices: 'Invoices',
  settings: 'Settings',
  profile: 'Profile',
  appearance: 'Appearance',
  notifications: 'Notifications',
  account: 'Account',
  display: 'Display',
  users: 'Users',
  admin: 'Admin',
  makes: 'Makes',
  models: 'Models',
  new: 'New',
  edit: 'Edit',
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Skip dynamic segments that look like IDs
    const isId = /^[0-9a-fA-F-]{8,}$/.test(segment)
    if (isId) continue

    const label = routeLabels[segment] || formatSegment(segment)
    const isLast = i === segments.length - 1

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  }

  return items
}

// Format a URL segment into a readable label
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Breadcrumbs({
  items: customItems,
  homeHref = '/dashboard',
  showHome = true,
  className,
  separator = <ChevronRight className='h-4 w-4 text-muted-foreground/50' />,
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Use custom items if provided, otherwise generate from pathname
  const items = customItems || generateBreadcrumbs(pathname)

  // Don't show breadcrumbs if only dashboard
  if (items.length === 0 || (items.length === 1 && items[0].label === 'Dashboard')) {
    return null
  }

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn('flex items-center text-sm', className)}
    >
      <ol className='flex items-center gap-1.5'>
        {showHome && (
          <>
            <li>
              <Link
                href={homeHref}
                className='flex items-center text-muted-foreground hover:text-foreground transition-colors'
                aria-label='Home'
              >
                <Home className='h-4 w-4' />
              </Link>
            </li>
            <li className='flex items-center' aria-hidden='true'>
              {separator}
            </li>
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className='text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li className='flex items-center' aria-hidden='true'>
                  {separator}
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// Hook to get breadcrumb items programmatically
export function useBreadcrumbs() {
  const pathname = usePathname()
  return generateBreadcrumbs(pathname)
}

export { generateBreadcrumbs, formatSegment }

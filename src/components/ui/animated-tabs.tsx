'use client'

import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface TabItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  badgeColor?: 'primary' | 'emerald' | 'amber' | 'red'
  isLive?: boolean
  disabled?: boolean
}

interface AnimatedTabsProps {
  tabs: TabItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'compact'
}

function AnimatedTabs({
  tabs,
  value,
  onValueChange,
  className,
  children,
  variant = 'default',
}: AnimatedTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === value)
    const activeTabElement = tabRefs.current[activeIndex]
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      })
    }
  }, [value, tabs])

  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className={cn('flex flex-col', className)}
    >
      {/* Material Design Tabs Header */}
      <div className='border-b bg-card shrink-0'>
        <div className='px-4 relative'>
          {/* Tab Buttons */}
          <div className='flex gap-1 overflow-x-auto scrollbar-none'>
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              const isActive = value === tab.id

              return (
                <button
                  key={tab.id}
                  ref={el => { tabRefs.current[index] = el }}
                  onClick={() => !tab.disabled && onValueChange(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    'relative flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap',
                    'hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variant === 'compact' ? 'px-3 py-3' : 'px-5 py-4',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {Icon && (
                    <Icon className={cn(
                      'transition-colors',
                      variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  )}
                  <span>{tab.label}</span>

                  {/* Badge */}
                  {tab.badge !== undefined && (
                    <Badge
                      variant='secondary'
                      className={cn(
                        'ml-1 h-5 min-w-5 px-1.5 text-[10px] font-semibold',
                        tab.badgeColor === 'emerald' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                        tab.badgeColor === 'amber' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                        tab.badgeColor === 'red' && 'bg-red-500/15 text-red-600 dark:text-red-400',
                        (!tab.badgeColor || tab.badgeColor === 'primary') && 'bg-primary/10 text-primary'
                      )}
                    >
                      {tab.badge}
                    </Badge>
                  )}

                  {/* Live Indicator */}
                  {tab.isLive && (
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75' />
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-purple-500' />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Animated Underline Indicator */}
          <motion.div
            className='absolute bottom-0 h-0.5 bg-primary rounded-full'
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />
        </div>
      </div>

      {children}
    </TabsPrimitive.Root>
  )
}

function AnimatedTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { AnimatedTabs, AnimatedTabsContent }

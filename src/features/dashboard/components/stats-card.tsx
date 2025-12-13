'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  loading?: boolean
  prefix?: string
  suffix?: string
  description?: string
}

export function StatsCard({
  title,
  value,
  change,
  loading = false,
  prefix = '',
  suffix = '',
  description = 'vs last month',
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue =
    typeof value === 'number' ? value : parseInt(value.replace(/\D/g, ''))

  useEffect(() => {
    if (!loading && typeof value === 'number') {
      const timer = setTimeout(() => {
        const duration = 1000
        const steps = 40
        const increment = numericValue / steps
        let current = 0
        const interval = setInterval(() => {
          current += increment
          if (current >= numericValue) {
            setDisplayValue(numericValue)
            clearInterval(interval)
          } else {
            setDisplayValue(Math.floor(current))
          }
        }, duration / steps)
        return () => clearInterval(interval)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(numericValue)
    }
  }, [numericValue, loading, value])

  const isPositive = change !== undefined && change > 0
  const isNeutral = change === undefined || change === 0

  if (loading) {
    return (
      <div className='relative overflow-hidden rounded-xl border border-border/50 bg-card p-6'>
        <div className='space-y-3'>
          <div className='h-4 w-24 animate-pulse rounded-md bg-muted-foreground/10' />
          <div className='h-9 w-32 animate-pulse rounded-md bg-muted-foreground/10' />
          <div className='h-4 w-28 animate-pulse rounded-md bg-muted-foreground/10' />
        </div>
      </div>
    )
  }

  const formattedValue = `${prefix}${displayValue.toLocaleString()}${suffix}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2 }}
      className='group'
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border bg-card p-6',
          'border-border/50 hover:border-border',
          'shadow-sm hover:shadow-md',
          'transition-all duration-300 ease-out'
        )}
      >
        {/* Subtle gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
            'bg-gradient-to-br from-primary/[0.02] to-transparent'
          )}
        />

        <div className='relative space-y-3'>
          {/* Title */}
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>

          {/* Value */}
          <motion.p
            className='text-3xl font-semibold tracking-tight text-foreground'
            key={displayValue}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formattedValue}
          </motion.p>

          {/* Change indicator */}
          <div className='flex items-center gap-2'>
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  isNeutral && 'bg-muted text-muted-foreground',
                  isPositive &&
                    'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
                  !isPositive &&
                    !isNeutral &&
                    'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className='h-3 w-3' />
                ) : !isNeutral ? (
                  <TrendingDown className='h-3 w-3' />
                ) : null}
                {isPositive ? '+' : ''}
                {change}%
              </span>
            )}
            <span className='text-xs text-muted-foreground'>{description}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { type IconType } from 'react-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: IconType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: IconType
  }
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'default',
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-6',
      icon: 'h-8 w-8',
      iconWrapper: 'h-12 w-12',
      title: 'text-sm',
      description: 'text-xs',
    },
    default: {
      container: 'py-12',
      icon: 'h-10 w-10',
      iconWrapper: 'h-16 w-16',
      title: 'text-base',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'h-12 w-12',
      iconWrapper: 'h-20 w-20',
      title: 'text-lg',
      description: 'text-sm',
    },
  }

  const s = sizes[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        s.container,
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted/50 mb-4',
          s.iconWrapper
        )}
      >
        <Icon className={cn('text-muted-foreground/70', s.icon)} />
      </div>
      <h3 className={cn('font-medium text-foreground', s.title)}>{title}</h3>
      {description && (
        <p className={cn('text-muted-foreground mt-1 max-w-sm', s.description)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          size={size === 'sm' ? 'sm' : 'default'}
          className='mt-4'
        >
          {action.icon && <action.icon className='h-4 w-4 mr-1.5' />}
          {action.label}
        </Button>
      )}
    </div>
  )
}

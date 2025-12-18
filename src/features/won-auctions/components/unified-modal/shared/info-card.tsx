'use client'

import { cn } from '@/lib/utils'

interface InfoCardProps {
  title: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function InfoCard({
  title,
  icon,
  action,
  className,
  children,
}: InfoCardProps) {
  return (
    <div className={cn('rounded-xl bg-muted/30 p-4', className)}>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          {icon && (
            <span className='text-muted-foreground'>{icon}</span>
          )}
          <h3 className='text-sm font-medium'>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

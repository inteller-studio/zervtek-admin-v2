'use client'

import { Copy, ExternalLink, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InfoRowProps {
  label: string
  value: string | React.ReactNode
  copyable?: boolean
  href?: string
  monospace?: boolean
  className?: string
}

export function InfoRow({
  label,
  value,
  copyable,
  href,
  monospace,
  className,
}: InfoRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <div className='flex items-center gap-1.5'>
        {href ? (
          <a
            href={href}
            className='font-medium text-primary hover:underline flex items-center gap-1'
            onClick={(e) => e.stopPropagation()}
          >
            {value}
            <ExternalLink className='h-3 w-3' />
          </a>
        ) : (
          <span className={cn('font-medium', monospace && 'font-mono text-sm')}>
            {value}
          </span>
        )}
        {copyable && typeof value === 'string' && (
          <button
            onClick={handleCopy}
            className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <Check className='h-3.5 w-3.5 text-emerald-500' />
            ) : (
              <Copy className='h-3.5 w-3.5' />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button, buttonVariants } from './button'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn(
        'relative',
        loading && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

// Hook for managing loading state with async operations
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)

  const withLoading = React.useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        return await fn()
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    isLoading,
    setIsLoading,
    withLoading,
  }
}

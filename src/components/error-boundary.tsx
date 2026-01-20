'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'

type ErrorLevel = 'global' | 'feature' | 'component'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: ErrorLevel
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log error with structured logging
    logger.error('Error caught by boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const level = this.props.level || 'component'

      return (
        <ErrorFallback
          error={this.state.error}
          level={level}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  level: ErrorLevel
  onRetry: () => void
  onGoHome: () => void
}

export function ErrorFallback({ error, level, onRetry, onGoHome }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV !== 'production'

  if (level === 'global') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
              <AlertTriangle className='h-8 w-8 text-destructive' />
            </div>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try again or return to the home page.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isDev && error && (
              <div className='rounded-md bg-muted p-4'>
                <p className='text-sm font-mono text-muted-foreground break-all'>
                  {error.message}
                </p>
              </div>
            )}
            <div className='flex gap-2'>
              <Button onClick={onRetry} variant='outline' className='flex-1'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Try Again
              </Button>
              <Button onClick={onGoHome} className='flex-1'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (level === 'feature') {
    return (
      <Card className='border-destructive/50'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            <CardTitle className='text-lg'>Failed to load this section</CardTitle>
          </div>
          <CardDescription>
            There was a problem loading this feature. You can try again or continue using other
            parts of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDev && error && (
            <div className='mb-4 rounded-md bg-muted p-3'>
              <p className='text-sm font-mono text-muted-foreground break-all'>
                {error.message}
              </p>
            </div>
          )}
          <Button onClick={onRetry} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Component level - minimal UI
  return (
    <div className='flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3'>
      <AlertTriangle className='h-4 w-4 text-destructive' />
      <span className='text-sm text-destructive'>Something went wrong</span>
      <Button onClick={onRetry} variant='ghost' size='sm' className='ml-auto h-7'>
        <RefreshCw className='mr-1 h-3 w-3' />
        Retry
      </Button>
    </div>
  )
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  level: ErrorLevel = 'component'
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const ComponentWithBoundary = (props: P) => (
    <ErrorBoundary level={level}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithBoundary
}

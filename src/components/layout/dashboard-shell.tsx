'use client'

import { useState, useEffect } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

interface DashboardShellProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function DashboardShell({ children, defaultOpen = true }: DashboardShellProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null during SSR to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <AuthenticatedLayout defaultOpen={defaultOpen}>
      {children}
    </AuthenticatedLayout>
  )
}

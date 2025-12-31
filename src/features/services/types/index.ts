import type { ServiceRequest } from '../../requests/data/requests'

// Type filter options
export type ServiceTypeFilter = 'all' | 'translation' | 'inspection'

// Translation status steps
export const TRANSLATION_STATUS_STEPS = [
  { key: 'pending', label: 'Requested' },
  { key: 'in_progress', label: 'Translating' },
  { key: 'completed', label: 'Completed' },
] as const

// Helper functions
export function getTimeBadgeStyle(createdAt: Date): string {
  const diffMs = new Date().getTime() - new Date(createdAt).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days >= 14) return 'text-red-500'
  if (days >= 7) return 'text-amber-500'
  return 'text-muted-foreground'
}

export function getStatusVariant(status: ServiceRequest['status']): string {
  const variants: Record<ServiceRequest['status'], string> = {
    completed: 'emerald',
    in_progress: 'blue',
    assigned: 'violet',
    pending: 'amber',
    cancelled: 'zinc',
  }
  return variants[status]
}

export function getPriorityColor(priority: ServiceRequest['priority']): string {
  const colors: Record<ServiceRequest['priority'], string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-slate-400',
  }
  return colors[priority]
}

export function getInspectionType(title: string): string {
  if (title.includes('Full Inspection')) return 'Full'
  if (title.includes('Pre-purchase')) return 'Pre-purchase'
  if (title.includes('Performance')) return 'Performance'
  if (title.includes('Condition')) return 'Condition'
  if (title.includes('Detailed')) return 'Detailed'
  return 'Inspection'
}

export function getCurrentStep(status: string): number {
  if (status === 'completed') return 2
  if (status === 'in_progress') return 1
  return 0
}

// Constants
export const MAX_TRANSLATION_CHARACTERS = 2000
export const ITEMS_PER_PAGE = 16

// Current user (would come from auth context in production)
export const CURRENT_USER_ID = 'admin1'
export const CURRENT_USER_NAME = 'Current Admin'
export const CURRENT_USER_ROLE: 'superadmin' | 'admin' | 'manager' | 'cashier' = 'admin'

'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  MdDirectionsCar,
  MdVerifiedUser,
  MdFactCheck,
  MdPerson,
  MdLocationOn,
  MdAttachMoney,
  MdAccessTime,
  MdEmail,
  MdArrowForward,
} from 'react-icons/md'
import {
  type Submission,
  type SubmissionType,
  type InquirySubmission,
  type SignupSubmission,
  type OnboardingSubmission,
  typeBadgeConfig,
  statusBadgeConfig,
  getDisplayStatus,
  getSubjectDisplay,
} from '../data/unified-leads'

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Type Badge Component
interface TypeBadgeProps {
  type: SubmissionType
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = typeBadgeConfig[type]
  const Icon = config.icon

  return (
    <Badge variant='secondary' className={cn('gap-1 text-xs', config.className)}>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  submission: Submission
}

export function StatusBadge({ submission }: StatusBadgeProps) {
  const status = getDisplayStatus(submission)
  const config = statusBadgeConfig[status] || {
    label: status,
    className: 'bg-slate-500/15 text-slate-500',
  }

  return (
    <Badge variant='secondary' className={cn('text-xs', config.className)}>
      {config.label}
    </Badge>
  )
}

// Customer Cell Component
interface CustomerCellProps {
  submission: Submission
}

export function CustomerCell({ submission }: CustomerCellProps) {
  return (
    <div className='flex items-center gap-3'>
      <Avatar className='h-8 w-8'>
        <AvatarFallback className='text-xs bg-muted'>
          {getInitials(submission.customerName)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0'>
        <p className='font-medium text-sm truncate'>{submission.customerName}</p>
        <p className='text-xs text-muted-foreground truncate'>
          {submission.customerEmail}
        </p>
      </div>
    </div>
  )
}

// Subject Cell Component - Type-specific rendering
interface SubjectCellProps {
  submission: Submission
}

export function SubjectCell({ submission }: SubjectCellProps) {
  const subject = getSubjectDisplay(submission)

  if (submission.type === 'inquiry') {
    const inquiry = submission as InquirySubmission
    return (
      <div className='flex items-center gap-2 min-w-0'>
        <MdDirectionsCar className='h-4 w-4 text-muted-foreground shrink-0' />
        <div className='min-w-0'>
          <p className='text-sm truncate max-w-[200px]'>{subject}</p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className='flex items-center gap-0.5'>
              <MdAttachMoney className='h-3 w-3' />$
              {inquiry.metadata.vehiclePrice?.toLocaleString() ?? 'N/A'}
            </span>
            <span className='text-border'>|</span>
            <span>
              {inquiry.metadata.vehicleMileage?.toLocaleString() ?? 'N/A'} km
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (submission.type === 'signup') {
    const signup = submission as SignupSubmission
    return (
      <div className='flex items-center gap-2 min-w-0'>
        <MdLocationOn className='h-4 w-4 text-muted-foreground shrink-0' />
        <div className='min-w-0'>
          <p className='text-sm truncate'>
            {signup.metadata.city
              ? `${signup.metadata.city}, `
              : ''}
            {subject}
          </p>
          {signup.metadata.company && (
            <p className='text-xs text-muted-foreground truncate'>
              {signup.metadata.company}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (submission.type === 'onboarding') {
    const onboarding = submission as OnboardingSubmission
    return (
      <div className='flex items-center gap-2 min-w-0'>
        <MdDirectionsCar className='h-4 w-4 text-muted-foreground shrink-0' />
        <div className='min-w-0'>
          <p className='text-sm truncate max-w-[200px]'>{subject}</p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className='flex items-center gap-0.5'>
              <MdLocationOn className='h-3 w-3' />
              {onboarding.metadata.destinationCountry}
            </span>
            {onboarding.metadata.scheduledDate && (
              <>
                <span className='text-border'>|</span>
                <span className='flex items-center gap-0.5'>
                  <MdAccessTime className='h-3 w-3' />
                  {onboarding.metadata.scheduledDate}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <span className='text-sm truncate'>{subject}</span>
}

// Assignee Cell Component
interface AssigneeCellProps {
  assigneeName?: string
}

export function AssigneeCell({ assigneeName }: AssigneeCellProps) {
  if (!assigneeName) {
    return (
      <span className='text-xs text-muted-foreground italic'>Unassigned</span>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      <MdPerson className='h-3.5 w-3.5 text-muted-foreground' />
      <span className='text-sm truncate'>{assigneeName}</span>
    </div>
  )
}

// Time Cell Component
interface TimeCellProps {
  date: Date
}

export function TimeCell({ date }: TimeCellProps) {
  return (
    <span className='text-xs text-muted-foreground'>
      {formatDistanceToNow(date, { addSuffix: false })}
    </span>
  )
}

// Action Cell Component
export function ActionCell() {
  return (
    <MdArrowForward className='h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity' />
  )
}

// Row border color based on status
export function getRowBorderClass(submission: Submission): string {
  const status = getDisplayStatus(submission)

  switch (status) {
    case 'new':
      return 'border-l-blue-500'
    case 'pending':
      return 'border-l-amber-500'
    case 'in_progress':
      return 'border-l-amber-500'
    case 'scheduled':
      return 'border-l-purple-500'
    default:
      return 'border-l-transparent'
  }
}

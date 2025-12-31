'use client'

import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MdAccessTime,
  MdCheckCircle,
  MdCancel,
  MdLocationOn,
  MdBusiness,
  MdCampaign,
  MdPerson,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type SignupSubmission, type SignupStatus } from '../data/submissions'

interface SignupsBoardProps {
  data: SignupSubmission[]
  onCardClick: (signup: SignupSubmission) => void
}

// Column configuration
const columnConfig: Record<SignupStatus, {
  label: string
  icon: React.ElementType
  headerClass: string
  cardBorderClass: string
  emptyMessage: string
}> = {
  pending: {
    label: 'Pending',
    icon: MdAccessTime,
    headerClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    cardBorderClass: 'hover:border-amber-500/50',
    emptyMessage: 'No pending signups',
  },
  verified: {
    label: 'Verified',
    icon: MdCheckCircle,
    headerClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    cardBorderClass: 'hover:border-emerald-500/50',
    emptyMessage: 'No verified signups',
  },
  rejected: {
    label: 'Rejected',
    icon: MdCancel,
    headerClass: 'text-red-600 dark:text-red-400 bg-red-500/10',
    cardBorderClass: 'hover:border-red-500/50',
    emptyMessage: 'No rejected signups',
  },
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Source badge colors
const sourceColors: Record<string, string> = {
  'Google Search': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'Social Media': 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  'YouTube': 'bg-red-500/15 text-red-600 dark:text-red-400',
  'Friend Referral': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Online Ad': 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  'Trade Show': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Existing Customer': 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  'Other': 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
}

interface SignupCardProps {
  signup: SignupSubmission
  onClick: () => void
  borderClass: string
}

function SignupCard({ signup, onClick, borderClass }: SignupCardProps) {
  const sourceColor = sourceColors[signup.metadata.hearAboutUs] || sourceColors['Other']

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 bg-card rounded-xl border text-left transition-all',
        'hover:shadow-md hover:bg-muted/30',
        borderClass
      )}
    >
      {/* Header with avatar and name */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {getInitials(signup.customerName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{signup.customerName}</p>
          <p className="text-xs text-muted-foreground truncate">{signup.customerEmail}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MdLocationOn className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {signup.metadata.city ? `${signup.metadata.city}, ` : ''}{signup.metadata.country}
          </span>
        </div>

        {/* Company if exists */}
        {signup.metadata.company && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MdBusiness className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{signup.metadata.company}</span>
          </div>
        )}

        {/* Source */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn('text-[10px] gap-1', sourceColor)}>
            <MdCampaign className="h-2.5 w-2.5" />
            {signup.metadata.hearAboutUs}
          </Badge>
        </div>
      </div>

      {/* Footer with time */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(signup.createdAt, { addSuffix: true })}
        </span>
        {signup.assignedToName && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MdPerson className="h-3 w-3" />
            {signup.assignedToName.split(' ')[0]}
          </div>
        )}
      </div>
    </button>
  )
}

export function SignupsBoard({ data, onCardClick }: SignupsBoardProps) {
  // Group signups by verification status
  const groupedSignups = useMemo(() => {
    const groups: Record<SignupStatus, SignupSubmission[]> = {
      pending: [],
      verified: [],
      rejected: [],
    }

    data.forEach(signup => {
      const status = signup.metadata.verificationStatus
      if (groups[status]) {
        groups[status].push(signup)
      }
    })

    // Sort each group by createdAt (newest first)
    Object.keys(groups).forEach(key => {
      groups[key as SignupStatus].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    })

    return groups
  }, [data])

  const statuses: SignupStatus[] = ['pending', 'verified', 'rejected']

  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {statuses.map(status => {
        const config = columnConfig[status]
        const signups = groupedSignups[status]
        const Icon = config.icon

        return (
          <div key={status} className="flex flex-col rounded-xl border bg-muted/20 overflow-hidden">
            {/* Column Header */}
            <div className={cn('px-4 py-3 border-b flex items-center gap-2', config.headerClass)}>
              <Icon className="h-4 w-4" />
              <span className="font-semibold text-sm">{config.label}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {signups.length}
              </Badge>
            </div>

            {/* Column Content */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {signups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Icon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">{config.emptyMessage}</p>
                  </div>
                ) : (
                  signups.map(signup => (
                    <SignupCard
                      key={signup.id}
                      signup={signup}
                      onClick={() => onCardClick(signup)}
                      borderClass={config.cardBorderClass}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )
      })}
    </div>
  )
}

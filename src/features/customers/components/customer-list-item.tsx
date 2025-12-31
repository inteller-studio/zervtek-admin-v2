'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdHelpOutline,
  MdWorkspacePremium,
} from 'react-icons/md'
import { type Customer, type UserLevel } from '../data/customers'

interface CustomerListItemProps {
  customer: Customer
  isSelected: boolean
  onClick: () => void
}

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const getDaysSinceActive = (date: Date) => {
  const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const levelConfig: Record<UserLevel, { label: string; className: string }> = {
  unverified: { label: 'Unverified', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  verified: { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  premium: { label: 'Premium', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  business: { label: 'Business', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  business_premium: { label: 'Biz Pro', className: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
}

const verificationConfig = {
  verified: { className: 'bg-emerald-500', icon: MdCheckCircle },
  pending: { className: 'bg-amber-500', icon: MdAccessTime },
  unverified: { className: 'bg-red-500', icon: MdCancel },
  documents_requested: { className: 'bg-blue-500', icon: MdHelpOutline },
}

export function CustomerListItem({ customer, isSelected, onClick }: CustomerListItemProps) {
  const levelInfo = levelConfig[customer.userLevel]
  const verificationInfo = verificationConfig[customer.verificationStatus]

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-all border mx-2 mb-2',
        isSelected
          ? 'bg-primary/5 border-primary/30 shadow-sm'
          : 'bg-card hover:bg-muted/50 border-transparent hover:border-border'
      )}
    >
      <div className='flex items-start gap-3'>
        {/* Avatar with verification indicator */}
        <div className='relative'>
          <Avatar className='h-11 w-11'>
            <AvatarFallback className='bg-primary/10 text-primary text-sm font-medium'>
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card',
              verificationInfo.className
            )}
          />
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <span className='font-medium text-sm truncate'>{customer.name}</span>
            <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
              {getDaysSinceActive(customer.lastActivity)}
            </span>
          </div>
          <p className='text-xs text-muted-foreground truncate mt-0.5'>
            {customer.email}
          </p>
          <div className='flex items-center gap-2 mt-1.5'>
            <Badge variant='outline' className={cn('text-[10px] px-1.5 py-0 h-5', levelInfo.className)}>
              <MdWorkspacePremium className='mr-1 h-3 w-3' />
              {levelInfo.label}
            </Badge>
            <span className='text-[10px] text-muted-foreground font-medium'>
              ¥{(customer.totalSpent / 1000).toFixed(0)}K
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

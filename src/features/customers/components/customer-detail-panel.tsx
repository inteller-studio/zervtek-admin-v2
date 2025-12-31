'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatedTabs, AnimatedTabsContent } from '@/components/ui/animated-tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdPublic,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdShoppingCart,
  MdError,
  MdCalendarToday,
  MdPerson,
  MdHelpOutline,
  MdWorkspacePremium,
  MdGavel,
  MdAccountBalanceWallet,
} from 'react-icons/md'
import { type Customer, type UserLevel } from '../data/customers'

interface CustomerDetailPanelProps {
  customer: Customer
  onSendEmail: (customer: Customer) => void
  onCallCustomer: (customer: Customer) => void
  onVerifyCustomer: (customer: Customer) => void
  onChangeUserLevel: (customer: Customer, level: UserLevel) => void
}

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const getDaysSinceActive = (date: Date) => {
  const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  banned: 'bg-red-500/10 text-red-600 border-red-500/20',
}

const verificationStyles = {
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  unverified: 'bg-red-500/10 text-red-600 border-red-500/20',
  documents_requested: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
}

const verificationIcons = {
  verified: MdCheckCircle,
  pending: MdAccessTime,
  unverified: MdCancel,
  documents_requested: MdHelpOutline,
}

const levelStyles = {
  unverified: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  premium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  business: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  business_premium: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
}

const levelLabels: Record<UserLevel, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  premium: 'Premium',
  business: 'Business',
  business_premium: 'Business Premium',
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className='flex items-center justify-between py-2'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Icon className='h-4 w-4' />
        <span className='text-sm'>{label}</span>
      </div>
      <span className='text-sm font-medium'>{children}</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtext, className }: {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  className?: string
}) {
  return (
    <div className='rounded-xl border border-border/50 bg-card/50 p-4'>
      <div className='flex items-center gap-1.5 text-muted-foreground'>
        <Icon className='h-3.5 w-3.5' />
        <span className='text-xs font-medium'>{label}</span>
      </div>
      <div className={cn('mt-1.5 text-2xl font-semibold tracking-tight', className)}>{value}</div>
      {subtext && <div className='text-xs text-muted-foreground mt-0.5'>{subtext}</div>}
    </div>
  )
}

export function CustomerDetailPanel({
  customer,
  onSendEmail,
  onCallCustomer,
  onVerifyCustomer,
  onChangeUserLevel,
}: CustomerDetailPanelProps) {
  const [activeDetailTab, setActiveDetailTab] = useState('overview')
  const VerificationIcon = verificationIcons[customer.verificationStatus]

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b flex-shrink-0'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <Avatar className='h-14 w-14 border-2 border-border/50'>
              <AvatarFallback className='bg-primary/10 text-primary text-lg font-semibold'>
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className='text-lg font-semibold'>{customer.name}</h2>
              <p className='text-sm text-muted-foreground'>{customer.email}</p>
              <div className='flex flex-wrap items-center gap-2 mt-2'>
                <Badge variant='outline' className={cn('text-xs', levelStyles[customer.userLevel])}>
                  <MdWorkspacePremium className='mr-1 h-3 w-3' />
                  {levelLabels[customer.userLevel]}
                </Badge>
                <Badge variant='outline' className={cn('text-xs', statusStyles[customer.status])}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </Badge>
                <Badge variant='outline' className={cn('text-xs', verificationStyles[customer.verificationStatus])}>
                  <VerificationIcon className='mr-1 h-3 w-3' />
                  {customer.verificationStatus.replace('_', ' ').charAt(0).toUpperCase() +
                   customer.verificationStatus.replace('_', ' ').slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => onSendEmail(customer)}>
              <MdEmail className='mr-2 h-4 w-4' />
              Email
            </Button>
            <Button variant='outline' size='sm' onClick={() => onCallCustomer(customer)}>
              <MdPhone className='mr-2 h-4 w-4' />
              Call
            </Button>
            {customer.verificationStatus !== 'verified' && (
              <Button size='sm' onClick={() => onVerifyCustomer(customer)}>
                <MdCheckCircle className='mr-2 h-4 w-4' />
                Verify
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className='flex-1 overflow-hidden'>
        <AnimatedTabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'financial', label: 'Financial' },
            { id: 'activity', label: 'Activity' },
          ]}
          value={activeDetailTab}
          onValueChange={setActiveDetailTab}
          variant='compact'
          className='h-full flex flex-col'
        >
          <div className='flex-1 overflow-y-auto p-4'>
            <AnimatedTabsContent value='overview' className='mt-0 space-y-6'>
              {/* Contact Information */}
              <div className='rounded-xl border border-border/50 bg-card/50 p-4'>
                <h3 className='text-sm font-semibold mb-3'>Contact Information</h3>
                <div className='divide-y divide-border/50'>
                  <InfoRow icon={MdEmail} label='Email'>{customer.email}</InfoRow>
                  <InfoRow icon={MdPhone} label='Phone'>{customer.phone}</InfoRow>
                  <InfoRow icon={MdLocationOn} label='Location'>{customer.city}, {customer.country}</InfoRow>
                  {customer.company && (
                    <InfoRow icon={MdBusiness} label='Company'>{customer.company}</InfoRow>
                  )}
                  <InfoRow icon={MdPublic} label='Language'>{customer.preferredLanguage}</InfoRow>
                </div>
              </div>

              {/* Account Details */}
              <div className='rounded-xl border border-border/50 bg-card/50 p-4'>
                <h3 className='text-sm font-semibold mb-3'>Account Details</h3>
                <div className='divide-y divide-border/50'>
                  <InfoRow icon={MdCalendarToday} label='Registered'>
                    {format(customer.createdAt, 'MMM dd, yyyy')}
                  </InfoRow>
                  <InfoRow icon={MdAccessTime} label='Last Active'>
                    {getDaysSinceActive(customer.lastActivity)}
                  </InfoRow>
                  <InfoRow icon={MdShoppingCart} label='Last Purchase'>
                    {customer.lastPurchase ? format(customer.lastPurchase, 'MMM dd, yyyy') : 'Never'}
                  </InfoRow>
                  <div className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <MdWorkspacePremium className='h-4 w-4' />
                      <span className='text-sm'>User Level</span>
                    </div>
                    <Select
                      value={customer.userLevel}
                      onValueChange={(value: UserLevel) => onChangeUserLevel(customer, value)}
                    >
                      <SelectTrigger className='w-[140px] h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='unverified'>Unverified</SelectItem>
                        <SelectItem value='verified'>Verified</SelectItem>
                        <SelectItem value='premium'>Premium</SelectItem>
                        <SelectItem value='business'>Business</SelectItem>
                        <SelectItem value='business_premium'>Business Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {customer.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 pt-3 mt-3 border-t border-border/50'>
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className='rounded-xl border border-border/50 bg-card/50 p-4'>
                  <h3 className='text-sm font-semibold mb-2'>Notes</h3>
                  <p className='text-sm text-muted-foreground'>{customer.notes}</p>
                </div>
              )}
            </AnimatedTabsContent>

            <AnimatedTabsContent value='financial' className='mt-0 space-y-6'>
              {/* Financial Stats */}
              <div className='grid gap-4 grid-cols-3'>
                <StatCard
                  icon={MdAccountBalanceWallet}
                  label='Total Spent'
                  value={`¥${customer.totalSpent.toLocaleString()}`}
                />
                <StatCard
                  icon={MdAccountBalanceWallet}
                  label='Deposit Balance'
                  value={`¥${customer.depositAmount.toLocaleString()}`}
                  className='text-emerald-600'
                />
                <StatCard
                  icon={MdError}
                  label='Outstanding'
                  value={`¥${customer.outstandingBalance.toLocaleString()}`}
                  className={customer.outstandingBalance > 0 ? 'text-orange-600' : ''}
                />
              </div>

              {/* Auction Stats */}
              <div className='grid gap-4 grid-cols-4'>
                <StatCard icon={MdGavel} label='Total Bids' value={customer.totalBids} />
                <StatCard icon={MdCheckCircle} label='Won' value={customer.wonAuctions} />
                <StatCard icon={MdCancel} label='Lost' value={customer.lostAuctions} />
                <StatCard
                  icon={MdAccessTime}
                  label='Active Bids'
                  value={customer.activeBids}
                  className={customer.activeBids > 0 ? 'text-blue-600' : ''}
                />
              </div>
            </AnimatedTabsContent>

            <AnimatedTabsContent value='activity' className='mt-0'>
              <div className='rounded-xl border border-border/50 bg-card/50 p-8 text-center'>
                <MdPerson className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
                <p className='text-sm text-muted-foreground'>Activity history coming soon...</p>
              </div>
            </AnimatedTabsContent>
          </div>
        </AnimatedTabs>
      </div>
    </div>
  )
}

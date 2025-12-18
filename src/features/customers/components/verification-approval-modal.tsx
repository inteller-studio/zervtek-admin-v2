'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Award,
  CheckCircle,
  Building2,
  Wallet,
  StickyNote,
  UserCheck,
} from 'lucide-react'
import { type Customer, type UserLevel } from '../data/customers'

interface ApprovalData {
  userLevel: Exclude<UserLevel, 'unverified'>
  depositAmount?: number
  notes?: string
  status: 'active' | 'inactive' | 'suspended'
}

interface VerificationApprovalModalProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (customer: Customer, data: ApprovalData) => void
}

const USER_LEVEL_OPTIONS: { value: Exclude<UserLevel, 'unverified'>; label: string; description: string }[] = [
  { value: 'verified', label: 'Verified', description: 'Standard verified customer' },
  { value: 'premium', label: 'Premium', description: 'Premium tier with enhanced limits' },
  { value: 'business', label: 'Business', description: 'Business account with higher limits' },
  { value: 'business_premium', label: 'Business Premium', description: 'Top tier business account' },
]

const ACCOUNT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

export function VerificationApprovalModal({
  customer,
  open,
  onOpenChange,
  onApprove,
}: VerificationApprovalModalProps) {
  const [userLevel, setUserLevel] = useState<Exclude<UserLevel, 'unverified'>>('verified')
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [accountStatus, setAccountStatus] = useState<'active' | 'inactive' | 'suspended'>('active')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (customer && open) {
      setUserLevel(customer.userLevel === 'unverified' ? 'verified' : customer.userLevel)
      setDepositAmount(customer.depositAmount > 0 ? String(customer.depositAmount) : '')
      setNotes(customer.notes || '')
      setAccountStatus('active')
    }
  }, [customer, open])

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleApprove = () => {
    if (!customer) return

    setIsSubmitting(true)

    onApprove(customer, {
      userLevel,
      depositAmount: depositAmount ? Number(depositAmount) : undefined,
      notes: notes || undefined,
      status: accountStatus,
    })

    setIsSubmitting(false)
    onOpenChange(false)
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserCheck className='h-5 w-5' />
            Approve Verification Request
          </DialogTitle>
          <DialogDescription>
            Review and approve the verification request for this customer
          </DialogDescription>
        </DialogHeader>

        {/* Customer Info Summary */}
        <div className='flex items-center gap-3 rounded-lg border p-3 bg-muted/30'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='bg-primary/10 text-primary'>
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='font-medium truncate'>{customer.name}</p>
            <p className='text-sm text-muted-foreground truncate'>{customer.email}</p>
          </div>
          {customer.company && (
            <Badge variant='outline' className='text-xs'>
              <Building2 className='mr-1 h-3 w-3' />
              {customer.company}
            </Badge>
          )}
        </div>

        {/* Main Form */}
        <div className='space-y-4'>
          {/* User Level Selection (Required) */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Award className='h-4 w-4 text-muted-foreground' />
              User Level <span className='text-destructive'>*</span>
            </Label>
            <Select value={userLevel} onValueChange={(v) => setUserLevel(v as Exclude<UserLevel, 'unverified'>)}>
              <SelectTrigger>
                <SelectValue placeholder='Select user level' />
              </SelectTrigger>
              <SelectContent>
                {USER_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className='flex flex-col'>
                      <span>{option.label}</span>
                      <span className='text-xs text-muted-foreground'>{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              Determines customer privileges and bidding limits
            </p>
          </div>

          {/* Deposit Amount (Optional) */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Wallet className='h-4 w-4 text-muted-foreground' />
              Deposit Amount
            </Label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                ¥
              </span>
              <Input
                type='number'
                placeholder={customer.depositAmount > 0 ? String(customer.depositAmount) : '0'}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className='pl-8'
                min='0'
              />
            </div>
            {customer.depositAmount > 0 && (
              <p className='text-xs text-muted-foreground'>
                Current deposit: ¥{customer.depositAmount.toLocaleString()}
              </p>
            )}
          </div>

          {/* Account Status (Optional) */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
              Account Status
            </Label>
            <Select value={accountStatus} onValueChange={(v) => setAccountStatus(v as 'active' | 'inactive' | 'suspended')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes (Optional) */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <StickyNote className='h-4 w-4 text-muted-foreground' />
              Notes / Comments
            </Label>
            <Textarea
              placeholder='Add internal notes about this verification decision...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            <CheckCircle className='mr-2 h-4 w-4' />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

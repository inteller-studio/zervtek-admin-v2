'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdEmail,
  MdPhone,
  MdChat,
  MdCheckCircle,
  MdSecurity,
  MdExpandMore,
  MdError,
  MdCalendarToday,
  MdBlock,
  MdFlag,
  MdLock,
  MdVerifiedUser,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { type Customer } from '../../data/customers'
import { toast } from 'sonner'

interface CustomerPageFooterProps {
  customer: Customer
  onSendEmail: () => void
  onCallCustomer: () => void
  onWhatsApp: () => void
  onVerifyCustomer: () => void
  onSuspendCustomer: () => void
}

const suspensionReasons = [
  { value: 'payment_issues', label: 'Payment Issues' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'document_verification', label: 'Document Verification Required' },
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'other', label: 'Other' },
]

const banReasons = [
  { value: 'fraud', label: 'Fraud' },
  { value: 'policy_violations', label: 'Repeated Policy Violations' },
  { value: 'chargebacks', label: 'Chargebacks' },
  { value: 'identity_theft', label: 'Identity Theft' },
  { value: 'other', label: 'Other' },
]

const suspensionDurations = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: 'indefinite', label: 'Indefinite' },
]

export function CustomerPageFooter({
  customer,
  onSendEmail,
  onCallCustomer,
  onWhatsApp,
  onVerifyCustomer,
  onSuspendCustomer,
}: CustomerPageFooterProps) {
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)

  // Suspend form state
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendNotes, setSuspendNotes] = useState('')
  const [suspendDuration, setSuspendDuration] = useState('')

  // Ban form state
  const [banReason, setBanReason] = useState('')
  const [banNotes, setBanNotes] = useState('')
  const [banConfirmed, setBanConfirmed] = useState(false)

  // Flag form state
  const [flagReason, setFlagReason] = useState('')

  const isUnverified = customer.verificationStatus === 'unverified'
  const isPending = customer.verificationStatus === 'pending'
  const isSuspended = customer.status === 'suspended'
  const isBanned = customer.status === 'banned'

  const resetSuspendForm = () => {
    setSuspendReason('')
    setSuspendNotes('')
    setSuspendDuration('')
  }

  const resetBanForm = () => {
    setBanReason('')
    setBanNotes('')
    setBanConfirmed(false)
  }

  const handleSuspend = () => {
    if (!suspendReason) {
      toast.error('Please select a suspension reason')
      return
    }
    toast.success(`${customer.name} has been suspended`, {
      description: `Reason: ${suspensionReasons.find(r => r.value === suspendReason)?.label}`,
    })
    setSuspendDialogOpen(false)
    resetSuspendForm()
    onSuspendCustomer()
  }

  const handleBan = () => {
    if (!banReason) {
      toast.error('Please select a ban reason')
      return
    }
    if (!banNotes.trim()) {
      toast.error('Please provide a detailed reason')
      return
    }
    if (!banConfirmed) {
      toast.error('Please confirm you understand this action is permanent')
      return
    }
    toast.success(`${customer.name} has been permanently banned`, {
      description: `Reason: ${banReasons.find(r => r.value === banReason)?.label}`,
    })
    setBanDialogOpen(false)
    resetBanForm()
  }

  const handleActivate = () => {
    toast.success(`${customer.name}'s account has been activated`)
    setActivateDialogOpen(false)
    onSuspendCustomer()
  }

  const handleFlag = () => {
    if (!flagReason.trim()) {
      toast.error('Please provide a reason for flagging')
      return
    }
    toast.success(`${customer.name} has been flagged for review`, {
      description: flagReason,
    })
    setFlagDialogOpen(false)
    setFlagReason('')
  }

  const handlePasswordReset = () => {
    toast.success(`Password reset email sent to ${customer.email}`)
    setPasswordResetDialogOpen(false)
  }

  return (
    <>
      <motion.div
        className='flex items-center justify-between border-t px-6 py-3 shrink-0 relative overflow-hidden'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Glass morphism background */}
        <div className='absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-muted/30 backdrop-blur-sm' />

        {/* Subtle animated gradient overlay */}
        <motion.div
          className='absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] opacity-50'
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Content */}
        <div className='relative flex items-center justify-between w-full'>
          {/* Customer Info */}
          <motion.div
            className={cn(
              'px-4 py-2 rounded-xl text-sm relative overflow-hidden',
              isBanned
                ? 'bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20'
                : isSuspended
                  ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20'
                  : 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20'
            )}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <div className='relative flex items-center gap-2'>
              {isBanned ? (
                <MdBlock className='h-4 w-4 text-red-500' />
              ) : isSuspended ? (
                <MdError className='h-4 w-4 text-amber-500' />
              ) : (
                <MdSecurity className='h-4 w-4 text-primary' />
              )}
              <span className={cn(
                'font-medium',
                isBanned && 'text-red-600',
                isSuspended && 'text-amber-600'
              )}>
                {isBanned
                  ? 'Account Banned'
                  : isSuspended
                    ? 'Account Suspended'
                    : customer.verificationStatus === 'verified'
                      ? 'Verified Customer'
                      : 'Verification Required'}
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className='flex items-center gap-2'>
            {/* Primary Contact Actions */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size='sm'
                variant='outline'
                onClick={onSendEmail}
                className='group relative overflow-hidden'
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <MdEmail className='h-4 w-4 mr-2 group-hover:scale-110 transition-transform' />
                Email
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size='sm'
                variant='outline'
                onClick={onCallCustomer}
                className='group relative overflow-hidden'
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <MdPhone className='h-4 w-4 mr-2 group-hover:scale-110 transition-transform' />
                Call
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size='sm'
                variant='outline'
                onClick={onWhatsApp}
                className='group relative overflow-hidden bg-emerald-500/5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700'
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <MdChat className='h-4 w-4 mr-2 group-hover:scale-110 transition-transform' />
                WhatsApp
              </Button>
            </motion.div>

            {/* Divider */}
            <div className='w-px h-6 bg-border/50 mx-1' />

            {/* Verification Actions */}
            <AnimatePresence mode='wait'>
              {(isUnverified || isPending) && !isBanned && (
                <motion.div
                  key='verify'
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    size='sm'
                    onClick={onVerifyCustomer}
                    className='group relative overflow-hidden bg-primary hover:bg-primary/90'
                  >
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <MdCheckCircle className='h-4 w-4 mr-2 group-hover:scale-110 transition-transform' />
                    Verify
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Divider */}
            <div className='w-px h-6 bg-border/50 mx-1' />

            {/* Account Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size='sm'
                    variant='outline'
                    className={cn(
                      'group relative overflow-hidden',
                      (isSuspended || isBanned)
                        ? 'bg-red-500/5 border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-700'
                        : 'hover:bg-muted'
                    )}
                  >
                    <MdSecurity className='h-4 w-4 mr-2' />
                    Account Actions
                    <MdExpandMore className='h-4 w-4 ml-2' />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                {isSuspended && !isBanned && (
                  <DropdownMenuItem
                    onClick={() => setActivateDialogOpen(true)}
                    className='text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50'
                  >
                    <MdVerifiedUser className='h-4 w-4 mr-2' />
                    Activate Account
                  </DropdownMenuItem>
                )}
                {!isSuspended && !isBanned && (
                  <DropdownMenuItem
                    onClick={() => setSuspendDialogOpen(true)}
                    className='text-amber-600 focus:text-amber-600 focus:bg-amber-50'
                  >
                    <MdError className='h-4 w-4 mr-2' />
                    Suspend Account
                  </DropdownMenuItem>
                )}
                {!isBanned && (
                  <DropdownMenuItem
                    onClick={() => setBanDialogOpen(true)}
                    className='text-red-600 focus:text-red-600 focus:bg-red-50'
                  >
                    <MdBlock className='h-4 w-4 mr-2' />
                    Ban Account
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFlagDialogOpen(true)}>
                  <MdFlag className='h-4 w-4 mr-2' />
                  Flag for Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPasswordResetDialogOpen(true)}>
                  <MdLock className='h-4 w-4 mr-2' />
                  Force Password Reset
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-amber-600'>
              <MdError className='h-5 w-5' />
              Suspend Customer Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will temporarily suspend <span className='font-medium text-foreground'>{customer.name}</span>&apos;s account.
              They will not be able to place bids or make purchases until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='suspend-reason'>Suspension Reason *</Label>
              <Select value={suspendReason} onValueChange={setSuspendReason}>
                <SelectTrigger id='suspend-reason'>
                  <SelectValue placeholder='Select a reason' />
                </SelectTrigger>
                <SelectContent>
                  {suspensionReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='suspend-duration'>Suspension Duration</Label>
              <Select value={suspendDuration} onValueChange={setSuspendDuration}>
                <SelectTrigger id='suspend-duration'>
                  <SelectValue placeholder='Select duration (optional)' />
                </SelectTrigger>
                <SelectContent>
                  {suspensionDurations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='suspend-notes'>Additional Notes</Label>
              <Textarea
                id='suspend-notes'
                placeholder='Add any additional context or notes...'
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                className='min-h-[80px]'
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetSuspendForm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              className='bg-amber-600 hover:bg-amber-700 text-white'
            >
              <MdError className='h-4 w-4 mr-2' />
              Suspend Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-red-600'>
              <MdBlock className='h-5 w-5' />
              Permanently Ban Customer
            </AlertDialogTitle>
            <AlertDialogDescription className='text-red-600/80'>
              <strong>Warning:</strong> This action is <strong>PERMANENT</strong> and cannot be undone.
              <span className='font-medium text-foreground'> {customer.name}</span> will lose access to their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='ban-reason'>Ban Reason *</Label>
              <Select value={banReason} onValueChange={setBanReason}>
                <SelectTrigger id='ban-reason'>
                  <SelectValue placeholder='Select a reason' />
                </SelectTrigger>
                <SelectContent>
                  {banReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='ban-notes'>Detailed Reason *</Label>
              <Textarea
                id='ban-notes'
                placeholder='Provide a detailed explanation for this ban...'
                value={banNotes}
                onChange={(e) => setBanNotes(e.target.value)}
                className='min-h-[100px]'
              />
            </div>
            <div className='flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4'>
              <Checkbox
                id='ban-confirm'
                checked={banConfirmed}
                onCheckedChange={(checked) => setBanConfirmed(checked as boolean)}
                className='mt-0.5 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600'
              />
              <Label
                htmlFor='ban-confirm'
                className='text-sm text-red-700 cursor-pointer leading-relaxed'
              >
                I understand this action is <strong>permanent</strong> and the customer will <strong>not</strong> be able to recover their account.
              </Label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetBanForm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              className='bg-red-600 hover:bg-red-700 text-white'
              disabled={!banReason || !banNotes.trim() || !banConfirmed}
            >
              <MdBlock className='h-4 w-4 mr-2' />
              Ban Account Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flag for Review Dialog */}
      <AlertDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <MdFlag className='h-5 w-5 text-orange-500' />
              Flag Account for Review
            </AlertDialogTitle>
            <AlertDialogDescription>
              Flag <span className='font-medium text-foreground'>{customer.name}</span>&apos;s account for internal review.
              This will alert the compliance team to investigate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='flag-reason'>Reason for Flagging *</Label>
              <Textarea
                id='flag-reason'
                placeholder='Describe why this account needs review...'
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className='min-h-[100px]'
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFlagReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFlag}
              className='bg-orange-600 hover:bg-orange-700 text-white'
            >
              <MdFlag className='h-4 w-4 mr-2' />
              Flag for Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <AlertDialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <MdLock className='h-5 w-5 text-blue-500' />
              Force Password Reset
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to <span className='font-medium text-foreground'>{customer.email}</span> and invalidate their current password.
              The customer will need to set a new password to access their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              className='bg-blue-600 hover:bg-blue-700 text-white'
            >
              <MdLock className='h-4 w-4 mr-2' />
              Send Reset Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Account Dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent className='max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-emerald-600'>
              <MdVerifiedUser className='h-5 w-5' />
              Activate Customer Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reactivate <span className='font-medium text-foreground'>{customer.name}</span>&apos;s account.
              They will be able to place bids and make purchases again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {customer.suspensionReason && (
            <div className='py-2'>
              <div className='rounded-lg border bg-muted/50 p-3'>
                <p className='text-xs text-muted-foreground mb-1'>Previous suspension reason:</p>
                <p className='text-sm font-medium'>{customer.suspensionReason}</p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivate}
              className='bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              <MdVerifiedUser className='h-4 w-4 mr-2' />
              Activate Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdArrowBack,
  MdEmail,
  MdPhone,
  MdContentCopy,
  MdLocationOn,
  MdEdit,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdChat,
  MdSecurity,
  MdExpandMore,
  MdError,
  MdWorkspacePremium,
  MdBlock,
  MdFlag,
  MdLock,
  MdVerifiedUser,
  MdManageAccounts,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type Customer, type UserLevel } from '../../data/customers'
import { toast } from 'sonner'

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

const levelStyles: Record<UserLevel, string> = {
  unverified: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  premium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  business: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  business_premium: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
}

const levelGlowStyles: Record<UserLevel, string> = {
  unverified: '',
  verified: 'bg-emerald-500/30',
  premium: 'bg-amber-500/30',
  business: 'bg-blue-500/30',
  business_premium: 'bg-purple-500/30',
}

const levelLabels: Record<UserLevel, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  premium: 'Premium',
  business: 'Business',
  business_premium: 'Business Premium',
}

const verificationIcons = {
  verified: MdCheckCircle,
  pending: MdAccessTime,
  unverified: MdCancel,
  documents_requested: MdAccessTime,
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
}

interface EditFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface CustomerPageHeaderProps {
  customer: Customer
  emailCopied: boolean
  phoneCopied: boolean
  onBack: () => void
  onCopyEmail: () => void
  onCopyPhone: () => void
  onOpenLevelDialog: () => void
  onSendEmail: () => void
  onCallCustomer: () => void
  onWhatsApp: () => void
  onVerifyCustomer: () => void
  onSuspendCustomer: () => void
  onEditCustomer: (data: Partial<Customer>) => void
}

export function CustomerPageHeader({
  customer,
  emailCopied,
  phoneCopied,
  onBack,
  onCopyEmail,
  onCopyPhone,
  onOpenLevelDialog,
  onSendEmail,
  onCallCustomer,
  onWhatsApp,
  onVerifyCustomer,
  onSuspendCustomer,
  onEditCustomer,
}: CustomerPageHeaderProps) {
  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

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

  // Edit form state - split name into first and last
  const nameParts = customer.name.split(' ')
  const [editForm, setEditForm] = useState<EditFormData>({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: customer.email,
    phone: customer.phone,
  })

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const VerificationIcon = verificationIcons[customer.verificationStatus]
  const isActiveStatus = customer.status === 'active'
  const isPremiumLevel = ['premium', 'business', 'business_premium'].includes(customer.userLevel)
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

  const handleOpenEditDialog = () => {
    const parts = customer.name.split(' ')
    setEditForm({
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      email: customer.email,
      phone: customer.phone,
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.firstName.trim()) {
      toast.error('First name is required')
      return
    }
    if (!editForm.lastName.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!editForm.email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!editForm.phone.trim()) {
      toast.error('Phone is required')
      return
    }

    const fullName = `${editForm.firstName.trim()} ${editForm.lastName.trim()}`
    onEditCustomer({
      name: fullName,
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
    })
    toast.success('Customer profile updated successfully')
    setEditDialogOpen(false)
  }

  const updateEditForm = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <motion.div
        className='border-b bg-gradient-to-r from-background via-background to-muted/20 relative overflow-hidden'
        initial='hidden'
        animate='visible'
        variants={containerVariants}
      >
        {/* Subtle gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none' />

        <div className='px-6 py-4 relative'>
          <div className='max-w-7xl mx-auto'>
            {/* Main Header Row */}
            <motion.div
              className='flex items-center justify-between gap-4'
              variants={itemVariants}
            >
              <div className='flex gap-4 items-center min-w-0'>
                {/* Back Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={onBack}
                    className='shrink-0 -ml-2 group'
                  >
                    <motion.div
                      className='flex items-center'
                      whileHover={{ x: -3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <MdArrowBack className='h-4 w-4 mr-2 transition-transform group-hover:-translate-x-0.5' />
                      Back
                    </motion.div>
                  </Button>
                </motion.div>

                {/* Avatar with Level Glow */}
                <motion.div
                  className='relative shrink-0'
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* Glow effect for premium levels */}
                  {isPremiumLevel && (
                    <motion.div
                      className={cn(
                        'absolute -inset-2 rounded-full blur-xl',
                        levelGlowStyles[customer.userLevel]
                      )}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <Avatar className='h-14 w-14 border-2 border-border/50 relative'>
                    <AvatarFallback className='bg-primary/10 text-primary text-lg font-semibold'>
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator for active customers */}
                  {isActiveStatus && (
                    <motion.div
                      className='absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background'
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Customer Details */}
                <motion.div className='space-y-1 min-w-0' variants={itemVariants}>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <motion.h1
                      className='text-xl font-semibold truncate'
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    >
                      {customer.name}
                    </motion.h1>

                    {/* User Level Badge with Edit */}
                    <motion.div
                      className='relative'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {isPremiumLevel && (
                        <motion.div
                          className={cn(
                            'absolute -inset-1 rounded-full blur-md',
                            levelGlowStyles[customer.userLevel]
                          )}
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      {customer.userLevel === 'unverified' ? (
                        <button
                          onClick={onOpenLevelDialog}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all relative',
                            'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                            'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                          )}
                        >
                          <MdCheckCircle className='h-3 w-3' />
                          Verify Now
                        </button>
                      ) : (
                        <button
                          onClick={onOpenLevelDialog}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-all relative',
                            'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                            levelStyles[customer.userLevel]
                          )}
                        >
                          <MdWorkspacePremium className='h-3 w-3' />
                          {levelLabels[customer.userLevel]}
                          <MdEdit className='h-2.5 w-2.5 ml-0.5' />
                        </button>
                      )}
                    </motion.div>

                    {/* Status Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge variant='outline' className={cn('text-xs', statusStyles[customer.status])}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </Badge>
                    </motion.div>

                    {/* Verification Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <Badge variant='outline' className={cn('text-xs', verificationStyles[customer.verificationStatus])}>
                        <VerificationIcon className='mr-1 h-3 w-3' />
                        {customer.verificationStatus.charAt(0).toUpperCase() + customer.verificationStatus.slice(1).replace('_', ' ')}
                      </Badge>
                    </motion.div>
                  </div>

                  {/* Contact Info Row with Copy Buttons */}
                  <motion.div
                    className='flex items-center gap-3 text-sm text-muted-foreground flex-wrap'
                    variants={containerVariants}
                  >
                    {/* Email with Copy */}
                    <motion.button
                      onClick={onCopyEmail}
                      className='inline-flex items-center gap-1 hover:text-foreground transition-colors group/email'
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      variants={itemVariants}
                    >
                      <MdEmail className='h-3.5 w-3.5' />
                      <span className='truncate max-w-[180px]'>{customer.email}</span>
                      <AnimatePresence mode='wait'>
                        {emailCopied ? (
                          <motion.div
                            key='check'
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className='shrink-0'
                          >
                            <svg
                              className='h-3 w-3 text-emerald-500'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth={2.5}
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <motion.path
                                d='M5 12l5 5L20 7'
                                variants={checkVariants}
                                initial='hidden'
                                animate='visible'
                              />
                            </svg>
                          </motion.div>
                        ) : (
                          <motion.div
                            key='copy'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='shrink-0'
                          >
                            <MdContentCopy className='h-2.5 w-2.5 opacity-50 group-hover/email:opacity-100 transition-opacity' />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <span className='text-muted-foreground/50'>•</span>

                    {/* Phone with Copy */}
                    <motion.button
                      onClick={onCopyPhone}
                      className='inline-flex items-center gap-1 hover:text-foreground transition-colors group/phone'
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      variants={itemVariants}
                    >
                      <MdPhone className='h-3.5 w-3.5' />
                      <span>{customer.phone}</span>
                      <AnimatePresence mode='wait'>
                        {phoneCopied ? (
                          <motion.div
                            key='check'
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className='shrink-0'
                          >
                            <svg
                              className='h-3 w-3 text-emerald-500'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth={2.5}
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <motion.path
                                d='M5 12l5 5L20 7'
                                variants={checkVariants}
                                initial='hidden'
                                animate='visible'
                              />
                            </svg>
                          </motion.div>
                        ) : (
                          <motion.div
                            key='copy'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='shrink-0'
                          >
                            <MdContentCopy className='h-2.5 w-2.5 opacity-50 group-hover/phone:opacity-100 transition-opacity' />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <span className='text-muted-foreground/50'>•</span>

                    {/* Location */}
                    <motion.span
                      className='flex items-center gap-1 hover:text-foreground transition-colors'
                      variants={itemVariants}
                    >
                      <MdLocationOn className='h-3.5 w-3.5' />
                      {customer.city}, {customer.country}
                    </motion.span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                className='flex items-center gap-2 shrink-0'
                variants={containerVariants}
              >
                {/* Edit Profile */}
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleOpenEditDialog}
                  className='h-8'
                >
                  <MdManageAccounts className='h-4 w-4 mr-1.5' />
                  Edit
                </Button>

                <div className='w-px h-6 bg-border/50 mx-1' />

                {/* Contact Actions */}
                <Button
                  size='sm'
                  variant='outline'
                  onClick={onSendEmail}
                  className='h-8'
                >
                  <MdEmail className='h-4 w-4 mr-1.5' />
                  Email
                </Button>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={onCallCustomer}
                  className='h-8'
                >
                  <MdPhone className='h-4 w-4 mr-1.5' />
                  Call
                </Button>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={onWhatsApp}
                  className='h-8 bg-emerald-500/5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700'
                >
                  <MdChat className='h-4 w-4 mr-1.5' />
                  WhatsApp
                </Button>

                <div className='w-px h-6 bg-border/50 mx-1' />

                {/* Verification Actions */}
                <AnimatePresence mode='wait'>
                  {(isUnverified || isPending) && !isBanned && (
                    <motion.div
                      key='verify'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        size='sm'
                        onClick={onVerifyCustomer}
                        className='h-8 bg-primary hover:bg-primary/90'
                      >
                        <MdCheckCircle className='h-4 w-4 mr-1.5' />
                        Verify
                      </Button>
                    </motion.div>
                  )}

                </AnimatePresence>

                <div className='w-px h-6 bg-border/50 mx-1' />

                {/* Account Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size='sm'
                      variant='outline'
                      className={cn(
                        'h-8',
                        (isSuspended || isBanned)
                          ? 'bg-red-500/5 border-red-500/20 text-red-600 hover:bg-red-500/10 hover:text-red-700'
                          : ''
                      )}
                    >
                      <MdSecurity className='h-4 w-4 mr-1.5' />
                      Account
                      <MdExpandMore className='h-3 w-3 ml-1' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-52'>
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Dialogs */}
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

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <MdManageAccounts className='h-5 w-5 text-primary' />
              Edit Customer Profile
            </DialogTitle>
            <DialogDescription>
              Update account information for <span className='font-medium text-foreground'>{customer.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {/* First Name & Last Name */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-firstname'>First Name *</Label>
                <Input
                  id='edit-firstname'
                  value={editForm.firstName}
                  onChange={(e) => updateEditForm('firstName', e.target.value)}
                  placeholder='First name'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-lastname'>Last Name *</Label>
                <Input
                  id='edit-lastname'
                  value={editForm.lastName}
                  onChange={(e) => updateEditForm('lastName', e.target.value)}
                  placeholder='Last name'
                />
              </div>
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <Label htmlFor='edit-email'>Email *</Label>
              <Input
                id='edit-email'
                type='email'
                value={editForm.email}
                onChange={(e) => updateEditForm('email', e.target.value)}
                placeholder='email@example.com'
              />
            </div>

            {/* Phone */}
            <div className='space-y-2'>
              <Label htmlFor='edit-phone'>Phone *</Label>
              <Input
                id='edit-phone'
                value={editForm.phone}
                onChange={(e) => updateEditForm('phone', e.target.value)}
                placeholder='+1 234 567 890'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <MdManageAccounts className='h-4 w-4 mr-2' />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

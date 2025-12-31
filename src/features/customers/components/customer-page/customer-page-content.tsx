'use client'

import { useState, useRef, useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdPublic,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdDescription,
  MdCreditCard,
  MdPerson,
  MdContentCopy,
  MdFilterList,
  MdAdd,
  MdSecurity,
  MdCalendarToday,
  MdOpenInNew,
  MdGavel,
  MdDirectionsCar,
  MdMonitorHeart,
  MdChat,
  MdInventory2,
  MdArrowOutward,
  MdLogin,
  MdMonitor,
  MdSmartphone,
  MdLaptop,
  MdWarning,
  MdBlock,
  MdVerifiedUser,
  MdTrendingUp,
  MdCheck,
  MdNote,
  MdSave,
  MdVerified,
  MdRemoveModerator,
  MdKey,
  MdAccountBalanceWallet,
  MdApartment,
  MdLink,
  MdBusinessCenter,
  MdHome,
  MdWarehouse,
  MdCurrencyBitcoin,
  MdDirectionsBoat,
  MdAnchor,
  MdInventory,
  MdTimer,
} from 'react-icons/md'
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  type Customer,
  type LoginEntry,
  type ActivityEntry,
  type ShipmentEntry,
  generateLoginHistory,
  generateActivityLog,
  generateShipments,
} from '../../data/customers'

const TAB_ORDER = ['overview', 'financial', 'activity', 'shipments', 'security', 'notes']

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

const contentVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    transition: {
      duration: 0.15,
    },
  }),
}

// Mock transactions data
const mockTransactions = [
  { id: 'TXN001', date: new Date('2024-12-28'), type: 'deposit' as const, description: 'Deposit Payment', amount: 500000, status: 'completed' as const, reference: 'DEP-2024-001' },
  { id: 'TXN002', date: new Date('2024-12-25'), type: 'purchase' as const, description: '2023 Toyota Supra GR - Invoice #INV-2024-089', amount: -4500000, status: 'completed' as const, reference: 'INV-2024-089' },
  { id: 'TXN003', date: new Date('2024-12-20'), type: 'refund' as const, description: 'Refund - Cancelled Order', amount: 150000, status: 'completed' as const, reference: 'REF-2024-003' },
  { id: 'TXN004', date: new Date('2024-12-15'), type: 'purchase' as const, description: '2022 Nissan Skyline GT-R - Invoice #INV-2024-078', amount: -3200000, status: 'completed' as const, reference: 'INV-2024-078' },
  { id: 'TXN005', date: new Date('2024-12-10'), type: 'deposit' as const, description: 'Initial Deposit', amount: 1000000, status: 'completed' as const, reference: 'DEP-2024-002' },
  { id: 'TXN006', date: new Date('2024-12-05'), type: 'fee' as const, description: 'Shipping Fee - Container #SHP-445', amount: -250000, status: 'completed' as const, reference: 'SHP-2024-445' },
  { id: 'TXN007', date: new Date('2024-11-28'), type: 'purchase' as const, description: '2021 Honda NSX - Invoice #INV-2024-065', amount: -8500000, status: 'completed' as const, reference: 'INV-2024-065' },
  { id: 'TXN008', date: new Date('2024-11-20'), type: 'deposit' as const, description: 'Deposit Payment', amount: 2000000, status: 'completed' as const, reference: 'DEP-2024-003' },
]

const transactionTypeIcons = {
  deposit: MdCreditCard,
  purchase: MdInventory2,
  refund: MdArrowOutward,
  fee: MdDescription,
}

const transactionTypeColors = {
  deposit: 'text-emerald-500 bg-emerald-500/10',
  purchase: 'text-blue-500 bg-blue-500/10',
  refund: 'text-purple-500 bg-purple-500/10',
  fee: 'text-amber-500 bg-amber-500/10',
}

// Activity type icons and colors
const activityIcons: Record<ActivityEntry['type'], React.ElementType> = {
  bid: MdGavel,
  purchase: MdInventory2,
  payment: MdCreditCard,
  message: MdChat,
  document: MdDescription,
  login: MdLogin,
  profile_update: MdPerson,
  verification: MdVerifiedUser,
  suspension: MdBlock,
  level_change: MdTrendingUp,
}

const activityColors: Record<ActivityEntry['type'], string> = {
  bid: 'text-blue-500 bg-blue-500/10',
  purchase: 'text-amber-500 bg-amber-500/10',
  payment: 'text-emerald-500 bg-emerald-500/10',
  message: 'text-purple-500 bg-purple-500/10',
  document: 'text-slate-500 bg-slate-500/10',
  login: 'text-cyan-500 bg-cyan-500/10',
  profile_update: 'text-indigo-500 bg-indigo-500/10',
  verification: 'text-green-500 bg-green-500/10',
  suspension: 'text-red-500 bg-red-500/10',
  level_change: 'text-orange-500 bg-orange-500/10',
}

// Login status icons and colors
const loginStatusConfig = {
  success: { icon: MdCheckCircle, color: 'text-emerald-500 bg-emerald-500/10', label: 'Success' },
  failed: { icon: MdCancel, color: 'text-red-500 bg-red-500/10', label: 'Failed' },
  blocked: { icon: MdBlock, color: 'text-amber-500 bg-amber-500/10', label: 'Blocked' },
}

// Device icons
const getDeviceIcon = (device: string) => {
  if (device.includes('iPhone') || device.includes('Samsung') || device.includes('Android')) return MdSmartphone
  if (device.includes('iPad') || device.includes('Tablet')) return MdLaptop
  return MdMonitor
}

interface CustomerPageContentProps {
  customer: Customer
  activeTab: string
  onTabChange: (tab: string) => void
  onUpdateNotes?: (notes: string) => void
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <motion.div
      className='flex items-center justify-between py-2.5 border-b border-border/30 last:border-0'
      variants={itemVariants}
    >
      <div className='flex items-center gap-2.5 text-muted-foreground'>
        <Icon className='h-4 w-4' />
        <span className='text-sm'>{label}</span>
      </div>
      <span className='text-sm font-medium'>{children}</span>
    </motion.div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-6 w-6 p-0'
      onClick={handleCopy}
    >
      {copied ? <MdCheck className='h-3 w-3 text-emerald-500' /> : <MdContentCopy className='h-3 w-3' />}
    </Button>
  )
}

export function CustomerPageContent({ customer, activeTab, onTabChange, onUpdateNotes }: CustomerPageContentProps) {
  const [direction, setDirection] = useState(0)
  const prevTabRef = useRef(activeTab)
  const [loginFilter, setLoginFilter] = useState<'all' | 'success' | 'failed' | 'blocked'>('all')
  const [activityFilter, setActivityFilter] = useState<'all' | ActivityEntry['type']>('all')
  const [notesValue, setNotesValue] = useState(customer.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  // Generate mock data for this customer
  const loginHistory = useMemo(() => generateLoginHistory(customer.id, 25), [customer.id])
  const activityLog = useMemo(() => generateActivityLog(customer.id, 40), [customer.id])
  const shipments = useMemo(() => generateShipments(customer.id, 6), [customer.id])

  // Filter login history
  const filteredLogins = useMemo(() => {
    if (loginFilter === 'all') return loginHistory
    return loginHistory.filter(login => login.status === loginFilter)
  }, [loginHistory, loginFilter])

  // Filter activity log
  const filteredActivity = useMemo(() => {
    if (activityFilter === 'all') return activityLog
    return activityLog.filter(activity => activity.type === activityFilter)
  }, [activityLog, activityFilter])

  const shipmentStats = useMemo(() => ({
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    pending: shipments.filter(s => ['booked', 'loaded'].includes(s.status)).length,
  }), [shipments])

  const handleTabChange = (newTab: string) => {
    const prevIndex = TAB_ORDER.indexOf(prevTabRef.current)
    const newIndex = TAB_ORDER.indexOf(newTab)
    setDirection(newIndex > prevIndex ? 1 : -1)
    prevTabRef.current = newTab
    onTabChange(newTab)
  }

  // Stats for login history
  const loginStats = useMemo(() => ({
    total: loginHistory.length,
    success: loginHistory.filter(l => l.status === 'success').length,
    failed: loginHistory.filter(l => l.status === 'failed').length,
    blocked: loginHistory.filter(l => l.status === 'blocked').length,
  }), [loginHistory])

  return (
    <div className='flex-1 overflow-hidden'>
      <AnimatedTabs
        tabs={[
          { id: 'overview', label: 'Overview', icon: MdPerson },
          { id: 'financial', label: 'Financial', icon: MdCreditCard },
          { id: 'activity', label: 'Activity', icon: MdMonitorHeart },
          { id: 'shipments', label: 'Shipments', icon: MdDirectionsBoat, badge: shipments.length },
          { id: 'security', label: 'Security', icon: MdSecurity },
          { id: 'notes', label: 'Notes', icon: MdNote },
        ]}
        value={activeTab}
        onValueChange={handleTabChange}
        className='h-full flex flex-col'
      >

        {/* Tab Content with Animations */}
        <div className='flex-1 overflow-y-auto'>
          <AnimatePresence mode='wait' custom={direction}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <AnimatedTabsContent value='overview' className='mt-0 h-full' forceMount>
                <motion.div
                  key='overview'
                  custom={direction}
                  variants={contentVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='p-6 space-y-6'
                >
                  <motion.div
                    className='grid gap-6 md:grid-cols-2'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    {/* Contact Information */}
                    <motion.div
                      className='rounded-xl border border-border/50 bg-card overflow-hidden'
                      variants={itemVariants}
                    >
                      <div className='px-4 py-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/50'>
                        <h3 className='text-sm font-semibold'>Contact Information</h3>
                      </div>
                      <div className='p-4'>
                        <InfoRow icon={MdEmail} label='Email'>{customer.email}</InfoRow>
                        <InfoRow icon={MdPhone} label='Phone'>{customer.phone}</InfoRow>
                        <InfoRow icon={MdLocationOn} label='Location'>{customer.city}, {customer.country}</InfoRow>
                        {customer.company && (
                          <InfoRow icon={MdBusiness} label='Company'>{customer.company}</InfoRow>
                        )}
                        <InfoRow icon={MdPublic} label='Language'>{customer.preferredLanguage}</InfoRow>
                      </div>
                    </motion.div>

                    {/* Business Profile (if business account) */}
                    {customer.businessProfile && (
                      <motion.div
                        className='rounded-xl border border-border/50 bg-card overflow-hidden'
                        variants={itemVariants}
                      >
                        <div className='px-4 py-3 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent border-b border-border/50'>
                          <div className='flex items-center gap-2'>
                            <MdBusinessCenter className='h-4 w-4 text-purple-500' />
                            <h3 className='text-sm font-semibold'>Business Profile</h3>
                          </div>
                        </div>
                        <div className='p-4'>
                          <InfoRow icon={MdApartment} label='Business Type'>
                            <Badge variant='outline' className='capitalize'>{customer.businessProfile.businessType}</Badge>
                          </InfoRow>
                          {customer.businessProfile.registrationNumber && (
                            <InfoRow icon={MdDescription} label='Registration No.'>{customer.businessProfile.registrationNumber}</InfoRow>
                          )}
                          {customer.businessProfile.vatNumber && (
                            <InfoRow icon={MdDescription} label='VAT Number'>{customer.businessProfile.vatNumber}</InfoRow>
                          )}
                          {customer.businessProfile.yearEstablished && (
                            <InfoRow icon={MdCalendarToday} label='Established'>{customer.businessProfile.yearEstablished}</InfoRow>
                          )}
                          <InfoRow icon={MdTrendingUp} label='Purchase Frequency'>
                            <Badge variant='secondary' className='capitalize'>{customer.businessProfile.purchaseFrequency}</Badge>
                          </InfoRow>
                          {customer.businessProfile.website && (
                            <InfoRow icon={MdLink} label='Website'>
                              <a href={customer.businessProfile.website} target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
                                {customer.businessProfile.website.replace(/^https?:\/\//, '')}
                              </a>
                            </InfoRow>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Saved Addresses */}
                  <motion.div
                    className='rounded-xl border border-border/50 bg-card overflow-hidden'
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='px-4 py-3 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent border-b border-border/50 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <MdLocationOn className='h-4 w-4 text-blue-500' />
                        <h3 className='text-sm font-semibold'>Saved Addresses</h3>
                      </div>
                      <Badge variant='secondary' className='text-xs'>
                        {customer.savedAddresses.length} addresses
                      </Badge>
                    </div>
                    <div className='divide-y divide-border/30'>
                      {customer.savedAddresses.map((address, index) => {
                        const AddressIcon = address.label === 'Home' ? MdHome : address.label === 'Warehouse' ? MdWarehouse : MdBusiness
                        return (
                          <motion.div
                            key={address.id}
                            className='p-4 hover:bg-muted/30 transition-colors'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className='flex items-start justify-between'>
                              <div className='flex items-start gap-3'>
                                <div className='p-2 rounded-lg bg-blue-500/10'>
                                  <AddressIcon className='h-4 w-4 text-blue-500' />
                                </div>
                                <div>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm font-medium'>{address.label}</span>
                                    {address.isDefault && (
                                      <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                                        Default
                                      </Badge>
                                    )}
                                    <Badge variant='secondary' className='text-[10px] capitalize'>
                                      {address.type}
                                    </Badge>
                                  </div>
                                  <p className='text-sm text-muted-foreground mt-1'>
                                    {address.recipientName}
                                  </p>
                                  <p className='text-xs text-muted-foreground mt-0.5'>
                                    {address.addressLine1}
                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {address.city}, {address.state} {address.postalCode}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {address.country}
                                  </p>
                                </div>
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {address.phone}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                      {customer.savedAddresses.length === 0 && (
                        <div className='p-8 text-center'>
                          <MdLocationOn className='h-8 w-8 mx-auto text-muted-foreground/30 mb-2' />
                          <p className='text-sm text-muted-foreground'>No saved addresses</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                </motion.div>
              </AnimatedTabsContent>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <AnimatedTabsContent value='financial' className='mt-0 h-full' forceMount>
                <motion.div
                  key='financial'
                  custom={direction}
                  variants={contentVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='p-6 space-y-6'
                >
                  {/* Financial Summary Stats */}
                  <motion.div
                    className='grid gap-4 grid-cols-1 md:grid-cols-3'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-primary/10'>
                          <MdTrendingUp className='h-4 w-4 text-primary' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Total Spent</span>
                      </div>
                      <p className='text-2xl font-bold'>¥{customer.totalSpent.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-emerald-500/10'>
                          <MdAccountBalanceWallet className='h-4 w-4 text-emerald-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Deposit Balance</span>
                      </div>
                      <p className='text-2xl font-bold text-emerald-600'>¥{customer.depositAmount.toLocaleString()}</p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-orange-500/10'>
                          <MdWarning className='h-4 w-4 text-orange-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Outstanding Balance</span>
                      </div>
                      <p className={cn('text-2xl font-bold', customer.outstandingBalance > 0 && 'text-orange-600')}>
                        ¥{customer.outstandingBalance.toLocaleString()}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Transaction History */}
                  <motion.div
                    className='rounded-xl border border-border/50 bg-card overflow-hidden'
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='px-4 py-3 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent border-b border-border/50 flex items-center justify-between'>
                      <h3 className='text-sm font-semibold'>Transaction History</h3>
                      <Badge variant='secondary' className='text-xs'>
                        {mockTransactions.length} transactions
                      </Badge>
                    </div>
                    <div className='divide-y divide-border/30'>
                      {mockTransactions.map((txn, index) => {
                        const Icon = transactionTypeIcons[txn.type]
                        const colorClass = transactionTypeColors[txn.type]
                        const isCredit = txn.amount > 0

                        return (
                          <motion.div
                            key={txn.id}
                            className='flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ x: 4 }}
                          >
                            <div className='flex items-center gap-3'>
                              <motion.div
                                className={cn('p-2 rounded-lg', colorClass)}
                                whileHover={{ scale: 1.1 }}
                              >
                                <Icon className='h-4 w-4' />
                              </motion.div>
                              <div>
                                <p className='text-sm font-medium'>{txn.description}</p>
                                <div className='flex items-center gap-2 mt-0.5'>
                                  <span className='text-xs text-muted-foreground'>
                                    {format(txn.date, 'MMM dd, yyyy')}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>•</span>
                                  <span className='text-xs font-mono text-muted-foreground'>
                                    {txn.reference}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className='text-right'>
                              <p className={cn(
                                'text-sm font-semibold',
                                isCredit ? 'text-emerald-600' : 'text-foreground'
                              )}>
                                {isCredit ? '+' : ''}¥{Math.abs(txn.amount).toLocaleString()}
                              </p>
                              <Badge
                                variant='outline'
                                className={cn(
                                  'text-[10px] mt-1',
                                  txn.status === 'completed'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                )}
                              >
                                {txn.status}
                              </Badge>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* Payment Methods */}
                  <motion.div
                    className='rounded-xl border border-border/50 bg-card overflow-hidden'
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='px-4 py-3 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent border-b border-border/50 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <MdAccountBalanceWallet className='h-4 w-4 text-emerald-500' />
                        <h3 className='text-sm font-semibold'>Payment Methods</h3>
                      </div>
                      <Badge variant='secondary' className='text-xs'>
                        {customer.paymentMethods.length} methods
                      </Badge>
                    </div>
                    <div className='divide-y divide-border/30'>
                      {customer.paymentMethods.map((method, index) => {
                        const getCardBrandIcon = (brand?: string) => {
                          switch (brand) {
                            case 'visa': return 'V'
                            case 'mastercard': return 'MC'
                            case 'amex': return 'AX'
                            case 'jcb': return 'JCB'
                            default: return '?'
                          }
                        }
                        const MethodIcon = method.type === 'card' ? MdCreditCard : method.type === 'crypto' ? MdCurrencyBitcoin : MdApartment
                        const methodColor = method.type === 'card' ? 'text-blue-500 bg-blue-500/10' : method.type === 'crypto' ? 'text-orange-500 bg-orange-500/10' : 'text-emerald-500 bg-emerald-500/10'

                        return (
                          <motion.div
                            key={method.id}
                            className='p-4 hover:bg-muted/30 transition-colors'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-3'>
                                <div className={cn('p-2 rounded-lg', methodColor)}>
                                  <MethodIcon className='h-4 w-4' />
                                </div>
                                <div>
                                  <div className='flex items-center gap-2'>
                                    {method.type === 'card' && (
                                      <>
                                        <span className='text-sm font-medium uppercase'>{method.cardBrand}</span>
                                        <span className='text-sm text-muted-foreground'>•••• {method.cardLast4}</span>
                                      </>
                                    )}
                                    {method.type === 'bank_transfer' && (
                                      <>
                                        <span className='text-sm font-medium'>{method.bankName}</span>
                                        <span className='text-sm text-muted-foreground'>•••• {method.accountLast4}</span>
                                      </>
                                    )}
                                    {method.type === 'crypto' && (
                                      <span className='text-sm font-medium'>Cryptocurrency Wallet</span>
                                    )}
                                    {method.isDefault && (
                                      <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className='flex items-center gap-2 mt-0.5'>
                                    {method.cardExpiry && (
                                      <span className='text-xs text-muted-foreground'>Expires {method.cardExpiry}</span>
                                    )}
                                    <span className='text-xs text-muted-foreground'>
                                      Added {format(method.createdAt, 'MMM yyyy')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant='secondary' className='text-xs capitalize'>
                                {method.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </motion.div>
                        )
                      })}
                      {customer.paymentMethods.length === 0 && (
                        <div className='p-8 text-center'>
                          <MdAccountBalanceWallet className='h-8 w-8 mx-auto text-muted-foreground/30 mb-2' />
                          <p className='text-sm text-muted-foreground'>No payment methods saved</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatedTabsContent>
            )}

            {/* Shipments Tab */}
            {activeTab === 'shipments' && (
              <AnimatedTabsContent value='shipments' className='mt-0 h-full' forceMount>
                <motion.div
                  key='shipments'
                  custom={direction}
                  variants={contentVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='p-6 space-y-6'
                >
                  {/* Shipment Stats */}
                  <motion.div
                    className='grid gap-4 grid-cols-2 md:grid-cols-4'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-blue-500/10'>
                          <MdDirectionsBoat className='h-4 w-4 text-blue-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Total Shipments</span>
                      </div>
                      <p className='text-2xl font-bold'>{shipmentStats.total}</p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-purple-500/10'>
                          <MdAnchor className='h-4 w-4 text-purple-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>In Transit</span>
                      </div>
                      <p className='text-2xl font-bold text-purple-600'>{shipmentStats.inTransit}</p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-emerald-500/10'>
                          <MdCheckCircle className='h-4 w-4 text-emerald-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Delivered</span>
                      </div>
                      <p className='text-2xl font-bold text-emerald-600'>{shipmentStats.delivered}</p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-amber-500/10'>
                          <MdTimer className='h-4 w-4 text-amber-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Pending</span>
                      </div>
                      <p className='text-2xl font-bold text-amber-600'>{shipmentStats.pending}</p>
                    </motion.div>
                  </motion.div>

                  {/* Shipments List */}
                  <motion.div
                    className='space-y-4'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    {shipments.map((shipment, index) => {
                      const statusColors = {
                        booked: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
                        loaded: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                        departed: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
                        in_transit: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
                        arrived: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                        customs_clearance: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
                        delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      }

                      return (
                        <motion.div
                          key={shipment.id}
                          className='rounded-xl border border-border/50 bg-card overflow-hidden'
                          variants={itemVariants}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className='p-4'>
                            <div className='flex items-start justify-between mb-4'>
                              <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-blue-500/10'>
                                  <MdInventory className='h-5 w-5 text-blue-500' />
                                </div>
                                <div>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm font-bold font-mono'>{shipment.containerNumber}</span>
                                    <Badge variant='outline' className={cn('text-[10px]', statusColors[shipment.status])}>
                                      {shipment.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className='flex items-center gap-2 mt-1'>
                                    <span className='text-xs text-muted-foreground'>{shipment.shippingLine}</span>
                                    <span className='text-xs text-muted-foreground'>•</span>
                                    <span className='text-xs font-mono text-muted-foreground'>{shipment.bookingNumber}</span>
                                  </div>
                                </div>
                              </div>
                              {shipment.trackingUrl && (
                                <Button variant='outline' size='sm' className='h-7 text-xs' asChild>
                                  <a href={shipment.trackingUrl} target='_blank' rel='noopener noreferrer'>
                                    <MdOpenInNew className='h-3 w-3 mr-1' />
                                    Track
                                  </a>
                                </Button>
                              )}
                            </div>

                            {/* Route */}
                            <div className='flex items-center gap-4 p-3 bg-muted/30 rounded-lg mb-4'>
                              <div className='flex-1'>
                                <p className='text-xs text-muted-foreground'>From</p>
                                <p className='text-sm font-medium'>{shipment.origin.port}</p>
                                <p className='text-xs text-muted-foreground'>{shipment.origin.country}</p>
                                <p className='text-xs text-muted-foreground mt-1'>
                                  Departed: {format(shipment.origin.departureDate, 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className='flex items-center'>
                                <div className='w-12 h-0.5 bg-border' />
                                <MdDirectionsBoat className='h-5 w-5 text-muted-foreground mx-2' />
                                <div className='w-12 h-0.5 bg-border' />
                              </div>
                              <div className='flex-1 text-right'>
                                <p className='text-xs text-muted-foreground'>To</p>
                                <p className='text-sm font-medium'>{shipment.destination.port}</p>
                                <p className='text-xs text-muted-foreground'>{shipment.destination.country}</p>
                                <p className='text-xs text-muted-foreground mt-1'>
                                  {shipment.destination.ata
                                    ? `Arrived: ${format(shipment.destination.ata, 'MMM dd, yyyy')}`
                                    : `ETA: ${format(shipment.destination.eta, 'MMM dd, yyyy')}`}
                                </p>
                              </div>
                            </div>

                            {/* Vehicles */}
                            <div>
                              <p className='text-xs text-muted-foreground mb-2'>Vehicles ({shipment.vehicles.length})</p>
                              <div className='grid gap-2'>
                                {shipment.vehicles.map((vehicle, vIndex) => (
                                  <div key={vIndex} className='flex items-center justify-between p-2 bg-muted/20 rounded'>
                                    <div className='flex items-center gap-2'>
                                      <MdDirectionsCar className='h-4 w-4 text-muted-foreground' />
                                      <span className='text-sm'>{vehicle.make} {vehicle.model}</span>
                                    </div>
                                    <span className='text-xs font-mono text-muted-foreground'>{vehicle.invoiceNumber}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    {shipments.length === 0 && (
                      <motion.div
                        className='rounded-xl border border-border/50 bg-card p-12 text-center'
                        variants={itemVariants}
                      >
                        <MdDirectionsBoat className='h-12 w-12 mx-auto text-muted-foreground/30 mb-4' />
                        <p className='text-sm text-muted-foreground'>No shipments yet</p>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatedTabsContent>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <AnimatedTabsContent value='security' className='mt-0 h-full' forceMount>
                <motion.div
                  key='security'
                  custom={direction}
                  variants={contentVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='p-6 space-y-6'
                >
                  {/* Security Status */}
                  <motion.div
                    className='grid gap-4 grid-cols-2 md:grid-cols-3'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className={cn('p-1.5 rounded-lg', customer.twoFactorEnabled ? 'bg-emerald-500/10' : 'bg-amber-500/10')}>
                          {customer.twoFactorEnabled ? (
                            <MdVerified className='h-4 w-4 text-emerald-500' />
                          ) : (
                            <MdRemoveModerator className='h-4 w-4 text-amber-500' />
                          )}
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>2FA Status</span>
                      </div>
                      <p className={cn('text-lg font-bold', customer.twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600')}>
                        {customer.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className='p-1.5 rounded-lg bg-blue-500/10'>
                          <MdMonitor className='h-4 w-4 text-blue-500' />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Active Sessions</span>
                      </div>
                      <p className='text-lg font-bold'>{customer.activeSessions.length}</p>
                    </motion.div>

                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-4'
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <div className={cn('p-1.5 rounded-lg', customer.failedLoginAttempts > 3 ? 'bg-red-500/10' : 'bg-slate-500/10')}>
                          <MdKey className={cn('h-4 w-4', customer.failedLoginAttempts > 3 ? 'text-red-500' : 'text-slate-500')} />
                        </div>
                        <span className='text-xs font-medium text-muted-foreground'>Failed Logins</span>
                      </div>
                      <p className={cn('text-lg font-bold', customer.failedLoginAttempts > 3 ? 'text-red-600' : 'text-foreground')}>
                        {customer.failedLoginAttempts}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Active Sessions */}
                  <motion.div
                    className='rounded-xl border border-border/50 bg-card overflow-hidden'
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='px-4 py-3 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent border-b border-border/50 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <MdMonitor className='h-4 w-4 text-cyan-500' />
                        <h3 className='text-sm font-semibold'>Active Sessions</h3>
                      </div>
                      <Badge variant='secondary' className='text-xs'>
                        {customer.activeSessions.length} active
                      </Badge>
                    </div>
                    <div className='divide-y divide-border/30'>
                      {customer.activeSessions.map((session, index) => {
                        const DeviceIcon = getDeviceIcon(session.device)
                        return (
                          <motion.div
                            key={session.id}
                            className='p-4 hover:bg-muted/30 transition-colors'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-3'>
                                <div className={cn('p-2 rounded-lg', session.isCurrent ? 'bg-emerald-500/10' : 'bg-slate-500/10')}>
                                  <DeviceIcon className={cn('h-4 w-4', session.isCurrent ? 'text-emerald-500' : 'text-slate-500')} />
                                </div>
                                <div>
                                  <div className='flex items-center gap-2'>
                                    <span className='text-sm font-medium'>{session.device}</span>
                                    <span className='text-xs text-muted-foreground'>• {session.browser}</span>
                                    {session.isCurrent && (
                                      <Badge variant='outline' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <div className='flex items-center gap-2 mt-0.5'>
                                    <span className='text-xs text-muted-foreground'>{session.location}</span>
                                    <span className='text-xs text-muted-foreground'>•</span>
                                    <span className='text-xs font-mono text-muted-foreground'>{session.ipAddress}</span>
                                  </div>
                                </div>
                              </div>
                              <div className='text-right'>
                                <p className='text-xs text-muted-foreground'>
                                  {session.isCurrent ? 'Active now' : formatDistanceToNow(session.lastActive, { addSuffix: true })}
                                </p>
                                {!session.isCurrent && (
                                  <Button variant='ghost' size='sm' className='h-6 mt-1 text-xs text-red-500 hover:text-red-600'>
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* Login History */}
                  <motion.div
                    className='rounded-xl border border-border/50 bg-card overflow-hidden'
                    variants={itemVariants}
                  >
                    <div className='px-4 py-3 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent border-b border-border/50 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <MdLogin className='h-4 w-4 text-cyan-500' />
                        <h3 className='text-sm font-semibold'>Login History</h3>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span className='text-emerald-600 font-medium'>{loginStats.success} success</span>
                          <span>•</span>
                          <span className='text-red-600 font-medium'>{loginStats.failed} failed</span>
                        </div>
                        <Select value={loginFilter} onValueChange={(v) => setLoginFilter(v as typeof loginFilter)}>
                          <SelectTrigger className='w-32 h-8'>
                            <MdFilterList className='h-3 w-3 mr-2' />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all'>All ({loginStats.total})</SelectItem>
                            <SelectItem value='success'>Success ({loginStats.success})</SelectItem>
                            <SelectItem value='failed'>Failed ({loginStats.failed})</SelectItem>
                            <SelectItem value='blocked'>Blocked ({loginStats.blocked})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className='divide-y divide-border/30 max-h-[400px] overflow-y-auto'>
                      {filteredLogins.map((login, index) => {
                        const StatusIcon = loginStatusConfig[login.status].icon
                        const DeviceIcon = getDeviceIcon(login.device)

                        return (
                          <motion.div
                            key={login.id}
                            className='flex items-center justify-between p-4 hover:bg-muted/30 transition-colors'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            <div className='flex items-center gap-4'>
                              <motion.div
                                className={cn('p-2 rounded-lg', loginStatusConfig[login.status].color)}
                                whileHover={{ scale: 1.1 }}
                              >
                                <StatusIcon className='h-4 w-4' />
                              </motion.div>
                              <div>
                                <div className='flex items-center gap-2'>
                                  <DeviceIcon className='h-4 w-4 text-muted-foreground' />
                                  <p className='text-sm font-medium'>{login.device}</p>
                                  <span className='text-xs text-muted-foreground'>• {login.browser}</span>
                                </div>
                                <div className='flex items-center gap-2 mt-1'>
                                  <span className='text-xs text-muted-foreground'>
                                    {format(login.timestamp, 'MMM dd, yyyy HH:mm')}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>•</span>
                                  <span className='text-xs text-muted-foreground'>{login.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-3'>
                              <div className='text-right'>
                                <div className='flex items-center gap-1'>
                                  <span className='text-xs font-mono text-muted-foreground'>{login.ipAddress}</span>
                                  <CopyButton text={login.ipAddress} />
                                </div>
                                {login.sessionDuration && (
                                  <span className='text-xs text-muted-foreground'>Session: {login.sessionDuration}</span>
                                )}
                                {login.failureReason && (
                                  <span className='text-xs text-red-500'>{login.failureReason}</span>
                                )}
                              </div>
                              <Badge
                                variant='outline'
                                className={cn(
                                  'text-[10px]',
                                  login.status === 'success' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                                  login.status === 'failed' && 'bg-red-500/10 text-red-600 border-red-500/20',
                                  login.status === 'blocked' && 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                )}
                              >
                                {loginStatusConfig[login.status].label}
                              </Badge>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatedTabsContent>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <AnimatedTabsContent value='activity' className='mt-0 h-full' forceMount>
                <motion.div
                  key='activity'
                  custom={direction}
                  variants={contentVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='p-6'
                >
                  {/* Filter Bar */}
                  <div className='flex items-center justify-between mb-6'>
                    <h3 className='text-sm font-semibold'>Activity Log</h3>
                    <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v as typeof activityFilter)}>
                      <SelectTrigger className='w-40 h-8'>
                        <MdFilterList className='h-3 w-3 mr-2' />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Activities</SelectItem>
                        <SelectItem value='login'>Logins</SelectItem>
                        <SelectItem value='bid'>Bids</SelectItem>
                        <SelectItem value='purchase'>Purchases</SelectItem>
                        <SelectItem value='payment'>Payments</SelectItem>
                        <SelectItem value='message'>Messages</SelectItem>
                        <SelectItem value='document'>Documents</SelectItem>
                        <SelectItem value='profile_update'>Profile Updates</SelectItem>
                        <SelectItem value='verification'>Verification</SelectItem>
                        <SelectItem value='level_change'>Level Changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                    className='space-y-1'
                  >
                    {filteredActivity.map((activity, index) => {
                      const Icon = activityIcons[activity.type]
                      const colorClass = activityColors[activity.type]

                      return (
                        <motion.div
                          key={activity.id}
                          variants={itemVariants}
                          className='flex gap-4 py-4 border-b border-border/30 last:border-0'
                        >
                          {/* Timeline dot and line */}
                          <div className='flex flex-col items-center'>
                            <motion.div
                              className={cn('p-2 rounded-full', colorClass)}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Icon className='h-4 w-4' />
                            </motion.div>
                            {index < filteredActivity.length - 1 && (
                              <motion.div
                                className='w-0.5 flex-1 bg-border/50 mt-2'
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className='flex-1 pt-0.5'>
                            <p className='text-sm font-medium'>{activity.description}</p>
                            <div className='flex items-center gap-3 mt-1 flex-wrap'>
                              {activity.metadata?.amount && (
                                <span className='text-sm font-semibold text-primary'>
                                  ¥{activity.metadata.amount.toLocaleString()}
                                </span>
                              )}
                              {activity.metadata?.vehicle && (
                                <Badge variant='outline' className='text-xs'>
                                  <MdDirectionsCar className='h-3 w-3 mr-1' />
                                  {activity.metadata.vehicle}
                                </Badge>
                              )}
                              {activity.performedBy && (
                                <span className='text-xs text-muted-foreground'>
                                  by {activity.performedBy}
                                </span>
                              )}
                              <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                <MdAccessTime className='h-3 w-3' />
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          {/* Type Badge */}
                          <Badge variant='secondary' className='text-xs capitalize h-fit'>
                            {activity.type.replace('_', ' ')}
                          </Badge>
                        </motion.div>
                      )
                    })}
                  </motion.div>

                  {filteredActivity.length === 0 && (
                    <motion.div
                      className='rounded-xl border border-border/50 bg-card p-12 text-center'
                      variants={itemVariants}
                    >
                      <MdMonitorHeart className='h-12 w-12 mx-auto text-muted-foreground/30 mb-4' />
                      <p className='text-sm text-muted-foreground'>No activity found</p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatedTabsContent>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <AnimatedTabsContent value='notes' className='mt-0 h-full' forceMount>
                <motion.div
                  key='notes'
                  custom={direction}
                  variants={contentVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='p-6'
                >
                  <motion.div
                    className='rounded-xl border border-border/50 bg-card overflow-hidden'
                    variants={itemVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <div className='px-4 py-3 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-b border-border/50 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='p-1.5 rounded-lg bg-amber-500/10'>
                          <MdNote className='h-4 w-4 text-amber-600' />
                        </div>
                        <h3 className='text-sm font-semibold'>Internal Notes</h3>
                      </div>
                      {!isEditingNotes ? (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setIsEditingNotes(true)}
                          className='h-7 text-xs'
                        >
                          <MdAdd className='h-3 w-3 mr-1' />
                          {customer.notes ? 'Edit Notes' : 'Add Note'}
                        </Button>
                      ) : (
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => {
                              setNotesValue(customer.notes || '')
                              setIsEditingNotes(false)
                            }}
                            className='h-7 text-xs'
                          >
                            Cancel
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => {
                              if (onUpdateNotes) {
                                onUpdateNotes(notesValue)
                              }
                              setIsEditingNotes(false)
                              toast.success('Notes updated successfully')
                            }}
                            className='h-7 text-xs'
                          >
                            <MdSave className='h-3 w-3 mr-1' />
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className='p-4'>
                      {isEditingNotes ? (
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder='Add internal notes about this customer...'
                          className='min-h-[200px] resize-none'
                        />
                      ) : customer.notes ? (
                        <div className='prose prose-sm max-w-none'>
                          <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                            {customer.notes}
                          </p>
                        </div>
                      ) : (
                        <div className='text-center py-12'>
                          <MdNote className='h-12 w-12 mx-auto text-muted-foreground/30 mb-4' />
                          <p className='text-sm text-muted-foreground mb-4'>
                            No notes added yet
                          </p>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setIsEditingNotes(true)}
                          >
                            <MdAdd className='h-4 w-4 mr-2' />
                            Add Note
                          </Button>
                        </div>
                      )}
                    </div>
                    {customer.notes && !isEditingNotes && (
                      <div className='px-4 py-3 border-t border-border/50 bg-muted/20'>
                        <p className='text-xs text-muted-foreground'>
                          Last updated: {format(new Date(), 'MMM dd, yyyy \'at\' h:mm a')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatedTabsContent>
            )}

          </AnimatePresence>
        </div>
      </AnimatedTabs>
    </div>
  )
}

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { customers as allCustomers, type Customer, type UserLevel } from '../data/customers'
import { CustomerPageHeader } from './customer-page/customer-page-header'
import { CustomerPageSidebar } from './customer-page/customer-page-sidebar'
import { CustomerPageContent } from './customer-page/customer-page-content'
import { VerificationApprovalModal } from './verification-approval-modal'
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
import { MdPersonAdd } from 'react-icons/md'

const CURRENT_USER_ID = 'staff-001'
const CURRENT_USER_NAME = 'Mike Johnson'

interface CustomerDetailPageProps {
  customerId: string
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const router = useRouter()

  // Find the customer
  const initialCustomer = useMemo(() =>
    allCustomers.find(c => c.id === customerId) || null,
    [customerId]
  )

  const [customer, setCustomer] = useState<Customer | null>(initialCustomer)
  const [activeTab, setActiveTab] = useState('overview')
  const [emailCopied, setEmailCopied] = useState(false)
  const [phoneCopied, setPhoneCopied] = useState(false)
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)

  const handleBack = useCallback(() => {
    router.push('/customers')
  }, [router])

  const handleCopyEmail = useCallback(() => {
    if (customer) {
      navigator.clipboard.writeText(customer.email)
      setEmailCopied(true)
      toast.success('Email copied to clipboard')
      setTimeout(() => setEmailCopied(false), 2000)
    }
  }, [customer])

  const handleCopyPhone = useCallback(() => {
    if (customer) {
      navigator.clipboard.writeText(customer.phone)
      setPhoneCopied(true)
      toast.success('Phone copied to clipboard')
      setTimeout(() => setPhoneCopied(false), 2000)
    }
  }, [customer])

  const handleSendEmail = useCallback(() => {
    if (customer) {
      window.location.href = `mailto:${customer.email}`
      toast.success('Opening email client...')
    }
  }, [customer])

  const handleCallCustomer = useCallback(() => {
    if (customer) {
      toast.success(`Calling ${customer.name}...`)
    }
  }, [customer])

  const handleWhatsApp = useCallback(() => {
    if (customer) {
      const phone = customer.phone.replace(/\D/g, '')
      window.open(`https://wa.me/${phone}`, '_blank')
      toast.success('Opening WhatsApp...')
    }
  }, [customer])

  const handleVerifyCustomer = useCallback(() => {
    if (customer) {
      setLevelDialogOpen(true)
    }
  }, [customer])

  const handleChangeUserLevel = useCallback((updatedCustomer: Customer, data: { userLevel: UserLevel }) => {
    setCustomer(prev => prev ? {
      ...prev,
      userLevel: data.userLevel,
      verificationStatus: 'verified',
    } : null)
    toast.success(`Customer level changed to ${data.userLevel}`)
    setLevelDialogOpen(false)
  }, [])

  const handleClaimCustomer = useCallback(() => {
    setCustomer(prev => prev ? {
      ...prev,
      assignedTo: CURRENT_USER_ID,
      assignedToName: CURRENT_USER_NAME,
    } : null)
    toast.success('Customer claimed successfully')
    setClaimDialogOpen(false)
  }, [])

  const handleSuspendCustomer = useCallback(() => {
    if (customer) {
      setCustomer(prev => prev ? {
        ...prev,
        status: prev.status === 'suspended' ? 'active' : 'suspended',
      } : null)
      toast.success(customer.status === 'suspended' ? 'Customer activated' : 'Customer suspended')
    }
  }, [customer])


  const handleEditCustomer = useCallback((data: Partial<Customer>) => {
    setCustomer(prev => prev ? { ...prev, ...data } : null)
  }, [])

  const handleUpdateNotes = useCallback((notes: string) => {
    setCustomer(prev => prev ? { ...prev, notes } : null)
    toast.success('Notes saved successfully')
  }, [])

  // Not found state
  if (!customer) {
    return (
      <>
        <Header fixed>
          <Search />
          <HeaderActions />
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold'>Customer Not Found</h2>
            <p className='text-muted-foreground mt-2'>The customer you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={handleBack}
              className='mt-4 text-primary hover:underline'
            >
              Back to Customers
            </button>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col overflow-hidden p-0'>
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* Header */}
          <CustomerPageHeader
            customer={customer}
            emailCopied={emailCopied}
            phoneCopied={phoneCopied}
            onBack={handleBack}
            onCopyEmail={handleCopyEmail}
            onCopyPhone={handleCopyPhone}
            onOpenLevelDialog={() => setLevelDialogOpen(true)}
            onSendEmail={handleSendEmail}
            onCallCustomer={handleCallCustomer}
            onWhatsApp={handleWhatsApp}
            onVerifyCustomer={handleVerifyCustomer}
            onSuspendCustomer={handleSuspendCustomer}
            onEditCustomer={handleEditCustomer}
          />

          {/* Main Content Area */}
          <div className='flex flex-1 overflow-hidden'>
            {/* Sidebar */}
            <CustomerPageSidebar
              customer={customer}
              onClaimCustomer={() => setClaimDialogOpen(true)}
            />

            {/* Content */}
            <CustomerPageContent
              customer={customer}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onUpdateNotes={handleUpdateNotes}
            />
          </div>
        </div>
      </Main>

      {/* Change User Level Modal */}
      <VerificationApprovalModal
        customer={customer}
        open={levelDialogOpen}
        onOpenChange={setLevelDialogOpen}
        onApprove={handleChangeUserLevel}
      />

      {/* Claim Customer Confirmation Dialog */}
      <AlertDialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Claim Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim <span className='font-medium text-foreground'>{customer.name}</span>?
              This customer will be assigned to you and appear in your customer list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-emerald-600 hover:bg-emerald-700'
              onClick={handleClaimCustomer}
            >
              <MdPersonAdd className='mr-2 h-4 w-4' />
              Claim Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

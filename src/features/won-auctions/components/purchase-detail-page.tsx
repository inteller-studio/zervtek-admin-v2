'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdReceipt,
  MdLocalShipping,
  MdCreditCard,
  MdBuild,
  MdDescription,
  MdDirectionsBoat,
  MdInventory2,
  MdSend,
} from 'react-icons/md'
import { cn } from '@/lib/utils'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { ConfigDrawer } from '@/components/config-drawer'

import {
  purchases as initialWonAuctions,
  type Purchase,
  type Document,
  type ShipmentTracking,
  type Payment,
} from '../data/won-auctions'
import { type PurchaseWorkflow, type DocumentChecklist } from '../types/workflow'
import {
  createDefaultWorkflow,
  canAccessStage,
  getStageKey,
  isStageComplete,
  calculateWorkflowProgress,
} from '../utils/workflow'
import { mockYards } from '../../yards/data/yards'

// Stage configuration with icons
const STAGES = [
  { number: 1, label: 'Purchase', icon: MdReceipt },
  { number: 2, label: 'Transport', icon: MdLocalShipping },
  { number: 3, label: 'Payment', icon: MdCreditCard },
  { number: 4, label: 'Repair', icon: MdBuild },
  { number: 5, label: 'Docs', icon: MdDescription },
  { number: 6, label: 'Booking', icon: MdDirectionsBoat },
  { number: 7, label: 'Shipped', icon: MdInventory2 },
  { number: 8, label: 'DHL', icon: MdSend },
]

// Animation variants for stepper
const stepperContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
}

const stepperItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
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

// Page sub-components
import { PurchasePageHeader } from './purchase-page/purchase-page-header'
import { PurchasePageContent } from './purchase-page/purchase-page-content'

// Dialogs (reused from existing)
import { RecordPaymentDialog } from './dialogs/record-payment-dialog'
import { DocumentUploadDialog } from './dialogs/document-upload-dialog'
import { ShippingUpdateDialog } from './dialogs/shipping-update-dialog'
import { InvoiceDialog } from './dialogs/invoice-dialog'
import { ExportCertificateDialog } from './dialogs/export-certificate-dialog'

interface PurchaseDetailPageProps {
  auctionId: string
}

export function PurchaseDetailPage({ auctionId }: PurchaseDetailPageProps) {
  const router = useRouter()

  // Data state
  const [auctions, setAuctions] = useState<Purchase[]>(initialWonAuctions)
  const auction = useMemo(() => auctions.find(a => a.id === auctionId), [auctions, auctionId])

  // Workflow state for optimistic updates
  const [localWorkflow, setLocalWorkflow] = useState<PurchaseWorkflow | null>(null)

  // Active tab and stage state
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [activeStage, setActiveStage] = useState<string>('afterPurchase')

  // VIN copy state
  const [vinCopied, setVinCopied] = useState(false)

  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [exportCertDialogOpen, setExportCertDialogOpen] = useState(false)

  // Mock current user - in real app, get from auth context
  const currentUser = 'Admin User'

  // Initialize workflow when auction changes
  useEffect(() => {
    if (auction) {
      const workflow = auction.workflow || createDefaultWorkflow()
      setLocalWorkflow(workflow)

      // Set active stage to current stage
      const stageKey = getStageKey(workflow.currentStage)
      if (stageKey) {
        setActiveStage(stageKey)
      }
    }
  }, [auction])

  // Handle workflow updates with optimistic UI
  const handleWorkflowUpdate = useCallback(
    (updatedWorkflow: PurchaseWorkflow) => {
      if (!auction) return

      // Optimistic update
      setLocalWorkflow(updatedWorkflow)

      // Update auction in state
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auction.id) return a
          return { ...a, workflow: updatedWorkflow }
        })
      )

      // Auto-advance to next stage if current is complete
      const currentStageComplete = isStageComplete(updatedWorkflow, updatedWorkflow.currentStage)
      if (currentStageComplete && updatedWorkflow.currentStage < 8) {
        const nextStage = updatedWorkflow.currentStage + 1
        const nextStageKey = getStageKey(nextStage)

        // Update workflow with new current stage
        const advancedWorkflow = {
          ...updatedWorkflow,
          currentStage: nextStage,
          updatedAt: new Date(),
        }
        setLocalWorkflow(advancedWorkflow)
        setAuctions((prev) =>
          prev.map((a) => {
            if (a.id !== auction.id) return a
            return { ...a, workflow: advancedWorkflow }
          })
        )

        // Switch accordion to next stage
        if (nextStageKey) {
          setActiveStage(nextStageKey)
        }

        toast.success(
          `Stage ${updatedWorkflow.currentStage} completed! Moving to Stage ${nextStage}.`
        )
      }
    },
    [auction]
  )

  // Handle document upload with optional workflow checklist sync
  const handleDocumentUpload = useCallback(
    (documents: Document[], checklistKey?: string) => {
      if (!auction) return

      // Update auction documents
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auction.id) return a
          return {
            ...a,
            documents: [...a.documents, ...documents],
            status: a.status === 'documents_pending' ? 'processing' : a.status,
            timeline: {
              ...a.timeline,
              documentsUploaded: new Date(),
            },
          }
        })
      )

      // Auto-update workflow checklist if a required document type was uploaded
      if (checklistKey && localWorkflow) {
        const updatedWorkflow: PurchaseWorkflow = {
          ...localWorkflow,
          stages: {
            ...localWorkflow.stages,
            documentsReceived: {
              ...localWorkflow.stages.documentsReceived,
              checklist: {
                ...localWorkflow.stages.documentsReceived.checklist,
                [checklistKey]: {
                  received: true,
                  receivedAt: new Date(),
                  receivedBy: currentUser,
                  documentId: documents[0]?.id,
                },
              },
            },
          },
          updatedAt: new Date(),
        }
        handleWorkflowUpdate(updatedWorkflow)
        toast.success(`Document uploaded & workflow updated`)
      } else {
        toast.success(`${documents.length} document(s) uploaded`)
      }
    },
    [auction, localWorkflow, handleWorkflowUpdate, currentUser]
  )

  // Handle document delete
  const handleDocumentDelete = useCallback(
    (documentId: string) => {
      if (!auction) return
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auction.id) return a
          return {
            ...a,
            documents: a.documents.filter((d) => d.id !== documentId),
          }
        })
      )
      toast.success('Document deleted')
    },
    [auction]
  )

  // Handle stage click from stepper
  const handleStageClick = useCallback(
    (stageNumber: number) => {
      if (!localWorkflow) return

      if (canAccessStage(localWorkflow, stageNumber)) {
        const stageKey = getStageKey(stageNumber)
        if (stageKey) {
          setActiveStage(stageKey)
          setActiveTab('workflow')
        }
      } else {
        toast.error('Complete previous stages first')
      }
    },
    [localWorkflow]
  )

  // Copy VIN
  const copyVin = useCallback(() => {
    if (!auction) return
    navigator.clipboard.writeText(auction.vehicleInfo.vin)
    setVinCopied(true)
    toast.success('VIN copied to clipboard')
    setTimeout(() => setVinCopied(false), 2000)
  }, [auction])

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/purchases')
  }, [router])

  // Payment handler
  const handleRecordPayment = useCallback(
    (paymentData: Omit<Payment, 'id' | 'auctionId' | 'recordedBy' | 'recordedAt'>) => {
      if (!auction) return

      const newPayment: Payment = {
        id: String(Date.now()),
        auctionId: auction.id,
        ...paymentData,
        recordedBy: currentUser,
        recordedAt: new Date(),
      }

      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auction.id) return a

          const newPaidAmount = a.paidAmount + paymentData.amount
          const newPaymentStatus =
            newPaidAmount >= a.totalAmount
              ? 'completed'
              : newPaidAmount > 0
                ? 'partial'
                : 'pending'

          return {
            ...a,
            paidAmount: newPaidAmount,
            paymentStatus: newPaymentStatus,
            payments: [...a.payments, newPayment],
            timeline: {
              ...a.timeline,
              paymentReceived: new Date(),
            },
          }
        })
      )

      toast.success('Payment recorded successfully')
      setPaymentDialogOpen(false)
    },
    [auction, currentUser]
  )

  // Shipping update handler
  const handleUpdateShipping = useCallback(
    (shipment: ShipmentTracking) => {
      if (!auction) return
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auction.id) return a
          return {
            ...a,
            shipment,
            status: 'shipping',
            timeline: {
              ...a.timeline,
              shippingStarted: new Date(),
            },
          }
        })
      )
      toast.success('Shipping updated')
      setShippingDialogOpen(false)
    },
    [auction]
  )

  // Handle dialog document upload with checklist sync
  const handleDialogDocumentUpload = useCallback(
    (auctionId: string, documents: Document[], checklistKey?: keyof DocumentChecklist) => {
      handleDocumentUpload(documents)

      // Auto-update workflow checklist if a required document type was uploaded
      if (checklistKey && localWorkflow) {
        const updatedWorkflow: PurchaseWorkflow = {
          ...localWorkflow,
          stages: {
            ...localWorkflow.stages,
            documentsReceived: {
              ...localWorkflow.stages.documentsReceived,
              checklist: {
                ...localWorkflow.stages.documentsReceived.checklist,
                [checklistKey]: {
                  received: true,
                  receivedAt: new Date(),
                  receivedBy: currentUser,
                  documentId: documents[0]?.id,
                },
              },
            },
          },
          updatedAt: new Date(),
        }
        handleWorkflowUpdate(updatedWorkflow)
        toast.success(`${checklistKey} marked as received in workflow`)
      }

      setDocumentDialogOpen(false)
    },
    [handleDocumentUpload, localWorkflow, handleWorkflowUpdate, currentUser]
  )

  // Handle dialog shipping update
  const handleDialogShippingUpdate = useCallback(
    (auctionId: string, shipment: ShipmentTracking) => {
      handleUpdateShipping(shipment)
    },
    [handleUpdateShipping]
  )

  // Handle generate invoice
  const handleGenerateInvoice = useCallback(() => {
    setInvoiceDialogOpen(true)
  }, [])

  // Handle notes update
  const handleNotesUpdate = useCallback(
    (notes: string) => {
      if (!auction) return
      setAuctions((prev) =>
        prev.map((a) => {
          if (a.id !== auction.id) return a
          return {
            ...a,
            notes,
            updatedAt: new Date(),
          }
        })
      )
      toast.success('Notes updated')
    },
    [auction]
  )

  // Handle workflow finalization
  const handleFinalize = useCallback(() => {
    if (!localWorkflow || !auction) return

    const finalizedWorkflow: PurchaseWorkflow = {
      ...localWorkflow,
      finalized: true,
      finalizedAt: new Date(),
      finalizedBy: currentUser,
      updatedAt: new Date(),
    }

    handleWorkflowUpdate(finalizedWorkflow)
    toast.success('Workflow finalized successfully')
  }, [localWorkflow, auction, currentUser, handleWorkflowUpdate])

  // If auction not found
  if (!auction || !localWorkflow) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ConfigDrawer />
          </div>
          <HeaderActions />
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Loading purchase details...</p>
          </div>
        </Main>
      </>
    )
  }

  // Filter active yards for workflow
  const activeYards = mockYards.filter((y) => y.status === 'active')
  const progress = calculateWorkflowProgress(localWorkflow)
  const vehicleTitle = `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-0 !p-0 overflow-hidden'>
        {/* Page Header - Hidden when Process tab is active */}
        <AnimatePresence>
          {activeTab !== 'workflow' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='overflow-hidden'
            >
              <PurchasePageHeader
                auction={auction}
                vehicleTitle={vehicleTitle}
                vinCopied={vinCopied}
                onBack={handleBack}
                onCopyVin={copyVin}
                notes={auction.notes || ''}
                onNotesUpdate={handleNotesUpdate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className='flex-1 flex overflow-hidden'>
          {/* Content */}
          <PurchasePageContent
            auction={auction}
            workflow={localWorkflow}
            activeTab={activeTab}
            activeStage={activeStage}
            yards={activeYards}
            currentUser={currentUser}
            onTabChange={setActiveTab}
            onStageChange={setActiveStage}
            onWorkflowUpdate={handleWorkflowUpdate}
            onDocumentUpload={handleDocumentUpload}
            onDocumentDelete={handleDocumentDelete}
            onRecordPayment={() => setPaymentDialogOpen(true)}
            onUpdateShipping={() => setShippingDialogOpen(true)}
            onGenerateInvoice={handleGenerateInvoice}
            onOpenExportCertificate={() => setExportCertDialogOpen(true)}
            onFinalize={handleFinalize}
          />
        </div>
      </Main>

      {/* Dialogs */}
      <RecordPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        auction={auction}
        onSubmit={(auctionId, data) => handleRecordPayment(data)}
      />

      <DocumentUploadDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        auction={auction}
        onUpload={handleDialogDocumentUpload}
        documentChecklist={localWorkflow?.stages.documentsReceived.checklist}
      />

      <ShippingUpdateDialog
        open={shippingDialogOpen}
        onOpenChange={setShippingDialogOpen}
        auction={auction}
        onSubmit={handleDialogShippingUpdate}
      />

      <InvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        auction={auction}
      />

      <ExportCertificateDialog
        open={exportCertDialogOpen}
        onOpenChange={setExportCertDialogOpen}
        auction={auction}
        workflow={localWorkflow}
        onWorkflowUpdate={handleWorkflowUpdate}
        currentUser={currentUser}
      />
    </>
  )
}

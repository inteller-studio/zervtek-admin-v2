'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdClose,
  MdDirectionsCar,
  MdContentCopy,
  MdCheck,
  MdPerson,
  MdCalendarToday,
  MdLocationOn,
  MdCreditCard,
  MdDescription,
  MdDirectionsBoat,
  MdChevronLeft,
  MdChevronRight,
  MdCheckCircle,
  MdAttachMoney,
} from 'react-icons/md'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { type Purchase, type Document } from '../../data/won-auctions'
import { type PurchaseWorkflow, WORKFLOW_STAGES } from '../../types/workflow'
import {
  createDefaultWorkflow,
  canAccessStage,
  getStageKey,
  isStageComplete,
  calculateWorkflowProgress,
} from '../../utils/workflow'
import { mockYards } from '../../../yards/data/yards'
import { WorkflowStepper } from './workflow-stepper'
import { WorkflowSidebar } from '../workflow/workflow-sidebar'
import { UnifiedDocumentPanel } from './document-panel/unified-document-panel'
import { OverviewPanel } from './overview/overview-panel'

// Status styles
const statusStyles: Record<Purchase['status'], string> = {
  payment_pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  documents_pending: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  shipping: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  completed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

const statusLabels: Record<Purchase['status'], string> = {
  payment_pending: 'Payment Pending',
  processing: 'Processing',
  documents_pending: 'Docs Pending',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
}

interface UnifiedPurchaseModalProps {
  open: boolean
  onClose: () => void
  auction: Purchase | null
  onWorkflowUpdate: (auctionId: string, workflow: PurchaseWorkflow) => void
  onDocumentUpload: (auctionId: string, documents: Document[]) => void
  onDocumentDelete?: (auctionId: string, documentId: string) => void
  onRecordPayment?: () => void
  onUpdateShipping?: () => void
  onGenerateInvoice?: () => void
  onMarkDelivered?: (auction: Purchase) => void
  onMarkCompleted?: (auction: Purchase) => void
}

export function UnifiedPurchaseModal({
  open,
  onClose,
  auction,
  onWorkflowUpdate,
  onDocumentUpload,
  onDocumentDelete,
  onRecordPayment,
  onUpdateShipping,
  onGenerateInvoice,
  onMarkDelivered,
  onMarkCompleted,
}: UnifiedPurchaseModalProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('workflow')

  // Workflow state for optimistic updates
  const [localWorkflow, setLocalWorkflow] = useState<PurchaseWorkflow | null>(null)

  // Active stage for workflow accordion
  const [activeStage, setActiveStage] = useState<string>('afterPurchase')

  // VIN copy state
  const [vinCopied, setVinCopied] = useState(false)

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

  // Reset tab to workflow when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab('workflow')
    }
  }, [open])

  // Handle workflow updates with optimistic UI
  const handleWorkflowUpdate = useCallback(
    (updatedWorkflow: PurchaseWorkflow) => {
      if (!auction) return

      // Optimistic update
      setLocalWorkflow(updatedWorkflow)

      // Call parent handler
      onWorkflowUpdate(auction.id, updatedWorkflow)

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
        onWorkflowUpdate(auction.id, advancedWorkflow)

        // Switch accordion to next stage
        if (nextStageKey) {
          setActiveStage(nextStageKey)
        }

        toast.success(
          `Stage ${updatedWorkflow.currentStage} completed! Moving to Stage ${nextStage}.`
        )
      }
    },
    [auction, onWorkflowUpdate]
  )

  // Handle document upload
  const handleDocumentUpload = useCallback(
    (documents: Document[]) => {
      if (!auction) return
      onDocumentUpload(auction.id, documents)
      toast.success(`${documents.length} document(s) uploaded`)
    },
    [auction, onDocumentUpload]
  )

  // Handle document delete
  const handleDocumentDelete = useCallback(
    (documentId: string) => {
      if (!auction || !onDocumentDelete) return
      onDocumentDelete(auction.id, documentId)
      toast.success('Document deleted')
    },
    [auction, onDocumentDelete]
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

  // Navigate stages
  const goToPreviousStage = useCallback(() => {
    if (!localWorkflow || localWorkflow.currentStage <= 1) return
    const prevStage = localWorkflow.currentStage - 1
    if (canAccessStage(localWorkflow, prevStage)) {
      const stageKey = getStageKey(prevStage)
      if (stageKey) setActiveStage(stageKey)
    }
  }, [localWorkflow])

  const goToNextStage = useCallback(() => {
    if (!localWorkflow || localWorkflow.currentStage >= 8) return
    const nextStage = localWorkflow.currentStage + 1
    if (canAccessStage(localWorkflow, nextStage)) {
      const stageKey = getStageKey(nextStage)
      if (stageKey) setActiveStage(stageKey)
    }
  }, [localWorkflow])

  if (!auction || !localWorkflow) {
    return null
  }

  // Filter active yards for workflow
  const activeYards = mockYards.filter((y) => y.status === 'active')
  const progress = calculateWorkflowProgress(localWorkflow)
  const vehicleTitle = `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`
  const currentStage = WORKFLOW_STAGES.find((s) => s.number === localWorkflow.currentStage)
  const paymentProgress = auction.totalAmount > 0 ? Math.round((auction.paidAmount / auction.totalAmount) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='[display:flex] flex-col !max-w-5xl w-[95vw] !p-0 !gap-0 overflow-hidden max-h-[90vh]'
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key='modal-content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='flex flex-col h-full'
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='border-b bg-muted/30'
            >
              {/* Top Row: Vehicle Info */}
              <div className='px-6 py-4 flex items-start justify-between gap-4'>
                <div className='flex gap-4 min-w-0'>
                  {/* Vehicle Image */}
                  <div className='h-14 w-18 rounded-xl overflow-hidden bg-muted shrink-0'>
                    {auction.vehicleInfo.images[0] && auction.vehicleInfo.images[0] !== '#' ? (
                      <img
                        src={auction.vehicleInfo.images[0]}
                        alt={vehicleTitle}
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='h-full w-full flex items-center justify-center'>
                        <MdDirectionsCar className='h-6 w-6 text-muted-foreground' />
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className='space-y-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <h2 className='text-lg font-semibold truncate'>{vehicleTitle}</h2>
                      <Badge variant='outline' className='text-xs shrink-0'>
                        {auction.auctionId}
                      </Badge>
                      <Badge
                        variant='outline'
                        className={cn('text-xs shrink-0', statusStyles[auction.status])}
                      >
                        {statusLabels[auction.status]}
                      </Badge>
                    </div>

                    {/* VIN */}
                    <button
                      onClick={copyVin}
                      className='inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <span className='truncate'>{auction.vehicleInfo.vin}</span>
                      {vinCopied ? (
                        <MdCheck className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
                      ) : (
                        <MdContentCopy className='h-3.5 w-3.5 shrink-0' />
                      )}
                    </button>

                    {/* Meta info */}
                    <div className='flex items-center gap-3 text-xs text-muted-foreground flex-wrap'>
                      <span className='flex items-center gap-1'>
                        <MdPerson className='h-3 w-3' />
                        {auction.winnerName}
                      </span>
                      <span className='flex items-center gap-1'>
                        <MdCalendarToday className='h-3 w-3' />
                        {format(new Date(auction.auctionEndDate), 'MMM d, yyyy')}
                      </span>
                      {auction.destinationPort && (
                        <span className='flex items-center gap-1'>
                          <MdLocationOn className='h-3 w-3' />
                          {auction.destinationPort.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={onClose}
                  className='h-8 w-8 shrink-0 rounded-full'
                >
                  <MdClose className='h-4 w-4' />
                </Button>
              </div>

              {/* Workflow Stepper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className='px-6 py-4 border-t bg-background/50'
              >
                <WorkflowStepper
                  workflow={localWorkflow}
                  onStageClick={handleStageClick}
                />
              </motion.div>

              {/* Progress Bar */}
              <div className='h-1 bg-muted'>
                <motion.div
                  className='h-full bg-primary'
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>

            {/* Tabs Content */}
            {(() => {
              const modalTabs: TabItem[] = [
                { id: 'workflow', label: 'Workflow', icon: MdCheckCircle },
                { id: 'documents', label: 'Documents', icon: MdDescription, badge: auction.documents.length > 0 ? auction.documents.length : undefined },
                { id: 'payments', label: 'Payments', icon: MdCreditCard, badge: `${paymentProgress}%`, badgeColor: paymentProgress >= 100 ? 'emerald' : 'primary' },
                { id: 'shipping', label: 'Shipping', icon: MdDirectionsBoat },
              ]

              return (
                <AnimatedTabs
                  tabs={modalTabs}
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='flex-1 flex flex-col overflow-hidden'
                  variant='compact'
                >
                  <div className='flex-1 overflow-y-auto min-h-0'>
                    <AnimatedTabsContent value='workflow' className='data-[state=active]:block'>
                      <WorkflowSidebar
                        auction={auction}
                        workflow={localWorkflow}
                        activeStage={activeStage}
                        onStageChange={setActiveStage}
                        onWorkflowUpdate={handleWorkflowUpdate}
                        currentUser={currentUser}
                        yards={activeYards}
                      />
                    </AnimatedTabsContent>

                    <AnimatedTabsContent value='documents'>
                      <UnifiedDocumentPanel
                        auction={auction}
                        workflow={localWorkflow}
                        isCollapsed={false}
                        onToggleCollapse={() => {}}
                        onDocumentUpload={handleDocumentUpload}
                        onDocumentDelete={onDocumentDelete ? handleDocumentDelete : undefined}
                      />
                    </AnimatedTabsContent>

                    <AnimatedTabsContent value='payments'>
                      <OverviewPanel
                        auction={auction}
                        onRecordPayment={onRecordPayment}
                        onUpdateShipping={onUpdateShipping}
                        onGenerateInvoice={onGenerateInvoice}
                      />
                    </AnimatedTabsContent>

                    <AnimatedTabsContent value='shipping' className='p-6'>
                      <div className='rounded-xl border bg-card p-6'>
                        <h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4'>
                          Shipping Details
                        </h3>
                        {auction.shipment ? (
                          <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <p className='text-xs text-muted-foreground'>Carrier</p>
                                <p className='font-medium'>{auction.shipment.carrier}</p>
                              </div>
                              <div>
                                <p className='text-xs text-muted-foreground'>Tracking Number</p>
                                <p className='font-mono font-medium'>{auction.shipment.trackingNumber}</p>
                              </div>
                              <div>
                                <p className='text-xs text-muted-foreground'>Status</p>
                                <Badge variant='outline' className='capitalize'>
                                  {auction.shipment.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <div>
                                <p className='text-xs text-muted-foreground'>Current Location</p>
                                <p className='font-medium'>{auction.shipment.currentLocation}</p>
                              </div>
                              {auction.shipment.estimatedDelivery && (
                                <div>
                                  <p className='text-xs text-muted-foreground'>Estimated Delivery</p>
                                  <p className='font-medium'>
                                    {format(new Date(auction.shipment.estimatedDelivery), 'MMM d, yyyy')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className='text-center py-8'>
                            <MdDirectionsBoat className='h-12 w-12 text-muted-foreground/30 mx-auto mb-4' />
                            <p className='text-muted-foreground'>No shipping information yet</p>
                            {onUpdateShipping && (
                              <Button variant='outline' size='sm' className='mt-4' onClick={onUpdateShipping}>
                                Add Shipping Details
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </AnimatedTabsContent>
                  </div>
                </AnimatedTabs>
              )
            })()}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='flex items-center justify-between border-t px-6 py-4 bg-muted/20'
            >
              {/* Stage Navigation */}
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={goToPreviousStage}
                  disabled={localWorkflow.currentStage <= 1}
                >
                  <MdChevronLeft className='h-4 w-4 mr-1' />
                  Previous
                </Button>
                <div className='px-3 py-1.5 rounded-lg bg-muted text-sm'>
                  <span className='font-medium'>Stage {localWorkflow.currentStage}:</span>{' '}
                  <span className='text-muted-foreground'>{currentStage?.label}</span>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={goToNextStage}
                  disabled={!canAccessStage(localWorkflow, localWorkflow.currentStage + 1)}
                >
                  Next
                  <MdChevronRight className='h-4 w-4 ml-1' />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className='flex items-center gap-2'>
                {/* Context-aware primary action */}
                {auction.paymentStatus !== 'completed' && onRecordPayment && (
                  <Button size='sm' onClick={onRecordPayment}>
                    <MdAttachMoney className='h-4 w-4 mr-2' />
                    Record Payment
                  </Button>
                )}
                {auction.status === 'shipping' && onMarkDelivered && (
                  <Button size='sm' onClick={() => onMarkDelivered(auction)}>
                    <MdCheckCircle className='h-4 w-4 mr-2' />
                    Mark Delivered
                  </Button>
                )}
                {auction.status === 'delivered' && onMarkCompleted && (
                  <Button size='sm' onClick={() => onMarkCompleted(auction)}>
                    <MdCheckCircle className='h-4 w-4 mr-2' />
                    Mark Completed
                  </Button>
                )}
                <Button variant='ghost' onClick={onClose}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useRef, useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  MdDashboard,
  MdCheckCircle,
  MdDescription,
  MdCreditCard,
  MdDirectionsBoat,
  MdNotes,
  MdEdit,
  MdSave,
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdAccessTime,
} from 'react-icons/md'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { type Purchase, type Document } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'
import { type Yard } from '../../../yards/types'
import { WorkflowSidebar } from '../workflow/workflow-sidebar'
import { calculateWorkflowProgress } from '../../utils/workflow'
import { UnifiedDocumentPanel } from '../unified-modal/document-panel/unified-document-panel'
import { OverviewPanel } from '../unified-modal/overview/overview-panel'
import { CostsBreakdownPanel } from './costs-breakdown-panel'

interface PurchasePageContentProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  activeTab: string
  activeStage: string
  yards: Yard[]
  currentUser: string
  onTabChange: (tab: string) => void
  onStageChange: (stage: string) => void
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  onDocumentUpload: (documents: Document[], checklistKey?: string) => void
  onDocumentDelete: (documentId: string) => void
  onRecordPayment: () => void
  onUpdateShipping: () => void
  onGenerateInvoice: () => void
  onNotesUpdate?: (notes: string) => void
}

export function PurchasePageContent({
  auction,
  workflow,
  activeTab,
  activeStage,
  yards,
  currentUser,
  onTabChange,
  onStageChange,
  onWorkflowUpdate,
  onDocumentUpload,
  onDocumentDelete,
  onRecordPayment,
  onUpdateShipping,
  onGenerateInvoice,
  onNotesUpdate,
}: PurchasePageContentProps) {
  // Notes state for editing
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(auction.notes || '')
  const paymentProgress =
    auction.totalAmount > 0
      ? Math.round((auction.paidAmount / auction.totalAmount) * 100)
      : 0

  // Calculate task progress across all workflow stages
  const calculateTaskProgress = () => {
    let total = 0
    let completed = 0

    // Stage 1: After Purchase
    if (workflow.stages.afterPurchase) {
      total++
      if (workflow.stages.afterPurchase.paymentToAuctionHouse?.completed) completed++
    }

    // Stage 2: Transport
    if (workflow.stages.transport) {
      const transport = workflow.stages.transport
      if (transport.transportArranged) { total++; if (transport.transportArranged.completed) completed++ }
      if (transport.yardNotified) { total++; if (transport.yardNotified.completed) completed++ }
      if (transport.photosRequested) { total++; if (transport.photosRequested.completed) completed++ }
    }

    // Stage 4: Repair/Stored
    if (workflow.stages.repairStored?.markedComplete) {
      total++
      if (workflow.stages.repairStored.markedComplete.completed) completed++
    }

    // Stage 5: Documents Received
    if (workflow.stages.documentsReceived) {
      const docs = workflow.stages.documentsReceived
      if (docs.isRegistered && docs.registeredTasks) {
        const rt = docs.registeredTasks
        if (rt.receivedNumberPlates) { total++; if (rt.receivedNumberPlates.completed) completed++ }
        if (rt.deregistered) { total++; if (rt.deregistered.completed) completed++ }
        if (rt.exportCertificateCreated) { total++; if (rt.exportCertificateCreated.completed) completed++ }
        if (rt.sentDeregistrationCopy) { total++; if (rt.sentDeregistrationCopy.completed) completed++ }
        if (rt.insuranceRefundReceived) { total++; if (rt.insuranceRefundReceived.completed) completed++ }
      } else if (docs.isRegistered === false && docs.unregisteredTasks) {
        if (docs.unregisteredTasks.exportCertificateCreated) {
          total++
          if (docs.unregisteredTasks.exportCertificateCreated.completed) completed++
        }
      }
    }

    // Stage 6: Booking
    if (workflow.stages.booking) {
      const booking = workflow.stages.booking
      if (booking.bookingRequested) { total++; if (booking.bookingRequested.completed) completed++ }
      if (booking.sentSIAndEC) { total++; if (booking.sentSIAndEC.completed) completed++ }
      if (booking.receivedSO) { total++; if (booking.receivedSO.completed) completed++ }
    }

    // Stage 7: Shipped
    if (workflow.stages.shipped) {
      const shipped = workflow.stages.shipped
      if (shipped.blPaid) { total++; if (shipped.blPaid.completed) completed++ }
      if (shipped.recycleApplied) { total++; if (shipped.recycleApplied.completed) completed++ }
    }

    // Stage 8: DHL Documents
    if (workflow.stages.dhlDocuments?.documentsSent) {
      total++
      if (workflow.stages.dhlDocuments.documentsSent.completed) completed++
    }

    return { total, completed }
  }

  const taskProgress = calculateTaskProgress()

  // Handle notes save
  const handleSaveNotes = () => {
    if (onNotesUpdate) {
      onNotesUpdate(notesValue)
    }
    setIsEditingNotes(false)
  }

  // Material Design tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: MdDashboard },
    { id: 'workflow', label: 'Process', icon: MdCheckCircle, badge: taskProgress.total > 0 ? `${taskProgress.completed}/${taskProgress.total}` : undefined, badgeColor: taskProgress.completed === taskProgress.total && taskProgress.total > 0 ? 'emerald' : 'default' },
    { id: 'documents', label: 'Documents', icon: MdDescription, badge: auction.documents.length > 0 ? auction.documents.length : undefined },
    { id: 'payments', label: 'Payments', icon: MdCreditCard, badge: `${paymentProgress}%`, badgeColor: paymentProgress >= 100 ? 'emerald' : 'primary' },
    { id: 'costs', label: 'Our Costs', icon: MdAccountBalanceWallet, badge: auction.ourCosts?.items.length || undefined },
    { id: 'shipping', label: 'Shipping', icon: MdDirectionsBoat, isLive: auction.shipment && auction.status === 'shipping' },
    { id: 'notes', label: 'Notes', icon: MdNotes },
  ]

  // Refs for tab indicator animation
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
    const activeTabElement = tabRefs.current[activeIndex]
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className='flex-1 flex flex-col overflow-hidden'
    >
      {/* Material Design Tabs Header */}
      <div className='border-b bg-card shrink-0'>
        <div className='px-4 relative'>
          {/* Tab Buttons */}
          <div className='flex gap-1 overflow-x-auto scrollbar-none'>
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  ref={el => { tabRefs.current[index] = el }}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap',
                    'hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span>{tab.label}</span>

                  {/* Badge */}
                  {tab.badge && (
                    <Badge
                      variant='secondary'
                      className={cn(
                        'ml-1 h-5 min-w-5 px-1.5 text-[10px] font-semibold',
                        tab.badgeColor === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : tab.badgeColor === 'default'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-primary/10 text-primary'
                      )}
                    >
                      {tab.badge}
                    </Badge>
                  )}

                  {/* Live Indicator */}
                  {tab.isLive && (
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75' />
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-purple-500' />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Animated Underline Indicator */}
          <motion.div
            className='absolute bottom-0 h-0.5 bg-primary rounded-full'
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 35,
            }}
          />
        </div>
      </div>

      <ScrollArea className='flex-1'>
        {/* Overview Tab */}
        <TabsContent value='overview' className='mt-0 p-4'>
          <div className='space-y-4'>
            {/* Quick Stats Row */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {/* Workflow Progress */}
              <Card className='border shadow-sm'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center',
                      calculateWorkflowProgress(workflow) >= 100
                        ? 'bg-emerald-500/10'
                        : 'bg-primary/10'
                    )}>
                      <MdTrendingUp className={cn(
                        'h-5 w-5',
                        calculateWorkflowProgress(workflow) >= 100
                          ? 'text-emerald-500'
                          : 'text-primary'
                      )} />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Progress</p>
                      <p className={cn(
                        'text-xl font-bold font-data',
                        calculateWorkflowProgress(workflow) >= 100
                          ? 'text-emerald-600'
                          : 'text-foreground'
                      )}>
                        {calculateWorkflowProgress(workflow)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Stage */}
              <Card className='border shadow-sm'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                      <MdAccessTime className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Stage</p>
                      <p className='text-xl font-bold font-data'>{workflow.currentStage}/8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Completed */}
              <Card className='border shadow-sm'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center',
                      taskProgress.completed === taskProgress.total && taskProgress.total > 0
                        ? 'bg-emerald-500/10'
                        : 'bg-muted'
                    )}>
                      <MdCheckCircle className={cn(
                        'h-5 w-5',
                        taskProgress.completed === taskProgress.total && taskProgress.total > 0
                          ? 'text-emerald-500'
                          : 'text-muted-foreground'
                      )} />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Tasks</p>
                      <p className='text-xl font-bold font-data'>
                        {taskProgress.completed}/{taskProgress.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className='border shadow-sm'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-xl bg-muted flex items-center justify-center'>
                      <MdDescription className='h-5 w-5 text-muted-foreground' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Documents</p>
                      <p className='text-xl font-bold font-data'>{auction.documents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary Card */}
            <Card className='overflow-hidden border-0 shadow-lg'>
              <div className={cn(
                'relative',
                paymentProgress >= 100
                  ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-black'
                  : 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black'
              )}>
                <CardContent className='relative p-6'>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
                    {/* Left - Total Amount */}
                    <div>
                      <p className='text-white/60 text-sm font-medium mb-1'>Total Purchase Value</p>
                      <p className='text-4xl font-bold text-white tracking-tight font-data'>
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: auction.currency,
                          minimumFractionDigits: 0,
                        }).format(auction.totalAmount)}
                      </p>
                    </div>

                    {/* Right - Stats */}
                    <div className='flex gap-6'>
                      <div className='text-center'>
                        <p className='text-white/60 text-xs font-medium mb-1'>Paid</p>
                        <p className='text-2xl font-bold text-white font-data'>
                          {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: auction.currency,
                            minimumFractionDigits: 0,
                          }).format(auction.paidAmount)}
                        </p>
                      </div>
                      <div className='text-center'>
                        <p className='text-white/60 text-xs font-medium mb-1'>Outstanding</p>
                        <p className='text-2xl font-bold text-white font-data'>
                          {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: auction.currency,
                            minimumFractionDigits: 0,
                          }).format(auction.totalAmount - auction.paidAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='mt-6'>
                    <div className='flex items-center justify-between text-xs text-white/60 mb-2'>
                      <span>Payment Progress</span>
                      <span className='font-data'>{paymentProgress}%</span>
                    </div>
                    <div className='h-2 bg-white/20 rounded-full overflow-hidden'>
                      <motion.div
                        className='h-full bg-white rounded-full'
                        initial={{ width: 0 }}
                        animate={{ width: `${paymentProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='workflow' className='mt-0 p-4'>
          <WorkflowSidebar
            auction={auction}
            workflow={workflow}
            activeStage={activeStage}
            onStageChange={onStageChange}
            onWorkflowUpdate={onWorkflowUpdate}
            currentUser={currentUser}
            yards={yards}
          />
        </TabsContent>

        <TabsContent value='documents' className='mt-0'>
          <UnifiedDocumentPanel
            auction={auction}
            workflow={workflow}
            isCollapsed={false}
            onToggleCollapse={() => {}}
            onDocumentUpload={onDocumentUpload}
            onDocumentDelete={onDocumentDelete}
          />
        </TabsContent>

        <TabsContent value='payments' className='mt-0'>
          <OverviewPanel
            auction={auction}
            onRecordPayment={onRecordPayment}
            onUpdateShipping={onUpdateShipping}
            onGenerateInvoice={onGenerateInvoice}
          />
        </TabsContent>

        {/* Our Costs Tab */}
        <TabsContent value='costs' className='mt-0'>
          <CostsBreakdownPanel auction={auction} />
        </TabsContent>

        <TabsContent value='shipping' className='mt-0 p-4'>
          <div className='rounded-lg border bg-card overflow-hidden'>
            <div className='px-4 py-3 bg-muted/50 border-b'>
              <h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
                <MdDirectionsBoat className='h-4 w-4 text-foreground' />
                Shipping Details
              </h3>
            </div>

            <div className='p-4'>
              {auction.shipment ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>Carrier</p>
                      <p className='font-semibold'>{auction.shipment.carrier}</p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>Tracking Number</p>
                      <p className='font-mono font-medium text-sm'>{auction.shipment.trackingNumber}</p>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>Status</p>
                      <Badge variant='outline' className='capitalize'>
                        {auction.shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>Current Location</p>
                      <p className='font-medium'>{auction.shipment.currentLocation}</p>
                    </div>
                  </div>

                  {auction.shipment.estimatedDelivery && (
                    <div className='p-3 rounded-lg bg-muted/50 border border-border'>
                      <p className='text-xs text-muted-foreground mb-1'>Estimated Delivery</p>
                      <p className='font-bold text-lg text-foreground'>
                        {format(new Date(auction.shipment.estimatedDelivery), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {auction.shipment.events && auction.shipment.events.length > 0 && (
                    <div>
                      <h4 className='text-sm font-semibold mb-3 flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-foreground' />
                        Tracking Events
                      </h4>
                      <div className='space-y-0'>
                        {auction.shipment.events.map((event, index) => (
                          <div
                            key={index}
                            className='flex gap-4 text-sm relative pl-6 pb-4'
                          >
                            {index < auction.shipment!.events!.length - 1 && (
                              <div className='absolute left-[9px] top-3 bottom-0 w-0.5 bg-muted' />
                            )}
                            <div className={cn(
                              'absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center',
                              index === 0 ? 'border-foreground' : 'border-muted'
                            )}>
                              {index === 0 && (
                                <span className='w-2 h-2 rounded-full bg-foreground' />
                              )}
                            </div>
                            <div className='flex-1'>
                              <div className='flex items-center justify-between mb-1'>
                                <p className='font-medium'>{event.status}</p>
                                <span className='text-xs text-muted-foreground'>
                                  {format(new Date(event.date), 'MMM d, HH:mm')}
                                </span>
                              </div>
                              <p className='text-muted-foreground text-sm'>{event.description}</p>
                              <p className='text-xs text-muted-foreground mt-0.5'>{event.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant='outline' onClick={onUpdateShipping}>
                    Update Shipping Info
                  </Button>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <MdDirectionsBoat className='h-16 w-16 text-muted-foreground/20 mx-auto mb-4' />
                  <p className='text-muted-foreground mb-4'>No shipping information yet</p>
                  <Button variant='outline' onClick={onUpdateShipping}>
                    Add Shipping Details
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value='notes' className='mt-0 p-6'>
          <div className='max-w-4xl mx-auto'>
            <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-3 border-b bg-muted/50'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base font-semibold flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-xl bg-foreground flex items-center justify-center shadow-md'>
                      <MdNotes className='h-5 w-5 text-background' />
                    </div>
                    Internal Notes
                  </CardTitle>
                  {!isEditingNotes ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsEditingNotes(true)}
                      className='gap-2'
                    >
                      <MdEdit className='h-4 w-4' />
                      Edit
                    </Button>
                  ) : (
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setIsEditingNotes(false)
                          setNotesValue(auction.notes || '')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size='sm'
                        onClick={handleSaveNotes}
                        className='gap-2'
                      >
                        <MdSave className='h-4 w-4' />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className='pt-4'>
                {isEditingNotes ? (
                  <Textarea
                    placeholder='Add internal notes about this purchase...'
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    rows={8}
                    className='resize-none'
                  />
                ) : (
                  <div className='min-h-[200px]'>
                    {auction.notes ? (
                      <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                        {auction.notes}
                      </p>
                    ) : (
                      <div className='text-center py-12'>
                        <MdNotes className='h-16 w-16 text-muted-foreground/20 mx-auto mb-4' />
                        <p className='text-muted-foreground mb-4'>No notes added yet</p>
                        <Button
                          variant='outline'
                          onClick={() => setIsEditingNotes(true)}
                          className='gap-2'
                        >
                          <MdEdit className='h-4 w-4' />
                          Add Notes
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <p className='text-xs text-muted-foreground mt-4 border-t pt-4'>
                  Notes are internal and visible only to staff members.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

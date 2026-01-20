'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MdDashboard,
  MdCheckCircle,
  MdDescription,
  MdCreditCard,
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdAccessTime,
} from 'react-icons/md'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { type Purchase, type Document } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'
import { type Yard } from '../../../yards/types'
import { WorkflowSidebar } from '../workflow/workflow-sidebar'
import { calculateWorkflowProgress } from '../../utils/workflow'
import { UnifiedDocumentPanel } from '../unified-modal/document-panel/unified-document-panel'
import { OverviewPanel } from '../unified-modal/overview/overview-panel'
import { CostsBreakdownPanel } from './costs-breakdown-panel'
import { CustomerPortalPreview } from './customer-portal-preview'

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
  onOpenExportCertificate?: () => void
  onFinalize?: () => void
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
  onOpenExportCertificate,
  onFinalize,
}: PurchasePageContentProps) {
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

  // Material Design tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: MdDashboard },
    { id: 'workflow', label: 'Process', icon: MdCheckCircle, badge: taskProgress.total > 0 ? `${taskProgress.completed}/${taskProgress.total}` : undefined, badgeColor: taskProgress.completed === taskProgress.total && taskProgress.total > 0 ? 'emerald' : 'default' },
    { id: 'documents', label: 'Documents', icon: MdDescription, badge: auction.documents.length > 0 ? auction.documents.length : undefined },
    { id: 'payments', label: 'Payments', icon: MdCreditCard, badge: `${paymentProgress}%`, badgeColor: paymentProgress >= 100 ? 'emerald' : 'primary' },
    { id: 'costs', label: 'Financials', icon: MdAccountBalanceWallet, badge: auction.ourCosts?.items.length || undefined },
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
        <TabsContent value='overview' className='mt-0 p-3'>
          <div className='grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3'>
            {/* Left Column: Stats + Payment */}
            <div className='space-y-3'>
              {/* Quick Stats Row */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                {/* Workflow Progress */}
                <Card className='border shadow-sm'>
                  <CardContent className='p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center'>
                        <MdTrendingUp className='h-4 w-4 text-muted-foreground' />
                      </div>
                      <div>
                        <p className='text-[10px] text-muted-foreground leading-tight'>Progress</p>
                        <p className='text-lg font-bold font-data'>
                          {calculateWorkflowProgress(workflow)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Stage */}
                <Card className='border shadow-sm'>
                  <CardContent className='p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center'>
                        <MdAccessTime className='h-4 w-4 text-muted-foreground' />
                      </div>
                      <div>
                        <p className='text-[10px] text-muted-foreground leading-tight'>Stage</p>
                        <p className='text-lg font-bold font-data'>{workflow.currentStage}/8</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks Completed */}
                <Card className='border shadow-sm'>
                  <CardContent className='p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center'>
                        <MdCheckCircle className='h-4 w-4 text-muted-foreground' />
                      </div>
                      <div>
                        <p className='text-[10px] text-muted-foreground leading-tight'>Tasks</p>
                        <p className='text-lg font-bold font-data'>
                          {taskProgress.completed}/{taskProgress.total}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card className='border shadow-sm'>
                  <CardContent className='p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-muted flex items-center justify-center'>
                        <MdDescription className='h-4 w-4 text-muted-foreground' />
                      </div>
                      <div>
                        <p className='text-[10px] text-muted-foreground leading-tight'>Documents</p>
                        <p className='text-lg font-bold font-data'>{auction.documents.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Summary Card */}
              <Card className='border shadow-sm'>
                <CardContent className='p-3'>
                  {/* Inline header */}
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <MdCreditCard className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm font-semibold'>Payment Summary</span>
                    </div>
                    <span className='text-xs text-muted-foreground font-data font-medium'>{paymentProgress}%</span>
                  </div>

                  {/* Compact 3-column grid */}
                  <div className='grid grid-cols-3 gap-2 mb-3'>
                    {/* Total Amount */}
                    <div className='p-2 rounded-lg bg-muted/50'>
                      <p className='text-[10px] text-muted-foreground'>Total</p>
                      <p className='text-base font-bold font-data truncate'>
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: auction.currency,
                          minimumFractionDigits: 0,
                        }).format(auction.totalAmount)}
                      </p>
                    </div>
                    {/* Paid */}
                    <div className='p-2 rounded-lg bg-muted/50'>
                      <p className='text-[10px] text-muted-foreground'>Paid</p>
                      <p className='text-base font-bold font-data text-emerald-600 truncate'>
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: auction.currency,
                          minimumFractionDigits: 0,
                        }).format(auction.paidAmount)}
                      </p>
                    </div>
                    {/* Outstanding */}
                    <div className='p-2 rounded-lg bg-muted/50'>
                      <p className='text-[10px] text-muted-foreground'>Outstanding</p>
                      <p className='text-base font-bold font-data text-orange-600 truncate'>
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: auction.currency,
                          minimumFractionDigits: 0,
                        }).format(auction.totalAmount - auction.paidAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Compact Progress Bar */}
                  <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                    <motion.div
                      className='h-full bg-primary rounded-full'
                      initial={{ width: 0 }}
                      animate={{ width: `${paymentProgress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Customer Portal Preview */}
            <CustomerPortalPreview auction={auction} workflow={workflow} />
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
            onOpenExportCertificate={onOpenExportCertificate}
            onFinalize={onFinalize}
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

        {/* Financials Tab */}
        <TabsContent value='costs' className='mt-0'>
          <CostsBreakdownPanel auction={auction} workflow={workflow} />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

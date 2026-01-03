'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { startOfDay } from 'date-fns'
import { MdGridView, MdViewList, MdRefresh } from 'react-icons/md'
import { toast } from 'sonner'

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { AnimatedTabs, AnimatedTabsContent, type TabItem } from '@/components/ui/animated-tabs'
import { useDateNavigation } from '@/hooks/use-date-navigation'

import {
  purchases as initialWonAuctions,
  type Purchase,
  type Document,
  type ShipmentTracking,
  type Payment,
} from './data/won-auctions'
import { type PurchaseWorkflow, type DocumentChecklist } from './types/workflow'
import { createDefaultWorkflow } from './utils/workflow'
import { WonAuctionsProvider, useWonAuctions } from './components/won-auctions-provider'
import { WonAuctionsDialogs } from './components/won-auctions-dialogs'
import { WonAuctionsFilters } from './components/won-auctions-filters'
import { WonAuctionsPagination } from './components/won-auctions-pagination'
import { PurchasesDateStrip } from './components/purchases-date-strip'
import { VehicleCard } from './components/vehicle-card'
import { WonAuctionsTableView } from './components/won-auctions-table-view'
import { useWonAuctionsFilters } from './hooks/use-won-auctions-filters'
import { type ViewMode, type WonAuctionsDialogType } from './types'

function WonAuctionsContent() {
  const router = useRouter()
  const [auctions, setAuctions] = useState<Purchase[]>(initialWonAuctions)
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [activeTab, setActiveTab] = useState<Purchase['status']>('payment_pending')

  const { setOpen, setCurrentRow, setInitialMode } = useWonAuctions()

  // Date Navigation
  const {
    selectedDate,
    dateRangeStart,
    dateRangeLabel,
    visibleDates,
    isCalendarOpen,
    setIsCalendarOpen,
    navigateDate,
    selectDate,
    selectDateRange,
  } = useDateNavigation()

  // Get date count for date strip
  const getDateCount = (date: Date) => {
    return auctions.filter((a) => {
      const purchaseDate = startOfDay(new Date(a.createdAt))
      return purchaseDate.getTime() === startOfDay(date).getTime()
    }).length
  }

  // Handle date selection
  const handleDateSelect = (date: Date, label: string) => {
    selectDate(date, label)
  }

  // Handle date range selection
  const handleDateRangeSelect = (start: Date | undefined, end: Date | undefined, label: string) => {
    selectDateRange(start, end, label)
  }

  // Filter auctions by date and active tab (status)
  const tabFilteredAuctions = useMemo(() => {
    let result = auctions.filter((a) => a.status === activeTab)

    // Apply date filter if not "All dates"
    if (dateRangeLabel !== 'All dates' && selectedDate) {
      result = result.filter((a) => {
        const purchaseDate = startOfDay(new Date(a.createdAt))
        if (dateRangeStart) {
          // Date range filter
          return purchaseDate >= startOfDay(dateRangeStart) && purchaseDate <= startOfDay(selectedDate)
        } else {
          // Single date filter
          return purchaseDate.getTime() === startOfDay(selectedDate).getTime()
        }
      })
    }

    return result
  }, [auctions, activeTab, selectedDate, dateRangeStart, dateRangeLabel])

  const {
    filters,
    sortBy,
    currentPage,
    itemsPerPage,
    paginatedData,
    totalPages,
    totalItems,
    hasActiveFilters,
    setSortBy,
    setCurrentPage,
    setItemsPerPage,
    resetFilters,
    updateFilter,
  } = useWonAuctionsFilters(tabFilteredAuctions)

  // Get unique ports for filter
  const uniquePorts = useMemo(() => {
    return [...new Set(auctions.map((a) => a.destinationPort).filter(Boolean))] as string[]
  }, [auctions])

  // Dialog handlers
  const openDialog = (type: WonAuctionsDialogType, auction: Purchase) => {
    setCurrentRow(auction)
    setOpen(type)
  }

  // Navigate to purchase detail page
  const navigateToPurchase = (auction: Purchase) => {
    router.push(`/purchases/${auction.id}`)
  }

  // Payment handler
  const handleRecordPayment = (
    auctionId: string,
    paymentData: Omit<Payment, 'id' | 'auctionId' | 'recordedBy' | 'recordedAt'>
  ) => {
    const newPayment: Payment = {
      id: String(Date.now()),
      auctionId,
      ...paymentData,
      recordedBy: 'Current Admin',
      recordedAt: new Date(),
    }

    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a

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
  }

  // Document upload handler with workflow checklist sync
  const handleUploadDocuments = (auctionId: string, documents: Document[], checklistKey?: keyof DocumentChecklist) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a

        // Get or create workflow
        const workflow = a.workflow || createDefaultWorkflow()

        // If a checklist key is provided, update the workflow checklist
        let updatedWorkflow = workflow
        if (checklistKey) {
          updatedWorkflow = {
            ...workflow,
            stages: {
              ...workflow.stages,
              documentsReceived: {
                ...workflow.stages.documentsReceived,
                checklist: {
                  ...workflow.stages.documentsReceived.checklist,
                  [checklistKey]: {
                    received: true,
                    receivedAt: new Date(),
                    receivedBy: 'Current Admin',
                    documentId: documents[0]?.id,
                  },
                },
              },
            },
            updatedAt: new Date(),
          }
          toast.success(`${checklistKey} marked as received in workflow`)
        }

        return {
          ...a,
          documents: [...a.documents, ...documents],
          status: a.status === 'documents_pending' ? 'processing' : a.status,
          workflow: updatedWorkflow,
          timeline: {
            ...a.timeline,
            documentsUploaded: new Date(),
          },
        }
      })
    )
  }

  // Shipping update handler
  const handleUpdateShipping = (auctionId: string, shipment: ShipmentTracking) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a
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
  }

  // Mark as delivered handler
  const handleMarkDelivered = (auction: Purchase) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auction.id) return a
        return {
          ...a,
          status: 'delivered',
          timeline: {
            ...a.timeline,
            delivered: new Date(),
          },
        }
      })
    )
    toast.success(`${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model} marked as delivered`)
  }

  // Mark as completed handler
  const handleMarkCompleted = (auction: Purchase) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auction.id) return a
        return {
          ...a,
          status: 'completed',
          timeline: {
            ...a.timeline,
            completed: new Date(),
          },
        }
      })
    )
    toast.success(`${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model} marked as completed`)
  }

  // Workflow update handler
  const handleWorkflowUpdate = (auctionId: string, workflow: PurchaseWorkflow) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a
        return {
          ...a,
          workflow,
        }
      })
    )
  }

  // Document delete handler
  const handleDeleteDocument = (auctionId: string, documentId: string) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a
        return {
          ...a,
          documents: a.documents.filter((d) => d.id !== documentId),
        }
      })
    )
    toast.success('Document deleted')
  }

  // Get counts for each status tab
  const statusCounts = useMemo(() => {
    return {
      payment_pending: auctions.filter((a) => a.status === 'payment_pending').length,
      processing: auctions.filter((a) => a.status === 'processing').length,
      documents_pending: auctions.filter((a) => a.status === 'documents_pending').length,
      shipping: auctions.filter((a) => a.status === 'shipping').length,
      delivered: auctions.filter((a) => a.status === 'delivered').length,
      completed: auctions.filter((a) => a.status === 'completed').length,
    }
  }, [auctions])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Header */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Purchases</h2>
            <p className='text-muted-foreground'>
              Manage purchases, documents, and shipping
            </p>
          </div>
          <Button
              variant='outline'
              size='sm'
              onClick={() => setAuctions([...initialWonAuctions])}
            >
              <MdRefresh className='mr-2 h-4 w-4' />
              Refresh
            </Button>
        </div>

        {/* Date Strip */}
        <PurchasesDateStrip
          selectedDate={selectedDate}
          dateRangeStart={dateRangeStart}
          dateRangeLabel={dateRangeLabel}
          visibleDates={visibleDates}
          isCalendarOpen={isCalendarOpen}
          onCalendarOpenChange={setIsCalendarOpen}
          getDateCount={getDateCount}
          onDateSelect={handleDateSelect}
          onNavigate={navigateDate}
          onDateRangeSelect={handleDateRangeSelect}
        />

        {/* Filters */}
        <WonAuctionsFilters
          filters={filters}
          sortBy={sortBy}
          uniquePorts={uniquePorts}
          onFilterChange={updateFilter}
          onSortChange={setSortBy}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Status Tabs */}
        {(() => {
          const statusTabs: TabItem[] = [
            { id: 'payment_pending', label: 'Payment Pending', badge: statusCounts.payment_pending, badgeColor: 'amber' },
            { id: 'processing', label: 'Processing', badge: statusCounts.processing, badgeColor: 'primary' },
            { id: 'documents_pending', label: 'Docs Pending', badge: statusCounts.documents_pending },
            { id: 'shipping', label: 'Shipping', badge: statusCounts.shipping, badgeColor: 'primary' },
            { id: 'delivered', label: 'Delivered', badge: statusCounts.delivered, badgeColor: 'emerald' },
            { id: 'completed', label: 'Completed', badge: statusCounts.completed, badgeColor: 'emerald' },
          ]

          return (
            <div className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <AnimatedTabs
                  tabs={statusTabs}
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as Purchase['status'])}
                  variant='compact'
                />

                <div className='flex items-center gap-4'>
                  <p className='text-sm text-muted-foreground'>{totalItems} vehicles</p>
                  <div className='flex gap-1 rounded-md border p-1'>
                    <Button
                      variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                      size='sm'
                      onClick={() => setViewMode('card')}
                    >
                      <MdGridView className='h-4 w-4' />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                      size='sm'
                      onClick={() => setViewMode('table')}
                    >
                      <MdViewList className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vehicle List */}
              {viewMode === 'card' ? (
                <div className='space-y-4'>
                  {paginatedData.map((auction) => (
                    <VehicleCard
                      key={auction.id}
                      auction={auction}
                      onViewDetails={() => navigateToPurchase(auction)}
                      onManageWorkflow={() => navigateToPurchase(auction)}
                      onRecordPayment={() => openDialog('payment', auction)}
                      onUploadDocuments={() => openDialog('document-upload', auction)}
                      onManageDocuments={() => openDialog('documents', auction)}
                      onUpdateShipping={() => openDialog('shipping', auction)}
                      onGenerateInvoice={() => openDialog('invoice', auction)}
                      onMarkDelivered={() => handleMarkDelivered(auction)}
                      onMarkCompleted={() => handleMarkCompleted(auction)}
                    />
                  ))}
                  {paginatedData.length === 0 && (
                    <div className='py-12 text-center text-muted-foreground'>
                      No vehicles found matching your criteria
                    </div>
                  )}
                </div>
              ) : (
                <WonAuctionsTableView
                  data={paginatedData}
                  onOpenDialog={openDialog}
                  onViewDetails={navigateToPurchase}
                  onMarkDelivered={handleMarkDelivered}
                  onMarkCompleted={handleMarkCompleted}
                />
              )}
            </div>
          )
        })()}

        {/* Pagination */}
        <WonAuctionsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </Main>

      {/* Dialogs */}
      <WonAuctionsDialogs
        onRecordPayment={handleRecordPayment}
        onUploadDocuments={handleUploadDocuments}
        onUpdateShipping={handleUpdateShipping}
        onDeleteDocument={handleDeleteDocument}
        onWorkflowUpdate={handleWorkflowUpdate}
        onMarkDelivered={handleMarkDelivered}
        onMarkCompleted={handleMarkCompleted}
      />
    </>
  )
}

export function Purchases() {
  return (
    <WonAuctionsProvider>
      <WonAuctionsContent />
    </WonAuctionsProvider>
  )
}

/** @deprecated Use Purchases instead */
export const WonAuctions = Purchases

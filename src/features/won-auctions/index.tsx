'use client'

import { useMemo, useState } from 'react'
import { LayoutGrid, LayoutList, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  wonAuctions as initialWonAuctions,
  type WonAuction,
  type Document,
  type ShipmentTracking,
  type Payment,
} from './data/won-auctions'
import { type PurchaseWorkflow } from './types/workflow'
import { WonAuctionsProvider, useWonAuctions } from './components/won-auctions-provider'
import { WonAuctionsDialogs } from './components/won-auctions-dialogs'
import { WonAuctionsFilters } from './components/won-auctions-filters'
import { WonAuctionsStats } from './components/won-auctions-stats'
import { WonAuctionsPagination } from './components/won-auctions-pagination'
import { VehicleCard } from './components/vehicle-card'
import { WonAuctionsTableView } from './components/won-auctions-table-view'
import { useWonAuctionsFilters } from './hooks/use-won-auctions-filters'
import { type ViewMode, type WonAuctionsDialogType } from './types'

function WonAuctionsContent() {
  const [auctions, setAuctions] = useState<WonAuction[]>(initialWonAuctions)
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [activeTab, setActiveTab] = useState<WonAuction['status']>('payment_pending')

  const { setOpen, setCurrentRow, setInitialMode } = useWonAuctions()

  // Filter auctions by active tab (status)
  const tabFilteredAuctions = useMemo(() => {
    return auctions.filter((a) => a.status === activeTab)
  }, [auctions, activeTab])

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
  const openDialog = (type: WonAuctionsDialogType, auction: WonAuction) => {
    setCurrentRow(auction)
    setOpen(type)
  }

  // Open unified purchase modal with specific mode
  const openPurchaseModal = (auction: WonAuction, mode: 'overview' | 'workflow') => {
    setCurrentRow(auction)
    setInitialMode(mode)
    setOpen('purchase')
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

  // Document upload handler
  const handleUploadDocuments = (auctionId: string, documents: Document[]) => {
    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id !== auctionId) return a
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
  const handleMarkDelivered = (auction: WonAuction) => {
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
  const handleMarkCompleted = (auction: WonAuction) => {
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
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
        </div>

        {/* Stats */}
        <WonAuctionsStats auctions={auctions} />

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
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WonAuction['status'])} className='w-full'>
          <div className='flex items-center justify-between'>
            <TabsList className='bg-muted/50'>
              <TabsTrigger value='payment_pending' className='text-xs'>
                Payment Pending ({statusCounts.payment_pending})
              </TabsTrigger>
              <TabsTrigger value='processing' className='text-xs'>
                Processing ({statusCounts.processing})
              </TabsTrigger>
              <TabsTrigger value='documents_pending' className='text-xs'>
                Docs Pending ({statusCounts.documents_pending})
              </TabsTrigger>
              <TabsTrigger value='shipping' className='text-xs'>
                Shipping ({statusCounts.shipping})
              </TabsTrigger>
              <TabsTrigger value='delivered' className='text-xs'>
                Delivered ({statusCounts.delivered})
              </TabsTrigger>
              <TabsTrigger value='completed' className='text-xs'>
                Completed ({statusCounts.completed})
              </TabsTrigger>
            </TabsList>

            <div className='flex items-center gap-4'>
              <p className='text-sm text-muted-foreground'>{totalItems} vehicles</p>
              <div className='flex gap-1 rounded-md border p-1'>
                <Button
                  variant={viewMode === 'card' ? 'secondary' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('card')}
                >
                  <LayoutGrid className='h-4 w-4' />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size='sm'
                  onClick={() => setViewMode('table')}
                >
                  <LayoutList className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          {viewMode === 'card' ? (
            <div className='mt-4 space-y-4'>
              {paginatedData.map((auction) => (
                <VehicleCard
                  key={auction.id}
                  auction={auction}
                  onViewDetails={() => openPurchaseModal(auction, 'overview')}
                  onManageWorkflow={() => openPurchaseModal(auction, 'workflow')}
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
              onOpenPurchaseModal={openPurchaseModal}
              onMarkDelivered={handleMarkDelivered}
              onMarkCompleted={handleMarkCompleted}
            />
          )}
        </Tabs>

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

export function WonAuctions() {
  return (
    <WonAuctionsProvider>
      <WonAuctionsContent />
    </WonAuctionsProvider>
  )
}

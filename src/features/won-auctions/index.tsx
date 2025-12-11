'use client'

import { useMemo, useState } from 'react'
import { Download, LayoutGrid, LayoutList, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  wonAuctions as initialWonAuctions,
  type WonAuction,
  type Document,
  type ShipmentTracking,
  type Payment,
} from './data/won-auctions'
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
  const [activeTab, setActiveTab] = useState('all')

  const { setOpen, setCurrentRow } = useWonAuctions()

  // Filter auctions by tab
  const tabFilteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      switch (activeTab) {
        case 'pending_payment':
          return auction.paymentStatus !== 'completed'
        case 'pending_documents':
          return auction.status === 'documents_pending'
        case 'in_shipping':
          return auction.status === 'shipping'
        case 'completed':
          return auction.status === 'completed'
        default:
          return true
      }
    })
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

  // Mark delivered handler
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
          shipment: a.shipment
            ? {
                ...a.shipment,
                status: 'delivered',
                events: [
                  ...a.shipment.events,
                  {
                    date: new Date(),
                    location: a.destinationPort || 'Destination',
                    status: 'Delivered',
                    description: 'Vehicle delivered to customer',
                  },
                ],
              }
            : undefined,
        }
      })
    )
    toast.success('Auction marked as delivered')
  }

  // Mark completed handler
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
    toast.success('Auction completed successfully')
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
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
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setAuctions([...initialWonAuctions])}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
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

        {/* View Toggle */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>{totalItems} vehicles found</p>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='pending_payment'>Pending Payment</TabsTrigger>
            <TabsTrigger value='pending_documents'>Pending Documents</TabsTrigger>
            <TabsTrigger value='in_shipping'>In Shipping</TabsTrigger>
            <TabsTrigger value='completed'>Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-4 space-y-4'>
            {viewMode === 'card' ? (
              <div className='space-y-4'>
                {paginatedData.map((auction) => (
                  <VehicleCard
                    key={auction.id}
                    auction={auction}
                    onViewDetails={() => openDialog('detail', auction)}
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
                onMarkDelivered={handleMarkDelivered}
                onMarkCompleted={handleMarkCompleted}
              />
            )}
          </TabsContent>
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

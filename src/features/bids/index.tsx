'use client'

import { useState } from 'react'
import { startOfDay } from 'date-fns'
import { toast } from 'sonner'

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { useDateNavigation } from '@/hooks/use-date-navigation'

import { bids as initialBids, type Bid } from './data/bids'
import { useBidsFilters } from './hooks/use-bids-filters'
import { useBidsActions } from './hooks/use-bids-actions'
import type { SortOption, BidTab } from './types'

// Components
import { BidsStatsCards } from './components/bids-stats-cards'
import { BidsDateStrip } from './components/bids-date-strip'
import { BidsSearchBar } from './components/bids-search-bar'
import { BidsTabsHeader } from './components/bids-tabs-header'
import { BidsTableView } from './components/bids-table-view'
import { BidsPagination } from './components/bids-pagination'
import { CreateInvoiceDrawer } from './components/create-invoice-drawer'
import { BidDetailModal } from './components/bid-detail-modal'
import {
  UnsoldDialog,
  SoldToOthersDialog,
  WonDialog,
  ApproveDialog,
  DeclineDialog,
} from './components/dialogs'

export function Bids() {
  const [bids] = useState(initialBids)

  // Bid detail modal state
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)

  // UI State
  const [activeTab, setActiveTab] = useState<BidTab>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('ending-soon')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Filter State
  const [selectedStatuses, setSelectedStatuses] = useState<Bid['status'][]>([])
  const [selectedTypes, setSelectedTypes] = useState<Bid['type'][]>([])
  const [selectedBidderTypes, setSelectedBidderTypes] = useState<Bid['bidder']['type'][]>([])
  const [selectedAuctionStatuses, setSelectedAuctionStatuses] = useState<Bid['auctionStatus'][]>([])
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 30000000])
  const [onlyWinning, setOnlyWinning] = useState(false)

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

  // Actions hook
  const {
    dialogState,
    handleMarkUnsold,
    setUnsoldPrice,
    setUnsoldNegoPrice,
    confirmUnsold,
    closeUnsold,
    handleSoldToOthers,
    setSoldToOthersPrice,
    confirmSoldToOthers,
    closeSoldToOthers,
    handleMarkWon,
    setWonPrice,
    confirmWon,
    closeWon,
    handleApprove,
    confirmApprove,
    closeApprove,
    handleDecline,
    confirmDecline,
    closeDecline,
    openCreateInvoice,
    closeCreateInvoice,
  } = useBidsActions()

  // Open bid detail modal
  const handleViewBid = (bid: Bid) => {
    setSelectedBid(bid)
    setIsBidModalOpen(true)
  }

  const closeBidModal = () => {
    setIsBidModalOpen(false)
    setSelectedBid(null)
  }

  // Filtering logic
  const { filteredBids, stats, hasActiveFilters } = useBidsFilters({
    bids,
    searchQuery,
    activeTab,
    selectedDate,
    dateRangeStart,
    selectedStatuses,
    selectedTypes,
    selectedBidderTypes,
    selectedAuctionStatuses,
    amountRange,
    onlyWinning,
    sortBy,
  })

  // Pagination
  const totalPages = Math.ceil(filteredBids.length / itemsPerPage)
  const paginatedBids = filteredBids.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const resetPagination = () => setCurrentPage(1)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatuses([])
    setSelectedTypes([])
    setSelectedBidderTypes([])
    setSelectedAuctionStatuses([])
    setAmountRange([0, 30000000])
    setOnlyWinning(false)
    selectDateRange(undefined, undefined, 'All dates')
    setActiveTab('all')
    setSortBy('recent')
    resetPagination()
  }

  // Get date count for date strip
  const getDateCount = (date: Date) => {
    return bids.filter((b) => {
      const bidDate = startOfDay(new Date(b.timestamp))
      return bidDate.getTime() === startOfDay(date).getTime()
    }).length
  }

  // Handle date selection
  const handleDateSelect = (date: Date, label: string) => {
    selectDate(date, label)
    resetPagination()
  }

  // Handle date range selection
  const handleDateRangeSelect = (start: Date | undefined, end: Date | undefined, label: string) => {
    selectDateRange(start, end, label)
    resetPagination()
  }

  // Handle navigation
  const handleNavigate = (days: number) => {
    navigateDate(days)
    resetPagination()
  }

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
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Bids Management</h2>
            <p className='text-muted-foreground'>Track and manage all bidding activities</p>
          </div>
        </div>

        <BidsStatsCards stats={stats} />

        <BidsDateStrip
          selectedDate={selectedDate}
          dateRangeStart={dateRangeStart}
          dateRangeLabel={dateRangeLabel}
          visibleDates={visibleDates}
          isCalendarOpen={isCalendarOpen}
          onCalendarOpenChange={setIsCalendarOpen}
          getDateCount={getDateCount}
          onDateSelect={handleDateSelect}
          onNavigate={handleNavigate}
          onDateRangeSelect={handleDateRangeSelect}
        />

        <div className='space-y-4'>
          <BidsSearchBar
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); resetPagination() }}
            sortBy={sortBy}
            onSortChange={(v) => { setSortBy(v); resetPagination() }}
          />

          <BidsTabsHeader
            activeTab={activeTab}
            onTabChange={(v) => { setActiveTab(v); resetPagination() }}
            pendingCount={stats.pending}
          />
        </div>

        <BidsTableView
          bids={paginatedBids}
          onViewBid={handleViewBid}
          onApprove={handleApprove}
          onDecline={handleDecline}
          onMarkWon={handleMarkWon}
          onSoldToOthers={handleSoldToOthers}
          onMarkUnsold={handleMarkUnsold}
          onBidCanceled={(bid) => toast.success(`Bid ${bid.bidNumber}: Bid Canceled`)}
          onAuctionCancelled={(bid) => toast.success(`Bid ${bid.bidNumber}: Auction Cancelled`)}
        />

        <BidsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBids.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1) }}
        />
      </Main>

      {/* Dialogs */}
      <CreateInvoiceDrawer
        open={dialogState.createInvoice.open}
        onOpenChange={(open) => open ? openCreateInvoice() : closeCreateInvoice()}
        bid={dialogState.createInvoice.bid}
        onSuccess={closeCreateInvoice}
      />

      <UnsoldDialog
        open={dialogState.unsold.open}
        onOpenChange={(open) => !open && closeUnsold()}
        bid={dialogState.unsold.bid}
        unsoldPrice={dialogState.unsold.price}
        negoStartPrice={dialogState.unsold.negoStartPrice}
        onUnsoldPriceChange={setUnsoldPrice}
        onNegoStartPriceChange={setUnsoldNegoPrice}
        onConfirm={confirmUnsold}
      />

      <SoldToOthersDialog
        open={dialogState.soldToOthers.open}
        onOpenChange={(open) => !open && closeSoldToOthers()}
        bid={dialogState.soldToOthers.bid}
        soldPrice={dialogState.soldToOthers.price}
        onSoldPriceChange={setSoldToOthersPrice}
        onConfirm={confirmSoldToOthers}
      />

      <WonDialog
        open={dialogState.won.open}
        onOpenChange={(open) => !open && closeWon()}
        bid={dialogState.won.bid}
        wonType={dialogState.won.type}
        wonPrice={dialogState.won.price}
        onWonPriceChange={setWonPrice}
        onConfirm={confirmWon}
      />

      <ApproveDialog
        open={dialogState.approve.open}
        onOpenChange={(open) => !open && closeApprove()}
        bid={dialogState.approve.bid}
        onConfirm={confirmApprove}
      />

      <DeclineDialog
        open={dialogState.decline.open}
        onOpenChange={(open) => !open && closeDecline()}
        bid={dialogState.decline.bid}
        onConfirm={confirmDecline}
      />

      {/* Bid Detail Modal */}
      <BidDetailModal
        bid={selectedBid}
        open={isBidModalOpen}
        onClose={closeBidModal}
        onApprove={(bid) => {
          handleApprove(bid)
          closeBidModal()
        }}
        onDecline={(bid) => {
          handleDecline(bid)
          closeBidModal()
        }}
        onMarkWon={(bid, type) => {
          handleMarkWon(bid, type)
          closeBidModal()
        }}
        onSoldToOthers={(bid) => {
          handleSoldToOthers(bid)
          closeBidModal()
        }}
        onMarkUnsold={(bid) => {
          handleMarkUnsold(bid)
          closeBidModal()
        }}
        onCreateInvoice={(bid) => {
          openCreateInvoice(bid)
          closeBidModal()
        }}
      />
    </>
  )
}

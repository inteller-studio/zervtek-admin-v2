import { useMemo } from 'react'
import { startOfDay } from 'date-fns'
import type { Bid } from '../data/bids'
import type { BidTab, SortOption } from '../types'

export interface BidsStats {
  total: number
  pending: number
  active: number
  won: number
  upcoming: number
  lost: number
}

export interface UseBidsFiltersOptions {
  bids: Bid[]
  searchQuery: string
  activeTab: BidTab
  selectedDate: Date
  dateRangeStart: Date | undefined
  selectedStatuses: Bid['status'][]
  selectedTypes: Bid['type'][]
  selectedBidderTypes: Bid['bidder']['type'][]
  selectedAuctionStatuses: Bid['auctionStatus'][]
  amountRange: [number, number]
  onlyWinning: boolean
  sortBy: SortOption
}

export interface UseBidsFiltersReturn {
  filteredBids: Bid[]
  stats: BidsStats
  hasActiveFilters: boolean
}

export function useBidsFilters(options: UseBidsFiltersOptions): UseBidsFiltersReturn {
  const {
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
  } = options

  // Calculate stats for the selected date
  const stats = useMemo(() => {
    const dayStart = startOfDay(selectedDate)
    const dayEnd = new Date(dayStart.getTime() + 86400000 - 1)

    const todayBids = bids.filter((b) => b.timestamp >= dayStart && b.timestamp <= dayEnd)

    return {
      total: todayBids.length,
      pending: todayBids.filter((b) => b.status === 'pending_approval').length,
      active: todayBids.filter((b) => b.status === 'active' || b.status === 'winning').length,
      won: todayBids.filter((b) => b.status === 'won').length,
      upcoming: todayBids.filter((b) => b.auctionStatus === 'upcoming').length,
      lost: todayBids.filter((b) => b.status === 'lost').length,
    }
  }, [bids, selectedDate])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== '' ||
      selectedStatuses.length > 0 ||
      selectedTypes.length > 0 ||
      selectedBidderTypes.length > 0 ||
      selectedAuctionStatuses.length > 0 ||
      amountRange[0] !== 0 ||
      amountRange[1] !== 30000000 ||
      onlyWinning
    )
  }, [
    searchQuery,
    selectedStatuses,
    selectedTypes,
    selectedBidderTypes,
    selectedAuctionStatuses,
    amountRange,
    onlyWinning,
  ])

  const filteredBids = useMemo(() => {
    // Calculate date range based on selected date or date range
    const filterDateStart = dateRangeStart
      ? startOfDay(dateRangeStart)
      : selectedDate
        ? startOfDay(selectedDate)
        : null
    const filterDateEnd = selectedDate
      ? new Date(startOfDay(selectedDate).getTime() + 86400000 - 1)
      : null

    let filtered = bids.filter((bid) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        bid.bidNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.auctionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.bidder.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Tab filter
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'pending' && bid.status === 'pending_approval') ||
        (activeTab === 'active' && (bid.status === 'active' || bid.status === 'winning')) ||
        (activeTab === 'outbid' && bid.status === 'outbid') ||
        (activeTab === 'won' && bid.status === 'won') ||
        (activeTab === 'lost' && bid.status === 'lost') ||
        (activeTab === 'declined' && bid.status === 'declined')

      // Date filter
      const matchesDate =
        !filterDateStart ||
        !filterDateEnd ||
        (bid.timestamp >= filterDateStart && bid.timestamp <= filterDateEnd)

      // Multi-select filters
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(bid.status)
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bid.type)
      const matchesBidderType =
        selectedBidderTypes.length === 0 || selectedBidderTypes.includes(bid.bidder.type)
      const matchesAuctionStatus =
        selectedAuctionStatuses.length === 0 || selectedAuctionStatuses.includes(bid.auctionStatus)

      // Amount range filter
      const matchesAmount = bid.amount >= amountRange[0] && bid.amount <= amountRange[1]

      // Winning only filter
      const matchesWinning = !onlyWinning || bid.status === 'winning' || bid.status === 'won'

      return (
        matchesSearch &&
        matchesTab &&
        matchesDate &&
        matchesStatus &&
        matchesType &&
        matchesBidderType &&
        matchesAuctionStatus &&
        matchesAmount &&
        matchesWinning
      )
    })

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.timestamp.getTime() - a.timestamp.getTime()
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime()
        case 'amount-high':
          return b.amount - a.amount
        case 'amount-low':
          return a.amount - b.amount
        case 'ending-soon':
          if (!a.timeRemaining && !b.timeRemaining) return 0
          if (!a.timeRemaining) return 1
          if (!b.timeRemaining) return -1
          return a.timeRemaining.getTime() - b.timeRemaining.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [
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
  ])

  return {
    filteredBids,
    stats,
    hasActiveFilters,
  }
}

// Utility functions for bid display
export function getStatusVariant(status: Bid['status']) {
  switch (status) {
    case 'pending_approval':
      return 'amber'
    case 'active':
      return 'blue'
    case 'winning':
      return 'green'
    case 'outbid':
      return 'orange'
    case 'won':
      return 'emerald'
    case 'lost':
      return 'zinc'
    case 'retracted':
      return 'red'
    case 'expired':
      return 'zinc'
    case 'declined':
      return 'rose'
    default:
      return 'zinc'
  }
}

export function getStatusLabel(status: Bid['status']) {
  switch (status) {
    case 'pending_approval':
      return 'Pending'
    case 'declined':
      return 'Declined'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

// Get count for a specific date
export function getDateBidCount(bids: Bid[], date: Date) {
  const dayStart = startOfDay(date)
  return bids.filter((b) => {
    const bidDate = startOfDay(new Date(b.timestamp))
    return bidDate.getTime() === dayStart.getTime()
  }).length
}

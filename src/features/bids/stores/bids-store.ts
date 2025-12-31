import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, format, startOfDay } from 'date-fns'
import type { Bid } from '../data/bids'
import {
  type SortOption,
  type ViewMode,
  type BidTab,
  DEFAULT_AMOUNT_RANGE,
  DEFAULT_ITEMS_PER_PAGE,
} from '../types'

interface BidsState {
  // Filter state
  selectedStatuses: Bid['status'][]
  selectedTypes: Bid['type'][]
  selectedBidderTypes: Bid['bidder']['type'][]
  selectedAuctionStatuses: Bid['auctionStatus'][]
  amountRange: [number, number]
  onlyWinning: boolean

  // Date state
  selectedDate: Date | undefined
  dateRangeStart: Date | undefined
  dateRangeLabel: string

  // View state
  viewMode: ViewMode
  activeTab: BidTab
  sortBy: SortOption
  isFilterOpen: boolean

  // Pagination state
  currentPage: number
  itemsPerPage: number

  // Search state
  searchQuery: string

  // Actions
  setSelectedStatuses: (statuses: Bid['status'][]) => void
  setSelectedTypes: (types: Bid['type'][]) => void
  setSelectedBidderTypes: (types: Bid['bidder']['type'][]) => void
  setSelectedAuctionStatuses: (statuses: Bid['auctionStatus'][]) => void
  setAmountRange: (range: [number, number]) => void
  setOnlyWinning: (value: boolean) => void
  setSelectedDate: (date: Date | undefined) => void
  setDateRangeStart: (date: Date | undefined) => void
  setDateRangeLabel: (label: string) => void
  setViewMode: (mode: ViewMode) => void
  setActiveTab: (tab: BidTab) => void
  setSortBy: (sort: SortOption) => void
  setIsFilterOpen: (open: boolean) => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setSearchQuery: (query: string) => void
  navigateDate: (days: number) => void
  clearFilters: () => void
  resetPagination: () => void
}

const initialFilterState = {
  selectedStatuses: [] as Bid['status'][],
  selectedTypes: [] as Bid['type'][],
  selectedBidderTypes: [] as Bid['bidder']['type'][],
  selectedAuctionStatuses: [] as Bid['auctionStatus'][],
  amountRange: DEFAULT_AMOUNT_RANGE as [number, number],
  onlyWinning: false,
}

export const useBidsStore = create<BidsState>()(
  persist(
    (set, get) => ({
      // Initial filter state
      ...initialFilterState,

      // Date state
      selectedDate: undefined, // Will be set to new Date() on client
      dateRangeStart: undefined,
      dateRangeLabel: 'Today',

      // View state
      viewMode: 'table',
      activeTab: 'pending',
      sortBy: 'ending-soon',
      isFilterOpen: false,

      // Pagination state
      currentPage: 1,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,

      // Search state
      searchQuery: '',

      // Actions
      setSelectedStatuses: (statuses) => set({ selectedStatuses: statuses }),
      setSelectedTypes: (types) => set({ selectedTypes: types }),
      setSelectedBidderTypes: (types) => set({ selectedBidderTypes: types }),
      setSelectedAuctionStatuses: (statuses) => set({ selectedAuctionStatuses: statuses }),
      setAmountRange: (range) => set({ amountRange: range }),
      setOnlyWinning: (value) => set({ onlyWinning: value }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setDateRangeStart: (date) => set({ dateRangeStart: date }),
      setDateRangeLabel: (label) => set({ dateRangeLabel: label }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveTab: (tab) => {
        set({ activeTab: tab, currentPage: 1 })
      },
      setSortBy: (sort) => set({ sortBy: sort }),
      setIsFilterOpen: (open) => set({ isFilterOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (count) => {
        set({ itemsPerPage: count, currentPage: 1 })
      },
      setSearchQuery: (query) => {
        set({ searchQuery: query, currentPage: 1 })
      },
      navigateDate: (days) => {
        const { selectedDate } = get()
        const currentDate = selectedDate || new Date()
        const newDate = addDays(currentDate, days)
        set({
          selectedDate: newDate,
          dateRangeStart: undefined,
          dateRangeLabel: format(newDate, 'MMM d, yyyy'),
          currentPage: 1,
        })
      },
      clearFilters: () => {
        set({
          ...initialFilterState,
          currentPage: 1,
        })
      },
      resetPagination: () => {
        set({ currentPage: 1 })
      },
    }),
    {
      name: 'bids-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        itemsPerPage: state.itemsPerPage,
        sortBy: state.sortBy,
      }),
    }
  )
)

// Selector hooks for common derived state
export const useBidsHasActiveFilters = () => {
  const store = useBidsStore()
  return (
    store.selectedStatuses.length > 0 ||
    store.selectedTypes.length > 0 ||
    store.selectedBidderTypes.length > 0 ||
    store.selectedAuctionStatuses.length > 0 ||
    store.amountRange[0] > 0 ||
    store.amountRange[1] < DEFAULT_AMOUNT_RANGE[1] ||
    store.onlyWinning
  )
}

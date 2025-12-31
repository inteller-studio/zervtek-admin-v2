import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, format } from 'date-fns'

export type ServiceTypeFilter = 'all' | 'translation' | 'inspection'

interface ServicesState {
  // Filter state
  typeFilter: ServiceTypeFilter
  searchQuery: string

  // Date state
  selectedDate: Date | undefined
  dateRangeStart: Date | undefined
  dateRangeLabel: string
  isCalendarOpen: boolean

  // Pagination state
  currentPage: number
  itemsPerPage: number

  // Actions
  setTypeFilter: (type: ServiceTypeFilter) => void
  setSearchQuery: (query: string) => void
  setSelectedDate: (date: Date | undefined) => void
  setDateRangeStart: (date: Date | undefined) => void
  setDateRangeLabel: (label: string) => void
  setIsCalendarOpen: (open: boolean) => void
  setCurrentPage: (page: number) => void
  navigateDate: (days: number) => void
  resetFilters: () => void
}

const DEFAULT_ITEMS_PER_PAGE = 16

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      // Filter state
      typeFilter: 'all',
      searchQuery: '',

      // Date state
      selectedDate: undefined, // Will be set to new Date() on client
      dateRangeStart: undefined,
      dateRangeLabel: 'Today',
      isCalendarOpen: false,

      // Pagination state
      currentPage: 1,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,

      // Actions
      setTypeFilter: (type) => {
        set({ typeFilter: type, currentPage: 1 })
      },
      setSearchQuery: (query) => {
        set({ searchQuery: query, currentPage: 1 })
      },
      setSelectedDate: (date) => set({ selectedDate: date }),
      setDateRangeStart: (date) => set({ dateRangeStart: date }),
      setDateRangeLabel: (label) => set({ dateRangeLabel: label }),
      setIsCalendarOpen: (open) => set({ isCalendarOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
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
      resetFilters: () => {
        set({
          typeFilter: 'all',
          searchQuery: '',
          currentPage: 1,
        })
      },
    }),
    {
      name: 'services-storage',
      partialize: (state) => ({
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
)

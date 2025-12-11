import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardState {
  widgetOrder: string[]
  setWidgetOrder: (order: string[]) => void
  resetWidgetOrder: () => void

  dateRange: { from: Date | undefined; to: Date | undefined }
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void

  selectedCurrency: string
  setSelectedCurrency: (currency: string) => void
}

const defaultWidgetOrder = [
  'user-growth',
  'country-distribution',
  'vehicle-inventory',
  'bid-activity',
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgetOrder: defaultWidgetOrder,
      setWidgetOrder: (order) => set({ widgetOrder: order }),
      resetWidgetOrder: () => set({ widgetOrder: defaultWidgetOrder }),

      dateRange: { from: undefined, to: undefined },
      setDateRange: (range) => set({ dateRange: range }),

      selectedCurrency: 'USD',
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
)

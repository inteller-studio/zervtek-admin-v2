// Financial report types for accounting module

export type DateRangeType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

export interface DateRange {
  from: Date
  to: Date
  type: DateRangeType
}

// Profit & Loss Report Types
export interface ProfitLossData {
  revenue: {
    total: number
    byPaymentMethod: Record<string, number>
    byMonth: { month: string; amount: number }[]
  }
  costOfGoodsSold: {
    total: number
    byCategory: Record<string, number>
    byMonth: { month: string; amount: number }[]
  }
  grossProfit: number
  grossMargin: number // percentage
  netProfit: number
  netMargin: number // percentage
}

export interface ProfitLossLineItem {
  label: string
  amount: number
  percentage?: number
  isSubtotal?: boolean
  isTotal?: boolean
  indent?: number
}

// Cash Flow Report Types
export interface CashFlowData {
  inflows: {
    total: number
    byPaymentMethod: Record<string, number>
    byDate: { date: string; amount: number }[]
  }
  outflows: {
    total: number
    byCategory: Record<string, number>
    byDate: { date: string; amount: number }[]
  }
  netCashFlow: number
  runningBalance: { date: string; balance: number }[]
}

// Revenue Analytics Types
export interface RevenueAnalytics {
  totalRevenue: number
  averageTransactionValue: number
  transactionCount: number
  revenueByPeriod: { period: string; revenue: number; transactions: number }[]
  revenueByPaymentMethod: { method: string; amount: number; percentage: number }[]
  revenueByCustomer: { customerId: string; customerName: string; amount: number; transactions: number }[]
  topVehicles: { vehicle: string; amount: number }[]
}

// Cost Analysis Types
export interface CostAnalysis {
  totalCosts: number
  averageCostPerVehicle: number
  vehicleCount: number
  costsByCategory: { category: string; amount: number; percentage: number }[]
  costTrends: { period: string; costs: number }[]
  categoryTrends: { period: string; categories: Record<string, number> }[]
  marginAnalysis: {
    averageMargin: number
    marginByVehicle: { vehicle: string; revenue: number; costs: number; margin: number }[]
  }
}

// Accounts Receivable Types
export interface AccountsReceivable {
  totalOutstanding: number
  totalOverdue: number
  collectionRate: number
  aging: {
    current: number // 0-30 days
    thirtyDays: number // 31-60 days
    sixtyDays: number // 61-90 days
    ninetyDaysPlus: number // 90+ days
  }
  customerBalances: {
    customerId: string
    customerName: string
    customerEmail: string
    totalOwed: number
    paidAmount: number
    outstanding: number
    oldestInvoiceDate?: Date
    daysPastDue?: number
  }[]
}

// Summary Stats for Dashboard
export interface AccountingSummary {
  totalRevenue: number
  totalCosts: number
  grossProfit: number
  netProfit: number
  outstandingReceivables: number
  revenueChange: number // percentage change from previous period
  profitChange: number // percentage change from previous period
}

// Cost category type matching the existing won-auctions data
export type CostCategory = 'auction' | 'transport' | 'repair' | 'documents' | 'shipping' | 'customs' | 'storage' | 'other'

// Payment method types
export type PaymentMethod = 'card' | 'wire_transfer' | 'bank_check' | 'paypal' | 'credit_card' | 'crypto' | 'cash'

// Expense categories for standalone business expenses
export type ExpenseCategory =
  | 'rent'           // Office/warehouse rent
  | 'utilities'      // Electricity, water, internet
  | 'salaries'       // Staff wages
  | 'office'         // Office supplies
  | 'marketing'      // Advertising, promotions
  | 'insurance'      // Business insurance
  | 'taxes'          // Business taxes, licenses
  | 'maintenance'    // Equipment/facility maintenance
  | 'travel'         // Business travel
  | 'professional'   // Legal, accounting services
  | 'software'       // Software subscriptions
  | 'other'          // Miscellaneous

export interface Expense {
  id: string
  category: ExpenseCategory
  description: string
  amount: number
  currency: string
  date: Date
  vendor?: string           // Who was paid
  invoiceRef?: string       // Invoice/receipt reference
  paymentMethod?: PaymentMethod
  notes?: string
  attachmentUrl?: string    // Receipt/invoice file
  isRecurring?: boolean
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly'
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Expense summary for display
export interface ExpenseSummary {
  totalExpenses: number
  expensesByCategory: { category: ExpenseCategory; amount: number; percentage: number; count: number }[]
  expensesByMonth: { month: string; amount: number }[]
  recurringTotal: number
  recentExpenses: Expense[]
}

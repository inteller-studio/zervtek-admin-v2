import { faker } from '@faker-js/faker'
import type { Expense, ExpenseCategory, PaymentMethod } from '../types/accounting'

faker.seed(12345)

const expenseCategories: ExpenseCategory[] = [
  'rent', 'utilities', 'salaries', 'office', 'marketing',
  'insurance', 'taxes', 'maintenance', 'travel', 'professional',
  'software', 'other'
]

const paymentMethods: PaymentMethod[] = ['cash', 'card', 'wire_transfer', 'bank_check']

// Category-specific vendors and descriptions
const categoryConfig: Record<ExpenseCategory, { vendors: string[]; descriptions: string[] }> = {
  rent: {
    vendors: ['Tokyo Office Building Co.', 'Osaka Commercial Properties', 'Nagoya Real Estate'],
    descriptions: ['Monthly office rent', 'Warehouse rent', 'Parking space rental', 'Storage unit rent'],
  },
  utilities: {
    vendors: ['TEPCO', 'Tokyo Gas', 'NTT Communications', 'Softbank Internet'],
    descriptions: ['Electricity bill', 'Gas bill', 'Internet service', 'Water bill', 'Phone service'],
  },
  salaries: {
    vendors: ['Payroll', 'HR Department'],
    descriptions: ['Staff salaries', 'Part-time wages', 'Overtime payment', 'Bonus payment', 'Commission payout'],
  },
  office: {
    vendors: ['Amazon Business', 'Askul', 'Kokuyo', 'Staples Japan'],
    descriptions: ['Office supplies', 'Printer paper', 'Stationery', 'Coffee and refreshments', 'Cleaning supplies'],
  },
  marketing: {
    vendors: ['Google Ads', 'Facebook Ads', 'Yahoo Japan', 'Print Shop Tokyo'],
    descriptions: ['Online advertising', 'Social media ads', 'Print materials', 'Trade show booth', 'Website SEO'],
  },
  insurance: {
    vendors: ['Tokio Marine', 'Sompo Japan', 'Mitsui Sumitomo'],
    descriptions: ['Business liability insurance', 'Vehicle insurance', 'Property insurance', 'Worker compensation'],
  },
  taxes: {
    vendors: ['National Tax Agency', 'Tokyo Tax Office', 'City Hall'],
    descriptions: ['Corporate tax payment', 'Consumption tax', 'Business license fee', 'Property tax'],
  },
  maintenance: {
    vendors: ['Building Maintenance Co.', 'IT Support Inc.', 'Cleaning Service Ltd.'],
    descriptions: ['Building maintenance', 'IT equipment repair', 'HVAC service', 'Office cleaning', 'Equipment maintenance'],
  },
  travel: {
    vendors: ['JR East', 'ANA', 'JAL', 'Hotels.com'],
    descriptions: ['Business trip - Tokyo', 'Client visit - Osaka', 'Auction inspection trip', 'Conference attendance', 'Taxi expenses'],
  },
  professional: {
    vendors: ['Law Office Tanaka', 'ABC Accounting', 'HR Consulting Inc.'],
    descriptions: ['Legal consultation', 'Accounting services', 'Tax filing service', 'HR consulting', 'Audit fees'],
  },
  software: {
    vendors: ['Microsoft', 'Salesforce', 'Slack', 'Adobe', 'AWS'],
    descriptions: ['Microsoft 365 subscription', 'CRM license', 'Cloud hosting', 'Design software', 'Accounting software'],
  },
  other: {
    vendors: ['Various', 'Miscellaneous'],
    descriptions: ['Miscellaneous expense', 'Bank fees', 'Petty cash expense', 'Delivery charges', 'Membership fees'],
  },
}

// Generate monthly amounts for recurring expenses
const recurringAmounts: Partial<Record<ExpenseCategory, { min: number; max: number }>> = {
  rent: { min: 300000, max: 500000 },
  utilities: { min: 50000, max: 150000 },
  salaries: { min: 2000000, max: 5000000 },
  insurance: { min: 100000, max: 200000 },
  software: { min: 30000, max: 100000 },
}

function generateExpense(index: number, date: Date): Expense {
  const category = faker.helpers.arrayElement(expenseCategories)
  const config = categoryConfig[category]
  const isRecurring = ['rent', 'salaries', 'insurance', 'software'].includes(category) && faker.datatype.boolean(0.7)

  let amount: number
  if (isRecurring && recurringAmounts[category]) {
    amount = faker.number.int(recurringAmounts[category]!)
  } else {
    // Non-recurring amounts based on category
    switch (category) {
      case 'salaries':
        amount = faker.number.int({ min: 500000, max: 3000000 })
        break
      case 'rent':
        amount = faker.number.int({ min: 200000, max: 600000 })
        break
      case 'marketing':
        amount = faker.number.int({ min: 50000, max: 500000 })
        break
      case 'travel':
        amount = faker.number.int({ min: 10000, max: 200000 })
        break
      case 'office':
        amount = faker.number.int({ min: 5000, max: 50000 })
        break
      case 'professional':
        amount = faker.number.int({ min: 50000, max: 300000 })
        break
      default:
        amount = faker.number.int({ min: 10000, max: 200000 })
    }
  }

  const createdAt = faker.date.between({ from: date, to: new Date(date.getTime() + 86400000) })

  return {
    id: `exp-${String(index).padStart(4, '0')}`,
    category,
    description: faker.helpers.arrayElement(config.descriptions),
    amount,
    currency: 'JPY',
    date,
    vendor: faker.helpers.arrayElement(config.vendors),
    invoiceRef: faker.datatype.boolean(0.6) ? `INV-${faker.string.alphanumeric(8).toUpperCase()}` : undefined,
    paymentMethod: faker.helpers.arrayElement(paymentMethods),
    notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : undefined,
    isRecurring,
    recurringFrequency: isRecurring ? faker.helpers.arrayElement(['monthly', 'quarterly', 'yearly'] as const) : undefined,
    createdBy: faker.helpers.arrayElement(['admin-001', 'staff-001', 'staff-002']),
    createdAt,
    updatedAt: createdAt,
  }
}

// Generate 80 expenses over the past 12 months
export const expenses: Expense[] = []

const now = new Date()
for (let i = 0; i < 80; i++) {
  const monthsAgo = Math.floor(i / 7) // ~7 expenses per month
  const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, faker.number.int({ min: 1, max: 28 }))
  expenses.push(generateExpense(i + 1, date))
}

// Sort by date descending (most recent first)
expenses.sort((a, b) => b.date.getTime() - a.date.getTime())

// Helper functions for expense operations
export function getExpenseById(id: string): Expense | undefined {
  return expenses.find((e) => e.id === id)
}

export function getExpensesByCategory(category: ExpenseCategory): Expense[] {
  return expenses.filter((e) => e.category === category)
}

export function getExpensesByDateRange(from: Date, to: Date): Expense[] {
  return expenses.filter((e) => e.date >= from && e.date <= to)
}

export function getRecurringExpenses(): Expense[] {
  return expenses.filter((e) => e.isRecurring)
}

export function getExpenseSummary(expenseList: Expense[] = expenses) {
  const totalExpenses = expenseList.reduce((sum, e) => sum + e.amount, 0)

  // Group by category
  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>()
  expenseList.forEach((e) => {
    const existing = categoryMap.get(e.category) || { amount: 0, count: 0 }
    categoryMap.set(e.category, {
      amount: existing.amount + e.amount,
      count: existing.count + 1,
    })
  })

  const expensesByCategory = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Group by month
  const monthMap = new Map<string, number>()
  expenseList.forEach((e) => {
    const monthKey = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + e.amount)
  })

  const expensesByMonth = Array.from(monthMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const recurringTotal = expenseList
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => sum + e.amount, 0)

  return {
    totalExpenses,
    expensesByCategory,
    expensesByMonth,
    recurringTotal,
    recentExpenses: expenseList.slice(0, 5),
  }
}

// Category labels for display
export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  utilities: 'Utilities',
  salaries: 'Salaries & Wages',
  office: 'Office Supplies',
  marketing: 'Marketing',
  insurance: 'Insurance',
  taxes: 'Taxes & Licenses',
  maintenance: 'Maintenance',
  travel: 'Travel',
  professional: 'Professional Services',
  software: 'Software',
  other: 'Other',
}

// Category icons mapping (for use with react-icons/md)
export const expenseCategoryIcons: Record<ExpenseCategory, string> = {
  rent: 'MdHome',
  utilities: 'MdElectricalServices',
  salaries: 'MdPeople',
  office: 'MdInventory',
  marketing: 'MdCampaign',
  insurance: 'MdSecurity',
  taxes: 'MdAccountBalance',
  maintenance: 'MdBuild',
  travel: 'MdFlight',
  professional: 'MdGavel',
  software: 'MdComputer',
  other: 'MdMoreHoriz',
}

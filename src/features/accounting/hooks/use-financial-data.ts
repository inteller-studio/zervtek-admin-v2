import { useMemo } from 'react'
import { purchases } from '@/features/won-auctions/data/won-auctions'
import { expenses } from '../data/expenses'
import type {
  DateRange,
  ProfitLossData,
  CashFlowData,
  RevenueAnalytics,
  CostAnalysis,
  AccountsReceivable,
  AccountingSummary,
} from '../types/accounting'

// Helper to check if a date is within range
function isDateInRange(date: Date, range: DateRange): boolean {
  const d = new Date(date)
  return d >= range.from && d <= range.to
}

// Helper to format month
function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Helper to format date
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function useFinancialData(dateRange: DateRange) {
  // Filter purchases by date range
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => isDateInRange(p.createdAt, dateRange))
  }, [dateRange])

  // Filter operating expenses by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInRange(new Date(e.date), dateRange))
  }, [dateRange])

  // Calculate total operating expenses
  const totalOperatingExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  }, [filteredExpenses])

  // Calculate Profit & Loss Data
  const profitLossData = useMemo((): ProfitLossData => {
    // Revenue: Total payments received
    const revenueByMethod: Record<string, number> = {}
    const revenueByMonth: Record<string, number> = {}
    let totalRevenue = 0

    filteredPurchases.forEach((purchase) => {
      purchase.payments.forEach((payment) => {
        if (isDateInRange(payment.date, dateRange)) {
          totalRevenue += payment.amount
          revenueByMethod[payment.method] = (revenueByMethod[payment.method] || 0) + payment.amount
          const month = formatMonth(payment.date)
          revenueByMonth[month] = (revenueByMonth[month] || 0) + payment.amount
        }
      })
    })

    // COGS: Our costs
    const cogsByCategory: Record<string, number> = {}
    const cogsByMonth: Record<string, number> = {}
    let totalCogs = 0

    filteredPurchases.forEach((purchase) => {
      if (purchase.ourCosts) {
        purchase.ourCosts.items.forEach((cost) => {
          if (isDateInRange(cost.date, dateRange)) {
            totalCogs += cost.amount
            cogsByCategory[cost.category] = (cogsByCategory[cost.category] || 0) + cost.amount
            const month = formatMonth(cost.date)
            cogsByMonth[month] = (cogsByMonth[month] || 0) + cost.amount
          }
        })
      }
    })

    const grossProfit = totalRevenue - totalCogs
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const netProfit = grossProfit - totalOperatingExpenses // Subtract operating expenses
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      revenue: {
        total: totalRevenue,
        byPaymentMethod: revenueByMethod,
        byMonth: Object.entries(revenueByMonth).map(([month, amount]) => ({ month, amount })),
      },
      costOfGoodsSold: {
        total: totalCogs,
        byCategory: cogsByCategory,
        byMonth: Object.entries(cogsByMonth).map(([month, amount]) => ({ month, amount })),
      },
      grossProfit,
      grossMargin,
      netProfit,
      netMargin,
    }
  }, [filteredPurchases, dateRange, totalOperatingExpenses])

  // Calculate Cash Flow Data
  const cashFlowData = useMemo((): CashFlowData => {
    const inflowsByMethod: Record<string, number> = {}
    const inflowsByDate: Record<string, number> = {}
    let totalInflows = 0

    const outflowsByCategory: Record<string, number> = {}
    const outflowsByDate: Record<string, number> = {}
    let totalOutflows = 0

    filteredPurchases.forEach((purchase) => {
      // Inflows from payments
      purchase.payments.forEach((payment) => {
        if (isDateInRange(payment.date, dateRange)) {
          totalInflows += payment.amount
          inflowsByMethod[payment.method] = (inflowsByMethod[payment.method] || 0) + payment.amount
          const date = formatDate(payment.date)
          inflowsByDate[date] = (inflowsByDate[date] || 0) + payment.amount
        }
      })

      // Outflows from costs
      if (purchase.ourCosts) {
        purchase.ourCosts.items.forEach((cost) => {
          if (isDateInRange(cost.date, dateRange)) {
            totalOutflows += cost.amount
            outflowsByCategory[cost.category] = (outflowsByCategory[cost.category] || 0) + cost.amount
            const date = formatDate(cost.date)
            outflowsByDate[date] = (outflowsByDate[date] || 0) + cost.amount
          }
        })
      }
    })

    // Add operating expenses to outflows
    filteredExpenses.forEach((expense) => {
      totalOutflows += expense.amount
      // Group operating expenses under 'operating' category
      outflowsByCategory['operating'] = (outflowsByCategory['operating'] || 0) + expense.amount
      const date = formatDate(new Date(expense.date))
      outflowsByDate[date] = (outflowsByDate[date] || 0) + expense.amount
    })

    // Calculate running balance
    const allDates = [...new Set([...Object.keys(inflowsByDate), ...Object.keys(outflowsByDate)])].sort()
    let runningTotal = 0
    const runningBalance = allDates.map((date) => {
      runningTotal += (inflowsByDate[date] || 0) - (outflowsByDate[date] || 0)
      return { date, balance: runningTotal }
    })

    return {
      inflows: {
        total: totalInflows,
        byPaymentMethod: inflowsByMethod,
        byDate: Object.entries(inflowsByDate)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
      outflows: {
        total: totalOutflows,
        byCategory: outflowsByCategory,
        byDate: Object.entries(outflowsByDate)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      },
      netCashFlow: totalInflows - totalOutflows,
      runningBalance,
    }
  }, [filteredPurchases, dateRange, filteredExpenses])

  // Calculate Revenue Analytics
  const revenueAnalytics = useMemo((): RevenueAnalytics => {
    const revenueByPeriod: Record<string, { revenue: number; transactions: number }> = {}
    const revenueByMethod: Record<string, number> = {}
    const revenueByCustomer: Record<string, { name: string; amount: number; transactions: number }> = {}
    const revenueByVehicle: Record<string, number> = {}
    let totalRevenue = 0
    let transactionCount = 0

    filteredPurchases.forEach((purchase) => {
      purchase.payments.forEach((payment) => {
        if (isDateInRange(payment.date, dateRange)) {
          totalRevenue += payment.amount
          transactionCount++

          // By period (month)
          const month = formatMonth(payment.date)
          if (!revenueByPeriod[month]) {
            revenueByPeriod[month] = { revenue: 0, transactions: 0 }
          }
          revenueByPeriod[month].revenue += payment.amount
          revenueByPeriod[month].transactions++

          // By payment method
          revenueByMethod[payment.method] = (revenueByMethod[payment.method] || 0) + payment.amount

          // By customer
          if (!revenueByCustomer[purchase.winnerId]) {
            revenueByCustomer[purchase.winnerId] = { name: purchase.winnerName, amount: 0, transactions: 0 }
          }
          revenueByCustomer[purchase.winnerId].amount += payment.amount
          revenueByCustomer[purchase.winnerId].transactions++

          // By vehicle
          const vehicleKey = `${purchase.vehicleInfo.year} ${purchase.vehicleInfo.make} ${purchase.vehicleInfo.model}`
          revenueByVehicle[vehicleKey] = (revenueByVehicle[vehicleKey] || 0) + payment.amount
        }
      })
    })

    return {
      totalRevenue,
      averageTransactionValue: transactionCount > 0 ? totalRevenue / transactionCount : 0,
      transactionCount,
      revenueByPeriod: Object.entries(revenueByPeriod).map(([period, data]) => ({
        period,
        revenue: data.revenue,
        transactions: data.transactions,
      })),
      revenueByPaymentMethod: Object.entries(revenueByMethod).map(([method, amount]) => ({
        method,
        amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
      })),
      revenueByCustomer: Object.entries(revenueByCustomer)
        .map(([customerId, data]) => ({
          customerId,
          customerName: data.name,
          amount: data.amount,
          transactions: data.transactions,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10),
      topVehicles: Object.entries(revenueByVehicle)
        .map(([vehicle, amount]) => ({ vehicle, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10),
    }
  }, [filteredPurchases, dateRange])

  // Calculate Cost Analysis
  const costAnalysis = useMemo((): CostAnalysis => {
    const costsByCategory: Record<string, number> = {}
    const costsByPeriod: Record<string, number> = {}
    const categoryByPeriod: Record<string, Record<string, number>> = {}
    const marginByVehicle: { vehicle: string; revenue: number; costs: number; margin: number }[] = []
    let totalCosts = 0
    let vehicleCount = 0

    filteredPurchases.forEach((purchase) => {
      if (purchase.ourCosts) {
        vehicleCount++
        let vehicleCosts = 0
        let vehicleRevenue = 0

        // Calculate costs
        purchase.ourCosts.items.forEach((cost) => {
          if (isDateInRange(cost.date, dateRange)) {
            totalCosts += cost.amount
            vehicleCosts += cost.amount
            costsByCategory[cost.category] = (costsByCategory[cost.category] || 0) + cost.amount

            const month = formatMonth(cost.date)
            costsByPeriod[month] = (costsByPeriod[month] || 0) + cost.amount

            if (!categoryByPeriod[month]) {
              categoryByPeriod[month] = {}
            }
            categoryByPeriod[month][cost.category] = (categoryByPeriod[month][cost.category] || 0) + cost.amount
          }
        })

        // Calculate revenue for this vehicle
        purchase.payments.forEach((payment) => {
          if (isDateInRange(payment.date, dateRange)) {
            vehicleRevenue += payment.amount
          }
        })

        if (vehicleCosts > 0 || vehicleRevenue > 0) {
          const vehicleKey = `${purchase.vehicleInfo.year} ${purchase.vehicleInfo.make} ${purchase.vehicleInfo.model}`
          marginByVehicle.push({
            vehicle: vehicleKey,
            revenue: vehicleRevenue,
            costs: vehicleCosts,
            margin: vehicleRevenue - vehicleCosts,
          })
        }
      }
    })

    const averageMargin = marginByVehicle.length > 0
      ? marginByVehicle.reduce((sum, v) => sum + v.margin, 0) / marginByVehicle.length
      : 0

    return {
      totalCosts,
      averageCostPerVehicle: vehicleCount > 0 ? totalCosts / vehicleCount : 0,
      vehicleCount,
      costsByCategory: Object.entries(costsByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalCosts > 0 ? (amount / totalCosts) * 100 : 0,
      })),
      costTrends: Object.entries(costsByPeriod)
        .map(([period, costs]) => ({ period, costs }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      categoryTrends: Object.entries(categoryByPeriod)
        .map(([period, categories]) => ({ period, categories }))
        .sort((a, b) => a.period.localeCompare(b.period)),
      marginAnalysis: {
        averageMargin,
        marginByVehicle: marginByVehicle.sort((a, b) => b.margin - a.margin).slice(0, 10),
      },
    }
  }, [filteredPurchases, dateRange])

  // Calculate Accounts Receivable
  const accountsReceivable = useMemo((): AccountsReceivable => {
    const customerBalances: Record<string, {
      name: string
      email: string
      totalOwed: number
      paidAmount: number
      oldestDate?: Date
    }> = {}

    let totalOutstanding = 0
    let totalOverdue = 0
    const now = new Date()
    const aging = { current: 0, thirtyDays: 0, sixtyDays: 0, ninetyDaysPlus: 0 }

    filteredPurchases.forEach((purchase) => {
      const outstanding = purchase.totalAmount - purchase.paidAmount

      if (outstanding > 0) {
        totalOutstanding += outstanding

        // Calculate days since auction end
        const daysSinceAuction = Math.floor(
          (now.getTime() - new Date(purchase.auctionEndDate).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Aging buckets
        if (daysSinceAuction <= 30) {
          aging.current += outstanding
        } else if (daysSinceAuction <= 60) {
          aging.thirtyDays += outstanding
          totalOverdue += outstanding
        } else if (daysSinceAuction <= 90) {
          aging.sixtyDays += outstanding
          totalOverdue += outstanding
        } else {
          aging.ninetyDaysPlus += outstanding
          totalOverdue += outstanding
        }

        // Customer balance tracking
        if (!customerBalances[purchase.winnerId]) {
          customerBalances[purchase.winnerId] = {
            name: purchase.winnerName,
            email: purchase.winnerEmail,
            totalOwed: 0,
            paidAmount: 0,
            oldestDate: undefined,
          }
        }
        customerBalances[purchase.winnerId].totalOwed += purchase.totalAmount
        customerBalances[purchase.winnerId].paidAmount += purchase.paidAmount
        if (
          !customerBalances[purchase.winnerId].oldestDate ||
          new Date(purchase.auctionEndDate) < customerBalances[purchase.winnerId].oldestDate!
        ) {
          customerBalances[purchase.winnerId].oldestDate = new Date(purchase.auctionEndDate)
        }
      }
    })

    const totalReceivables = Object.values(customerBalances).reduce(
      (sum, c) => sum + (c.totalOwed - c.paidAmount),
      0
    )
    const totalPaid = Object.values(customerBalances).reduce((sum, c) => sum + c.paidAmount, 0)
    const collectionRate = totalReceivables + totalPaid > 0
      ? (totalPaid / (totalReceivables + totalPaid)) * 100
      : 100

    return {
      totalOutstanding,
      totalOverdue,
      collectionRate,
      aging,
      customerBalances: Object.entries(customerBalances)
        .map(([customerId, data]) => ({
          customerId,
          customerName: data.name,
          customerEmail: data.email,
          totalOwed: data.totalOwed,
          paidAmount: data.paidAmount,
          outstanding: data.totalOwed - data.paidAmount,
          oldestInvoiceDate: data.oldestDate,
          daysPastDue: data.oldestDate
            ? Math.max(0, Math.floor((now.getTime() - data.oldestDate.getTime()) / (1000 * 60 * 60 * 24)) - 30)
            : 0,
        }))
        .filter((c) => c.outstanding > 0)
        .sort((a, b) => b.outstanding - a.outstanding),
    }
  }, [filteredPurchases])

  // Calculate Summary Stats
  const summary = useMemo((): AccountingSummary => {
    return {
      totalRevenue: profitLossData.revenue.total,
      totalCosts: profitLossData.costOfGoodsSold.total,
      grossProfit: profitLossData.grossProfit,
      netProfit: profitLossData.netProfit,
      outstandingReceivables: accountsReceivable.totalOutstanding,
      revenueChange: 12.5, // Mock: would calculate from previous period
      profitChange: 8.3, // Mock: would calculate from previous period
    }
  }, [profitLossData, accountsReceivable])

  return {
    profitLossData,
    cashFlowData,
    revenueAnalytics,
    costAnalysis,
    accountsReceivable,
    summary,
    filteredPurchases,
  }
}

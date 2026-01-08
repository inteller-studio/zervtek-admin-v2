'use client'

import { useState, useMemo } from 'react'
import {
  MdAdd,
  MdShoppingCart,
  MdRepeat,
  MdTrendingDown,
  MdCategory,
} from 'react-icons/md'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { PieChart, Pie } from 'recharts'
import { toast } from 'sonner'
import type { Expense, ExpenseCategory, DateRange } from '../types/accounting'
import { expenses as allExpenses, getExpenseSummary, expenseCategoryLabels } from '../data/expenses'
import { ExpensesList } from './expenses-list'
import { AddExpenseDialog } from './add-expense-dialog'
import { EditExpenseDialog } from './edit-expense-dialog'

interface ExpensesTabProps {
  dateRange: DateRange
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6', '#f97316', '#64748b']

const formatCurrency = (amount: number, currency: string = 'JPY') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ExpensesTab({ dateRange }: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>(allExpenses)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= dateRange.from && expenseDate <= dateRange.to
    })
  }, [expenses, dateRange])

  // Calculate summary
  const summary = useMemo(() => getExpenseSummary(filteredExpenses), [filteredExpenses])

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    return summary.expensesByCategory.slice(0, 6).map((item) => ({
      name: expenseCategoryLabels[item.category],
      value: item.amount,
    }))
  }, [summary])

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    return summary.expensesByMonth.map((item) => ({
      month: item.month,
      amount: item.amount,
    }))
  }, [summary])

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdBy: 'admin-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const handleEditExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
    )
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id))
    toast.success('Expense deleted')
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setEditDialogOpen(true)
  }

  return (
    <div className='space-y-6'>
      {/* Header with Add Button */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Operating Expenses</h2>
          <p className='text-sm text-muted-foreground'>
            Manage standalone business expenses (rent, utilities, salaries, etc.)
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <MdAdd className='mr-2 h-4 w-4' />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Expenses</CardTitle>
            <MdShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {filteredExpenses.length} expense entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Recurring Expenses</CardTitle>
            <MdRepeat className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(summary.recurringTotal)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {filteredExpenses.filter((e) => e.isRecurring).length} recurring items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Top Category</CardTitle>
            <MdTrendingDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summary.expensesByCategory[0]
                ? expenseCategoryLabels[summary.expensesByCategory[0].category]
                : 'N/A'}
            </div>
            <p className='text-xs text-muted-foreground'>
              {summary.expensesByCategory[0]
                ? `${summary.expensesByCategory[0].percentage.toFixed(1)}% of total`
                : 'No expenses'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Categories</CardTitle>
            <MdCategory className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summary.expensesByCategory.length}</div>
            <p className='text-xs text-muted-foreground'>Active expense categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-full items-center justify-center text-muted-foreground'>
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Expense trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-[250px]'>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey='amount' name='Expenses' fill='#ef4444' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-full items-center justify-center text-muted-foreground'>
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>All recorded business expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesList
            expenses={filteredExpenses}
            onEdit={handleEdit}
            onDelete={handleDeleteExpense}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddExpenseDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddExpense}
      />

      <EditExpenseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        expense={selectedExpense}
        onSubmit={handleEditExpense}
      />
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  MdMoreHoriz,
  MdEdit,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdHome,
  MdElectricalServices,
  MdPeople,
  MdInventory,
  MdCampaign,
  MdSecurity,
  MdAccountBalance,
  MdBuild,
  MdFlight,
  MdGavel,
  MdComputer,
  MdRepeat,
} from 'react-icons/md'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Expense, ExpenseCategory } from '../types/accounting'
import { expenseCategoryLabels } from '../data/expenses'

interface ExpensesListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const categoryIcons: Record<ExpenseCategory, React.ElementType> = {
  rent: MdHome,
  utilities: MdElectricalServices,
  salaries: MdPeople,
  office: MdInventory,
  marketing: MdCampaign,
  insurance: MdSecurity,
  taxes: MdAccountBalance,
  maintenance: MdBuild,
  travel: MdFlight,
  professional: MdGavel,
  software: MdComputer,
  other: MdMoreHoriz,
}

const categoryColors: Record<ExpenseCategory, string> = {
  rent: 'bg-blue-100 text-blue-700',
  utilities: 'bg-yellow-100 text-yellow-700',
  salaries: 'bg-purple-100 text-purple-700',
  office: 'bg-gray-100 text-gray-700',
  marketing: 'bg-pink-100 text-pink-700',
  insurance: 'bg-cyan-100 text-cyan-700',
  taxes: 'bg-red-100 text-red-700',
  maintenance: 'bg-orange-100 text-orange-700',
  travel: 'bg-indigo-100 text-indigo-700',
  professional: 'bg-emerald-100 text-emerald-700',
  software: 'bg-violet-100 text-violet-700',
  other: 'bg-slate-100 text-slate-700',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash',
  card: 'Credit Card',
  wire_transfer: 'Wire Transfer',
  bank_check: 'Bank Check',
}

export function ExpensesList({ expenses, onEdit, onDelete }: ExpensesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        searchQuery === '' ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.invoiceRef?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [expenses, searchQuery, categoryFilter])

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (expenseToDelete) {
      onDelete(expenseToDelete.id)
      setDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <MdSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search by description, vendor, or reference...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>
        <div className='flex items-center gap-2'>
          <MdFilterList className='h-4 w-4 text-muted-foreground' />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Categories</SelectItem>
              {(Object.keys(expenseCategoryLabels) as ExpenseCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {expenseCategoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center text-muted-foreground'>
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.slice(0, 50).map((expense) => {
                const CategoryIcon = categoryIcons[expense.category]
                return (
                  <TableRow key={expense.id}>
                    <TableCell className='whitespace-nowrap'>
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[expense.category]}>
                        <CategoryIcon className='mr-1 h-3 w-3' />
                        {expenseCategoryLabels[expense.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <span className='max-w-[200px] truncate'>{expense.description}</span>
                        {expense.isRecurring && (
                          <Badge variant='outline' className='text-xs'>
                            <MdRepeat className='mr-1 h-3 w-3' />
                            {expense.recurringFrequency}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-muted-foreground'>
                        {expense.vendor || '-'}
                      </span>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      ¥{expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-muted-foreground'>
                        {expense.paymentMethod ? paymentMethodLabels[expense.paymentMethod] : '-'}
                      </span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MdMoreHoriz className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <MdEdit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => handleDeleteClick(expense)}
                          >
                            <MdDelete className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className='text-sm text-muted-foreground'>
        Showing {Math.min(filteredExpenses.length, 50)} of {filteredExpenses.length} expenses
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense?
              {expenseToDelete && (
                <span className='block mt-2 font-medium text-foreground'>
                  {expenseCategoryLabels[expenseToDelete.category]}: ¥{expenseToDelete.amount.toLocaleString()}
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

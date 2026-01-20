'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  MdEdit,
  MdSync,
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
  MdMoreHoriz,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Expense, ExpenseCategory, PaymentMethod } from '../types/accounting'
import { expenseCategoryLabels } from '../data/expenses'

const EXPENSE_CATEGORIES = [
  'rent', 'utilities', 'salaries', 'office', 'marketing',
  'insurance', 'taxes', 'maintenance', 'travel', 'professional',
  'software', 'other'
] as const

const PAYMENT_METHODS_EXPENSE = ['cash', 'card', 'wire_transfer', 'bank_check'] as const

const expenseFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, {
    message: 'Please select a category',
  }),
  description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  date: z.date({ message: 'Date is required' }),
  vendor: z.string().optional(),
  invoiceRef: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS_EXPENSE).optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
})

type ExpenseForm = z.infer<typeof expenseFormSchema>

interface EditExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onSubmit: (id: string, expense: Partial<Omit<Expense, 'id' | 'createdBy' | 'createdAt'>>) => void
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

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit Card' },
  { value: 'wire_transfer', label: 'Wire Transfer' },
  { value: 'bank_check', label: 'Bank Check' },
]

export function EditExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
}: EditExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExpenseForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      category: undefined,
      description: '',
      amount: 0,
      date: new Date(),
      vendor: '',
      invoiceRef: '',
      paymentMethod: undefined,
      notes: '',
      isRecurring: false,
      recurringFrequency: undefined,
    },
  })

  // Reset form when dialog opens with expense data
  useEffect(() => {
    if (open && expense) {
      form.reset({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: new Date(expense.date),
        vendor: expense.vendor || '',
        invoiceRef: expense.invoiceRef || '',
        paymentMethod: expense.paymentMethod as 'cash' | 'card' | 'wire_transfer' | 'bank_check' | undefined,
        notes: expense.notes || '',
        isRecurring: expense.isRecurring || false,
        recurringFrequency: expense.recurringFrequency,
      })
    }
  }, [open, expense, form])

  const isRecurring = form.watch('isRecurring')

  if (!expense) return null

  const handleSubmit = async (data: ExpenseForm) => {
    setIsSubmitting(true)

    try {
      onSubmit(expense.id, {
        category: data.category,
        description: data.description,
        amount: data.amount,
        currency: 'JPY',
        date: data.date,
        vendor: data.vendor || undefined,
        invoiceRef: data.invoiceRef || undefined,
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined,
        isRecurring: data.isRecurring,
        recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
        updatedAt: new Date(),
      })

      toast.success('Expense updated successfully', {
        description: `${expenseCategoryLabels[data.category]}: ¥${data.amount.toLocaleString()}`,
      })

      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdEdit className='h-5 w-5' />
            Edit Expense
          </DialogTitle>
          <DialogDescription>
            Update expense details for {expense.id}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(expenseCategoryLabels) as ExpenseCategory[]).map((cat) => {
                          const Icon = categoryIcons[cat]
                          return (
                            <SelectItem key={cat} value={cat}>
                              <span className='flex items-center gap-2'>
                                <Icon className='h-4 w-4' />
                                {expenseCategoryLabels[cat]}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (JPY) *</FormLabel>
                    <FormControl>
                      <NumericInput
                        placeholder='Enter amount'
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input placeholder='Brief description of the expense' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Date *</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder='Select date'
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='vendor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor / Paid To</FormLabel>
                    <FormControl>
                      <Input placeholder='Company or person name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='invoiceRef'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice / Reference #</FormLabel>
                    <FormControl>
                      <Input placeholder='Invoice or receipt number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='paymentMethod'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select method' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='rounded-lg border p-4 space-y-4'>
              <FormField
                control={form.control}
                name='isRecurring'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between'>
                    <div className='space-y-0.5'>
                      <FormLabel>Recurring Expense</FormLabel>
                      <FormDescription>
                        Mark if this expense repeats regularly
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isRecurring && (
                <FormField
                  control={form.control}
                  name='recurringFrequency'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select frequency' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='monthly'>Monthly</SelectItem>
                          <SelectItem value='quarterly'>Quarterly</SelectItem>
                          <SelectItem value='yearly'>Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Additional notes about this expense...'
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <MdSync className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <MdEdit className='mr-2 h-4 w-4' />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

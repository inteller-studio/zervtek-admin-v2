'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MdAttachMoney } from 'react-icons/md'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { type Purchase, type Payment } from '../../data/won-auctions'
import { PaymentHistoryTimeline } from '../payment-history-timeline'
import { PAYMENT_METHODS } from '../../types'

const paymentFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['card', 'wire_transfer', 'bank_check', 'paypal'], {
    message: 'Please select a payment method',
  }),
  date: z.date({ message: 'Payment date is required' }),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  notes: z.string().optional(),
})

type PaymentForm = z.infer<typeof paymentFormSchema>

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: Purchase | null
  onSubmit: (auctionId: string, payment: Omit<Payment, 'id' | 'auctionId' | 'recordedBy' | 'recordedAt'>) => void
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  auction,
  onSubmit,
}: RecordPaymentDialogProps) {
  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      method: undefined,
      date: new Date(),
      referenceNumber: '',
      notes: '',
    },
  })

  // Reset form when dialog opens with a new auction
  useEffect(() => {
    if (open && auction) {
      const outstandingBalance = auction.totalAmount - auction.paidAmount
      form.reset({
        amount: outstandingBalance > 0 ? outstandingBalance : 0,
        method: undefined,
        date: new Date(),
        referenceNumber: '',
        notes: '',
      })
    }
  }, [open, auction, form])

  if (!auction) return null

  const outstandingBalance = auction.totalAmount - auction.paidAmount
  const paymentProgress = (auction.paidAmount / auction.totalAmount) * 100

  const handleSubmit = (data: PaymentForm) => {
    if (data.amount > outstandingBalance) {
      form.setError('amount', {
        message: `Amount cannot exceed outstanding balance of ¥${outstandingBalance.toLocaleString()}`,
      })
      return
    }

    onSubmit(auction.id, {
      amount: data.amount,
      method: data.method,
      date: data.date,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
    })

    toast.success('Payment recorded successfully', {
      description: `¥${data.amount.toLocaleString()} payment recorded for ${auction.auctionId}`,
    })

    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdAttachMoney className='h-5 w-5' />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a payment for {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
            {auction.vehicleInfo.model} - {auction.auctionId}
          </DialogDescription>
        </DialogHeader>

        {/* Payment Summary Card */}
        <Card className='bg-muted/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm'>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Total Amount</p>
                <p className='text-lg font-bold'>¥{auction.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Amount Paid</p>
                <p className='text-lg font-bold text-green-600'>
                  ¥{auction.paidAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground'>Outstanding</p>
                <p className='text-lg font-bold text-orange-600'>
                  ¥{outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <div className='mb-1 flex justify-between text-xs'>
                <span>Payment Progress</span>
                <span>{Math.round(paymentProgress)}%</span>
              </div>
              <Progress value={paymentProgress} className='h-2' />
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        {auction.payments && auction.payments.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Payment History</h4>
            <PaymentHistoryTimeline payments={auction.payments} />
          </div>
        )}

        {/* Payment Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount (¥)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='1'
                        min='1'
                        max={outstandingBalance}
                        placeholder={`Max: ${outstandingBalance.toLocaleString()}`}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='method'
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
                        {PAYMENT_METHODS.map((method) => (
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

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Payment Date</FormLabel>
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
                name='referenceNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Transaction ID or check number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add any notes about this payment...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={outstandingBalance <= 0}>
                <MdAttachMoney className='mr-2 h-4 w-4' />
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

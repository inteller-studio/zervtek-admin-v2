'use client'

import { format } from 'date-fns'
import { CreditCard, Building2, Receipt, Wallet } from 'lucide-react'
import { type Payment } from '../data/won-auctions'

const methodIcons = {
  card: CreditCard,
  wire_transfer: Building2,
  bank_check: Receipt,
  paypal: Wallet,
}

const methodLabels = {
  card: 'Credit/Debit Card',
  wire_transfer: 'Wire Transfer',
  bank_check: 'Bank Check',
  paypal: 'PayPal',
}

interface PaymentHistoryTimelineProps {
  payments: Payment[]
}

export function PaymentHistoryTimeline({ payments }: PaymentHistoryTimelineProps) {
  if (!payments || payments.length === 0) {
    return (
      <p className='py-2 text-sm text-muted-foreground'>No payments recorded yet.</p>
    )
  }

  // Sort payments by date, newest first
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className='max-h-48 space-y-3 overflow-y-auto'>
      {sortedPayments.map((payment) => {
        const Icon = methodIcons[payment.method]
        return (
          <div
            key={payment.id}
            className='flex items-start gap-3 rounded-lg bg-muted/50 p-3'
          >
            <div className='rounded-full bg-primary/10 p-2'>
              <Icon className='h-4 w-4 text-primary' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium'>${payment.amount.toLocaleString()}</p>
                <span className='text-xs text-muted-foreground'>
                  {format(new Date(payment.date), 'MMM dd, yyyy')}
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                {methodLabels[payment.method]} - Ref: {payment.referenceNumber}
              </p>
              {payment.notes && (
                <p className='mt-1 truncate text-xs text-muted-foreground'>{payment.notes}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

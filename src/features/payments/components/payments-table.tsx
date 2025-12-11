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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, RefreshCw, Receipt, XCircle } from 'lucide-react'
import { type Payment } from '../data/payments'
import { format } from 'date-fns'

interface PaymentsTableProps {
  data: Payment[]
}

const getStatusBadge = (status: Payment['status']) => {
  const variants: Record<Payment['status'], string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    processing: 'text-blue-600 bg-blue-100',
    completed: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    refunded: 'text-purple-600 bg-purple-100',
    cancelled: 'text-gray-600 bg-gray-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getTypeBadge = (type: Payment['type']) => {
  const labels: Record<Payment['type'], string> = {
    auction_payment: 'Auction',
    deposit: 'Deposit',
    shipping: 'Shipping',
    customs: 'Customs',
    refund: 'Refund',
    other: 'Other',
  }

  return (
    <Badge variant='outline'>
      {labels[type]}
    </Badge>
  )
}

const getMethodLabel = (method: Payment['paymentMethod']) => {
  const labels: Record<Payment['paymentMethod'], string> = {
    wire_transfer: 'Wire Transfer',
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    crypto: 'Crypto',
    bank_check: 'Bank Check',
  }
  return labels[method]
}

export function PaymentsTable({ data }: PaymentsTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className='font-medium'>{payment.paymentId}</TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>{payment.customerName}</p>
                  <p className='text-sm text-muted-foreground'>{payment.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>{getTypeBadge(payment.type)}</TableCell>
              <TableCell>{getMethodLabel(payment.paymentMethod)}</TableCell>
              <TableCell className={payment.amount < 0 ? 'text-red-600' : 'font-medium'}>
                {payment.amount < 0 ? '-' : ''}${Math.abs(payment.amount).toLocaleString()}
              </TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell>{format(payment.createdAt, 'MMM dd, yyyy')}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Receipt className='mr-2 h-4 w-4' />
                      View Receipt
                    </DropdownMenuItem>
                    {payment.status === 'pending' && (
                      <DropdownMenuItem>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Process Payment
                      </DropdownMenuItem>
                    )}
                    {(payment.status === 'pending' || payment.status === 'processing') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive'>
                          <XCircle className='mr-2 h-4 w-4' />
                          Cancel Payment
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

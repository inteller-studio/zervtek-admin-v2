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
import { MdMoreHoriz, MdVisibility, MdSend, MdDownload, MdContentCopy, MdDelete } from 'react-icons/md'
import { type Invoice } from '../data/invoices'
import { format } from 'date-fns'

interface InvoicesTableProps {
  data: Invoice[]
}

const getStatusBadge = (status: Invoice['status']) => {
  const variants: Record<Invoice['status'], string> = {
    draft: 'text-gray-600 bg-gray-100',
    sent: 'text-blue-600 bg-blue-100',
    paid: 'text-green-600 bg-green-100',
    overdue: 'text-red-600 bg-red-100',
    cancelled: 'text-slate-600 bg-slate-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function InvoicesTable({ data }: InvoicesTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className='font-medium'>{invoice.invoiceNumber}</TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>{invoice.customerName}</p>
                  <p className='text-sm text-muted-foreground'>{invoice.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>{invoice.items.length} items</TableCell>
              <TableCell className='font-medium'>¥{invoice.total.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell>{format(invoice.dueDate, 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(invoice.createdAt, 'MMM dd, yyyy')}</TableCell>
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
                    <DropdownMenuItem>
                      <MdVisibility className='mr-2 h-4 w-4' />
                      View Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdDownload className='mr-2 h-4 w-4' />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdContentCopy className='mr-2 h-4 w-4' />
                      Duplicate
                    </DropdownMenuItem>
                    {invoice.status === 'draft' && (
                      <DropdownMenuItem>
                        <MdSend className='mr-2 h-4 w-4' />
                        Send to Customer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-destructive'>
                      <MdDelete className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
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

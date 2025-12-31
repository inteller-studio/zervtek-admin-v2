import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { type Customer } from '../data/customers'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CustomersTableProps {
  data: Customer[]
}

// Status styles matching purchases page pattern
const statusStyles: Record<Customer['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  banned: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
}

const statusLabels: Record<Customer['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended',
  banned: 'Banned',
}

const verificationStyles: Record<Customer['verificationStatus'], string> = {
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  unverified: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30',
  documents_requested: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
}

const verificationLabels: Record<Customer['verificationStatus'], string> = {
  verified: 'Verified',
  pending: 'Pending',
  unverified: 'Unverified',
  documents_requested: 'Docs Requested',
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <div className='rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm'>
      <Table striped>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead>Customer</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Purchases</TableHead>
            <TableHead>Last Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary'>
                    {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className='font-medium text-foreground'>{customer.name}</p>
                    <p className='text-xs text-muted-foreground'>{customer.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className='text-muted-foreground'>{customer.country}</span>
              </TableCell>
              <TableCell>
                {customer.assignedToName ? (
                  <div className='flex items-center gap-2'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                      {customer.assignedToName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className='text-sm'>{customer.assignedToName}</span>
                  </div>
                ) : (
                  <span className='text-sm text-muted-foreground italic'>Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant='outline' className={cn('text-xs font-medium', statusStyles[customer.status])}>
                  {statusLabels[customer.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant='outline' className={cn('text-xs font-medium', verificationStyles[customer.verificationStatus])}>
                  {verificationLabels[customer.verificationStatus]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className='font-semibold tabular-nums'>¥{customer.totalSpent.toLocaleString()}</span>
              </TableCell>
              <TableCell>
                <span className='tabular-nums text-muted-foreground'>{customer.wonAuctions}</span>
              </TableCell>
              <TableCell>
                <span className='text-muted-foreground'>{format(customer.lastActivity, 'MMM dd, yyyy')}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

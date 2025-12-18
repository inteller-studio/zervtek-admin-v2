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
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone, UserCircle } from 'lucide-react'
import { type Customer } from '../data/customers'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CustomersTableProps {
  data: Customer[]
}

// Status styles matching purchases page pattern
const statusStyles: Record<Customer['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  suspended: 'bg-red-500/10 text-red-600 border-red-500/20',
}

const statusLabels: Record<Customer['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended',
}

const verificationStyles: Record<Customer['verificationStatus'], string> = {
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  unverified: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  documents_requested: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
}

const verificationLabels: Record<Customer['verificationStatus'], string> = {
  verified: 'Verified',
  pending: 'Pending',
  unverified: 'Unverified',
  documents_requested: 'Docs Requested',
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Purchases</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div>
                  <p className='font-medium'>{customer.name}</p>
                  <p className='text-sm text-muted-foreground'>{customer.email}</p>
                </div>
              </TableCell>
              <TableCell>{customer.country}</TableCell>
              <TableCell>
                {customer.assignedToName ? (
                  <div className='flex items-center gap-2'>
                    <UserCircle className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{customer.assignedToName}</span>
                  </div>
                ) : (
                  <span className='text-sm text-muted-foreground'>Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant='outline' className={cn('text-xs', statusStyles[customer.status])}>
                  {statusLabels[customer.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant='outline' className={cn('text-xs', verificationStyles[customer.verificationStatus])}>
                  {verificationLabels[customer.verificationStatus]}
                </Badge>
              </TableCell>
              <TableCell className='font-medium'>¥{customer.totalSpent.toLocaleString()}</TableCell>
              <TableCell>{customer.wonAuctions}</TableCell>
              <TableCell>{format(customer.lastActivity, 'MMM dd, yyyy')}</TableCell>
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
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className='mr-2 h-4 w-4' />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className='mr-2 h-4 w-4' />
                      Call Customer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-destructive'>
                      <Trash2 className='mr-2 h-4 w-4' />
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

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
import { MoreHorizontal, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { type Customer } from '../data/customers'
import { format } from 'date-fns'

interface CustomersTableProps {
  data: Customer[]
}

const getStatusBadge = (status: Customer['status']) => {
  const variants: Record<Customer['status'], string> = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    pending: 'text-yellow-600 bg-yellow-100',
    suspended: 'text-red-600 bg-red-100',
  }

  return (
    <Badge className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getVerificationBadge = (status: Customer['verificationStatus']) => {
  const variants: Record<Customer['verificationStatus'], string> = {
    verified: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    unverified: 'text-red-600 bg-red-100',
  }

  return (
    <Badge variant='outline' className={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function CustomersTable({ data }: CustomersTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Country</TableHead>
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
              <TableCell>{getStatusBadge(customer.status)}</TableCell>
              <TableCell>{getVerificationBadge(customer.verificationStatus)}</TableCell>
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

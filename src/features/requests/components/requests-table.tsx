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
import { MoreHorizontal, Eye, UserPlus, CheckCircle, XCircle, Shield, Languages } from 'lucide-react'
import { type ServiceRequest } from '../data/requests'
import { format } from 'date-fns'

interface RequestsTableProps {
  data: ServiceRequest[]
}

const getStatusBadge = (status: ServiceRequest['status']) => {
  const variants: Record<ServiceRequest['status'], string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    assigned: 'text-purple-600 bg-purple-100',
    in_progress: 'text-blue-600 bg-blue-100',
    completed: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100',
  }

  const labels: Record<ServiceRequest['status'], string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return (
    <Badge className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

const getPriorityBadge = (priority: ServiceRequest['priority']) => {
  const variants: Record<ServiceRequest['priority'], string> = {
    low: 'text-green-600 border-green-600',
    medium: 'text-yellow-600 border-yellow-600',
    high: 'text-orange-600 border-orange-600',
    urgent: 'text-red-600 border-red-600',
  }

  return (
    <Badge variant='outline' className={variants[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

export function RequestsTable({ data }: RequestsTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((request) => (
            <TableRow key={request.id}>
              <TableCell className='font-medium'>{request.requestId}</TableCell>
              <TableCell>
                <Badge variant='outline' className='flex items-center gap-1 w-fit'>
                  {request.type === 'inspection' ? (
                    <Shield className='h-3 w-3' />
                  ) : (
                    <Languages className='h-3 w-3' />
                  )}
                  {request.type === 'inspection' ? 'Inspection' : 'Translation'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className='max-w-[200px]'>
                  <p className='font-medium truncate'>{request.title}</p>
                  {request.vehicleInfo && (
                    <p className='text-sm text-muted-foreground'>
                      {request.vehicleInfo.year} {request.vehicleInfo.make}
                    </p>
                  )}
                  {request.sourceLanguage && (
                    <p className='text-sm text-muted-foreground'>
                      {request.sourceLanguage} to {request.targetLanguage}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>{request.customerName}</p>
                  <p className='text-sm text-muted-foreground'>{request.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>{getPriorityBadge(request.priority)}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                {request.assignedTo || (
                  <span className='text-muted-foreground'>Unassigned</span>
                )}
              </TableCell>
              <TableCell>{format(request.createdAt, 'MMM dd, yyyy')}</TableCell>
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
                    {!request.assignedTo && (
                      <DropdownMenuItem>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Assign
                      </DropdownMenuItem>
                    )}
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                      <DropdownMenuItem>
                        <CheckCircle className='mr-2 h-4 w-4' />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                    {request.status !== 'cancelled' && request.status !== 'completed' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive'>
                          <XCircle className='mr-2 h-4 w-4' />
                          Cancel Request
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

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
import { MdMoreHoriz, MdVisibility, MdEdit, MdDelete, MdGavel, MdBuild } from 'react-icons/md'
import { type Vehicle } from '../data/vehicles'

interface VehiclesTableProps {
  data: Vehicle[]
}

const getStatusBadge = (status: Vehicle['status']) => {
  const variants: Record<Vehicle['status'], string> = {
    available: 'text-green-600 bg-green-100',
    reserved: 'text-yellow-600 bg-yellow-100',
    sold: 'text-purple-600 bg-purple-100',
  }

  const labels: Record<Vehicle['status'], string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
  }

  return (
    <Badge className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

const getGradeBadge = (grade: string) => {
  return (
    <Badge variant='outline' className='text-blue-600 border-blue-600'>
      {grade || 'N/A'}
    </Badge>
  )
}

export function VehiclesTable({ data }: VehiclesTableProps) {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stock #</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 20).map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className='font-medium'>{vehicle.stockNumber}</TableCell>
              <TableCell>
                <div>
                  <p className='font-medium'>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {vehicle.exteriorColor} • {vehicle.transmission}
                  </p>
                </div>
              </TableCell>
              <TableCell>{getGradeBadge(vehicle.grade)}</TableCell>
              <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
              <TableCell className='font-medium'>¥{vehicle.price.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
              <TableCell>{vehicle.location}</TableCell>
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdEdit className='mr-2 h-4 w-4' />
                      Edit Vehicle
                    </DropdownMenuItem>
                    {vehicle.status === 'available' && (
                      <DropdownMenuItem>
                        <MdGavel className='mr-2 h-4 w-4' />
                        Create Auction
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <MdBuild className='mr-2 h-4 w-4' />
                      Mark for Maintenance
                    </DropdownMenuItem>
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

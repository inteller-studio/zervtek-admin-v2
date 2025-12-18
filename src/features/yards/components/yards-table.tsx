'use client'

import { format } from 'date-fns'
import { MoreHorizontal, Pencil, Trash2, MapPin, Phone, User } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { type Yard } from '../types'

interface YardsTableProps {
  yards: Yard[]
  onEdit: (yard: Yard) => void
  onDelete: (yard: Yard) => void
}

export function YardsTable({ yards, onEdit, onDelete }: YardsTableProps) {
  const getCapacityPercentage = (yard: Yard) => {
    return Math.round((yard.currentVehicles / yard.capacity) * 100)
  }

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Yard</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className='w-12'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {yards.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='h-32 text-center'>
                <div className='text-muted-foreground'>
                  <MapPin className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p>No yards found</p>
                  <p className='text-sm'>Add a new yard to get started</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            yards.map((yard) => {
              const capacityPercentage = getCapacityPercentage(yard)
              return (
                <TableRow key={yard.id}>
                  {/* Yard Name */}
                  <TableCell>
                    <div className='font-medium'>{yard.name}</div>
                    {yard.notes && (
                      <p className='text-xs text-muted-foreground line-clamp-1 max-w-[200px]'>
                        {yard.notes}
                      </p>
                    )}
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className='flex items-start gap-1.5'>
                      <MapPin className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
                      <div className='text-sm'>
                        <p>{yard.city}, {yard.prefecture}</p>
                        <p className='text-xs text-muted-foreground'>{yard.address}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='space-y-1 cursor-default'>
                            <div className='flex items-center gap-1.5 text-sm'>
                              <User className='h-3.5 w-3.5 text-muted-foreground' />
                              {yard.contactPerson}
                            </div>
                            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                              <Phone className='h-3 w-3' />
                              {yard.contactPhone}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className='text-sm'>
                            <p className='font-medium'>{yard.contactPerson}</p>
                            <p>{yard.contactPhone}</p>
                            {yard.contactEmail && <p>{yard.contactEmail}</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Capacity */}
                  <TableCell>
                    <div className='w-32 space-y-1'>
                      <div className='flex items-center justify-between text-sm'>
                        <span>{yard.currentVehicles} / {yard.capacity}</span>
                        <span className='text-xs text-muted-foreground'>
                          {capacityPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={capacityPercentage}
                        className={cn('h-1.5', getCapacityColor(capacityPercentage))}
                      />
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={yard.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        yard.status === 'active' && 'bg-emerald-500 hover:bg-emerald-600'
                      )}
                    >
                      {yard.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  {/* Updated */}
                  <TableCell className='text-sm text-muted-foreground'>
                    {format(new Date(yard.updatedAt), 'MMM d, yyyy')}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onEdit(yard)}>
                          <Pencil className='h-4 w-4 mr-2' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(yard)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

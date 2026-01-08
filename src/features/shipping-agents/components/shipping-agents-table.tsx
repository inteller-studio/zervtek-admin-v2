'use client'

import { format } from 'date-fns'
import { MdMoreHoriz, MdEdit, MdDelete, MdLocationOn, MdPhone, MdPerson, MdLanguage } from 'react-icons/md'
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
import { type ShippingAgent } from '../types'

interface ShippingAgentsTableProps {
  agents: ShippingAgent[]
  onEdit: (agent: ShippingAgent) => void
  onDelete: (agent: ShippingAgent) => void
}

export function ShippingAgentsTable({ agents, onEdit, onDelete }: ShippingAgentsTableProps) {
  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className='w-12'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-32 text-center'>
                <div className='text-muted-foreground'>
                  <MdLocationOn className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p>No shipping agents found</p>
                  <p className='text-sm'>Add a new agent to get started</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            agents.map((agent) => (
              <TableRow key={agent.id}>
                {/* Agent Name */}
                <TableCell>
                  <div className='font-medium'>{agent.name}</div>
                  {agent.website && (
                    <a
                      href={agent.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-xs text-primary hover:underline flex items-center gap-1'
                    >
                      <MdLanguage className='h-3 w-3' />
                      Website
                    </a>
                  )}
                  {agent.notes && !agent.website && (
                    <p className='text-xs text-muted-foreground line-clamp-1 max-w-[200px]'>
                      {agent.notes}
                    </p>
                  )}
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className='flex items-start gap-1.5'>
                    <MdLocationOn className='h-4 w-4 text-muted-foreground shrink-0 mt-0.5' />
                    <div className='text-sm'>
                      <p>{agent.city}, {agent.country}</p>
                      <p className='text-xs text-muted-foreground'>{agent.address}</p>
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
                            <MdPerson className='h-3.5 w-3.5 text-muted-foreground' />
                            {agent.contactPerson}
                          </div>
                          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                            <MdPhone className='h-3 w-3' />
                            {agent.contactPhone}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='text-sm'>
                          <p className='font-medium'>{agent.contactPerson}</p>
                          <p>{agent.contactPhone}</p>
                          {agent.contactEmail && <p>{agent.contactEmail}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={agent.status === 'active' ? 'default' : 'secondary'}
                    className={cn(
                      agent.status === 'active' && 'bg-emerald-500 hover:bg-emerald-600'
                    )}
                  >
                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                {/* Updated */}
                <TableCell className='text-sm text-muted-foreground'>
                  {format(new Date(agent.updatedAt), 'MMM d, yyyy')}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MdMoreHoriz className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => onEdit(agent)}>
                        <MdEdit className='h-4 w-4 mr-2' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(agent)}
                        className='text-destructive focus:text-destructive'
                      >
                        <MdDelete className='h-4 w-4 mr-2' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

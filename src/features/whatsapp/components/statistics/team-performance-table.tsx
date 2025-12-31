'use client'

import { MdSwapVert } from 'react-icons/md'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { StaffPerformance } from '../../types'
import { useState } from 'react'

type SortKey = 'name' | 'messagesSent' | 'avgResponseTime' | 'activeChats' | 'resolutionRate'
type SortDir = 'asc' | 'desc'

interface TeamPerformanceTableProps {
  data: StaffPerformance[]
  className?: string
}

export function TeamPerformanceTable({ data, className }: TeamPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('messagesSent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let aVal: string | number
    let bVal: string | number

    switch (sortKey) {
      case 'name':
        aVal = `${a.staff.firstName} ${a.staff.lastName}`
        bVal = `${b.staff.firstName} ${b.staff.lastName}`
        break
      case 'messagesSent':
        aVal = a.messagesSent
        bVal = b.messagesSent
        break
      case 'avgResponseTime':
        aVal = a.avgResponseTime
        bVal = b.avgResponseTime
        break
      case 'activeChats':
        aVal = a.activeChats
        bVal = b.activeChats
        break
      case 'resolutionRate':
        aVal = a.resolutionRate
        bVal = b.resolutionRate
        break
      default:
        return 0
    }

    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
    }
    return sortDir === 'asc' ? aVal - (bVal as number) : (bVal as number) - aVal
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const SortableHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <Button
      variant='ghost'
      size='sm'
      className='-ml-3 h-8 gap-1'
      onClick={() => handleSort(sortKeyName)}
    >
      {label}
      <MdSwapVert className='h-4 w-4' />
    </Button>
  )

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader label='Team Member' sortKeyName='name' />
            </TableHead>
            <TableHead className='text-right'>
              <SortableHeader label='Messages' sortKeyName='messagesSent' />
            </TableHead>
            <TableHead className='text-right'>
              <SortableHeader label='Avg Response' sortKeyName='avgResponseTime' />
            </TableHead>
            <TableHead className='text-right'>
              <SortableHeader label='Active' sortKeyName='activeChats' />
            </TableHead>
            <TableHead className='text-right'>
              <SortableHeader label='Resolution' sortKeyName='resolutionRate' />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => {
            const { staff } = item
            const initials = `${staff.firstName[0]}${staff.lastName[0]}`

            return (
              <TableRow key={staff.id} className='transition-colors hover:bg-muted/50'>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <div className='relative'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={staff.avatarUrl} />
                        <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
                      </Avatar>
                      {staff.isOnline && (
                        <span className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500' />
                      )}
                    </div>
                    <div>
                      <p className='font-medium'>
                        {staff.firstName} {staff.lastName}
                      </p>
                      <p className='text-xs text-muted-foreground capitalize'>
                        {staff.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-right font-medium'>
                  {item.messagesSent.toLocaleString()}
                </TableCell>
                <TableCell className='text-right'>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      item.avgResponseTime < 10
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : item.avgResponseTime < 30
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {formatResponseTime(item.avgResponseTime)}
                  </span>
                </TableCell>
                <TableCell className='text-right'>{item.activeChats}</TableCell>
                <TableCell className='text-right'>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      item.resolutionRate >= 80
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : item.resolutionRate >= 60
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {item.resolutionRate}%
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

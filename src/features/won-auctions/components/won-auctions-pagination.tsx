'use client'

import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ITEMS_PER_PAGE_OPTIONS } from '../types'

interface WonAuctionsPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (count: number) => void
}

export function WonAuctionsPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: WonAuctionsPaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className='flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row'>
      <div className='flex flex-wrap items-center gap-4'>
        <p className='text-sm text-muted-foreground'>
          Showing <span className='font-medium'>{startItem}</span> to{' '}
          <span className='font-medium'>{endItem}</span> of{' '}
          <span className='font-medium'>{totalItems}</span> vehicles
        </p>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(v) => onItemsPerPageChange(Number(v))}
          >
            <SelectTrigger className='w-20'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <MdFirstPage className='h-4 w-4' />
          <span className='sr-only'>First page</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <MdChevronLeft className='h-4 w-4' />
          <span className='sr-only'>Previous page</span>
        </Button>
        <span className='px-4 text-sm'>
          Page <span className='font-medium'>{currentPage}</span> of{' '}
          <span className='font-medium'>{totalPages || 1}</span>
        </span>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <MdChevronRight className='h-4 w-4' />
          <span className='sr-only'>Next page</span>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='h-8 w-8'
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <MdLastPage className='h-4 w-4' />
          <span className='sr-only'>Last page</span>
        </Button>
      </div>
    </div>
  )
}

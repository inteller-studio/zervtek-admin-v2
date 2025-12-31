'use client'

import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ITEMS_PER_PAGE_OPTIONS } from '../types'

interface BidsPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (count: number) => void
}

export function BidsPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: BidsPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
      {/* Results Info */}
      <p className='text-sm text-muted-foreground'>
        Showing {startItem} to {endItem} of {totalItems} bids
      </p>

      {/* Items Per Page */}
      <div className='flex items-center gap-2'>
        <Label className='text-sm'>Items per page:</Label>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
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

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <MdFirstPage className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdChevronLeft className='h-4 w-4' />
          </Button>

          <span className='px-3 text-sm'>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <MdLastPage className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  )
}

'use client'

import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { Button } from '@/components/ui/button'

interface ServicesPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function ServicesPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ServicesPaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className='flex items-center justify-between'>
      <p className='text-sm text-muted-foreground'>
        Showing {startItem} to {endItem} of {totalItems}
      </p>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <MdChevronLeft className='h-4 w-4' />
        </Button>
        <span className='text-sm text-muted-foreground px-2'>
          {currentPage} / {totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          <MdChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

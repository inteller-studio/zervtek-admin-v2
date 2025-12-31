'use client'

import { MdWarning } from 'react-icons/md'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { type Yard } from '../../types'

interface DeleteYardDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  yard: Yard | null
  isLoading?: boolean
}

export function DeleteYardDialog({
  open,
  onClose,
  onConfirm,
  yard,
  isLoading = false,
}: DeleteYardDialogProps) {
  if (!yard) return null

  const hasVehicles = yard.currentVehicles > 0

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <MdWarning className='h-5 w-5 text-destructive' />
            Delete Yard
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-3'>
              <p>
                Are you sure you want to delete <strong>{yard.name}</strong>? This action cannot be
                undone.
              </p>

              {hasVehicles && (
                <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
                  <strong>Warning:</strong> This yard currently has {yard.currentVehicles} vehicle
                  {yard.currentVehicles > 1 ? 's' : ''} stored. You should relocate them before
                  deleting this yard.
                </div>
              )}

              <div className='rounded-md bg-muted p-3 text-sm'>
                <p className='font-medium'>{yard.name}</p>
                <p className='text-muted-foreground'>
                  {yard.address}, {yard.city}
                </p>
                <p className='text-muted-foreground'>
                  Capacity: {yard.capacity} • Current: {yard.currentVehicles}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isLoading ? 'Deleting...' : 'Delete Yard'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

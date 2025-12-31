'use client'

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
import type { Bid } from '../../data/bids'

interface DeclineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: Bid | null
  onConfirm: () => void
}

export function DeclineDialog({
  open,
  onOpenChange,
  bid,
  onConfirm,
}: DeclineDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Decline Bid</AlertDialogTitle>
          <AlertDialogDescription>
            {bid && (
              <>
                Are you sure you want to decline this bid of ¥{bid.amount.toLocaleString()} for{' '}
                {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}? This action cannot be
                undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive hover:bg-destructive/90'
            onClick={onConfirm}
          >
            Decline
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

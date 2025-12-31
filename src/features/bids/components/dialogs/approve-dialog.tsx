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

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: Bid | null
  onConfirm: () => void
}

export function ApproveDialog({
  open,
  onOpenChange,
  bid,
  onConfirm,
}: ApproveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Bid</AlertDialogTitle>
          <AlertDialogDescription>
            {bid && (
              <>
                Are you sure you want to approve this bid of ¥{bid.amount.toLocaleString()} for{' '}
                {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-emerald-600 hover:bg-emerald-700'
            onClick={onConfirm}
          >
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

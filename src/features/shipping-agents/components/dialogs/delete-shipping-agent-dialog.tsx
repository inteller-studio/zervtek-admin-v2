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
import { type ShippingAgent } from '../../types'

interface DeleteShippingAgentDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  agent: ShippingAgent | null
  isLoading?: boolean
}

export function DeleteShippingAgentDialog({
  open,
  onClose,
  onConfirm,
  agent,
  isLoading = false,
}: DeleteShippingAgentDialogProps) {
  if (!agent) return null

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <MdWarning className='h-5 w-5 text-destructive' />
            Delete Shipping Agent
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-3'>
              <p>
                Are you sure you want to delete <strong>{agent.name}</strong>? This action cannot be
                undone.
              </p>

              <div className='rounded-md bg-muted p-3 text-sm'>
                <p className='font-medium'>{agent.name}</p>
                <p className='text-muted-foreground'>
                  {agent.address}, {agent.city}
                </p>
                <p className='text-muted-foreground'>
                  Contact: {agent.contactPerson}
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
            {isLoading ? 'Deleting...' : 'Delete Agent'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

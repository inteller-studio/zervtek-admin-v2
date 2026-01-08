'use client'

import { MdNotInterested } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import type { Bid } from '../../data/bids'

interface UnsoldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: Bid | null
  unsoldPrice: string
  negoStartPrice: string
  onUnsoldPriceChange: (value: string) => void
  onNegoStartPriceChange: (value: string) => void
  onConfirm: () => void
}

export function UnsoldDialog({
  open,
  onOpenChange,
  bid,
  unsoldPrice,
  negoStartPrice,
  onUnsoldPriceChange,
  onNegoStartPriceChange,
  onConfirm,
}: UnsoldDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdNotInterested className='h-5 w-5 text-orange-500' />
            Mark as Unsold
          </DialogTitle>
          <DialogDescription>
            {bid && (
              <>
                Enter the final unsold price for <span className='font-medium'>{bid.bidNumber}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {bid && (
            <div className='rounded-lg border bg-muted/30 p-3'>
              <p className='font-medium'>{bid.auctionTitle}</p>
              <p className='text-sm text-muted-foreground'>
                {bid.auctionHouse} • Lot #{bid.lotNumber}
              </p>
              <p className='mt-2 text-sm'>
                Original Bid: <span className='font-semibold'>¥{bid.amount.toLocaleString()}</span>
              </p>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='unsoldPrice'>Unsold Price (¥)</Label>
            <NumericInput
              id='unsoldPrice'
              placeholder='Enter final price'
              value={unsoldPrice ? parseInt(unsoldPrice) : 0}
              onChange={(v) => onUnsoldPriceChange(v.toString())}
            />
            <p className='text-xs text-muted-foreground'>
              The price at which the vehicle remained unsold (reserve not met)
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='negoStartPrice'>Starting Negotiating Price (¥)</Label>
            <NumericInput
              id='negoStartPrice'
              placeholder='Enter starting nego price'
              value={negoStartPrice ? parseInt(negoStartPrice) : 0}
              onChange={(v) => onNegoStartPriceChange(v.toString())}
            />
            <p className='text-xs text-muted-foreground'>
              The price at which post-auction negotiation can begin
            </p>
          </div>
        </div>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className='bg-orange-600 hover:bg-orange-700'>
            Confirm Unsold
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

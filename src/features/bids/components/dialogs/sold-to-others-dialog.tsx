'use client'

import { MdGroup } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Bid } from '../../data/bids'

interface SoldToOthersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: Bid | null
  soldPrice: string
  onSoldPriceChange: (value: string) => void
  onConfirm: () => void
}

export function SoldToOthersDialog({
  open,
  onOpenChange,
  bid,
  soldPrice,
  onSoldPriceChange,
  onConfirm,
}: SoldToOthersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdGroup className='h-5 w-5 text-red-500' />
            Sold to Others
          </DialogTitle>
          <DialogDescription>
            {bid && (
              <>
                Enter the sold price for <span className='font-medium'>{bid.bidNumber}</span>
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
                Our Bid: <span className='font-semibold'>¥{bid.amount.toLocaleString()}</span>
              </p>
            </div>
          )}
          <div className='space-y-2'>
            <Label htmlFor='soldToOthersPrice'>Sold Price (¥)</Label>
            <Input
              id='soldToOthersPrice'
              type='number'
              placeholder='Enter the price it sold for'
              value={soldPrice}
              onChange={(e) => onSoldPriceChange(e.target.value)}
            />
            <p className='text-xs text-muted-foreground'>
              The price at which the vehicle was sold to another bidder
            </p>
          </div>
        </div>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant='destructive'>
            Confirm Sold to Others
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

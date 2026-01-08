'use client'

import { MdEmojiEvents } from 'react-icons/md'
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
import type { BidActionType } from '../../types'

interface WonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bid: Bid | null
  wonType: BidActionType
  wonPrice: string
  onWonPriceChange: (value: string) => void
  onConfirm: () => void
}

const TYPE_LABELS: Record<BidActionType, string> = {
  bid_accepted: 'Bid Accepted',
  contract: 'Contract',
  contract_nego: 'Contract by Nego',
}

export function WonDialog({
  open,
  onOpenChange,
  bid,
  wonType,
  wonPrice,
  onWonPriceChange,
  onConfirm,
}: WonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MdEmojiEvents className='h-5 w-5 text-green-500' />
            {TYPE_LABELS[wonType]}
          </DialogTitle>
          <DialogDescription>
            {bid && (
              <>
                Enter the final winning price for <span className='font-medium'>{bid.bidNumber}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {bid && (
            <div className='rounded-lg border bg-green-50 p-3 dark:bg-green-950'>
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
            <Label htmlFor='wonPrice'>Winning Price (¥)</Label>
            <NumericInput
              id='wonPrice'
              placeholder='Enter the winning price'
              value={wonPrice ? parseInt(wonPrice) : 0}
              onChange={(v) => onWonPriceChange(v.toString())}
            />
            <p className='text-xs text-muted-foreground'>
              {wonType === 'contract_nego'
                ? 'The final negotiated price we got the vehicle for'
                : 'The price at which we won the vehicle'}
            </p>
          </div>
        </div>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className='bg-green-600 hover:bg-green-700'>
            Confirm Won
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

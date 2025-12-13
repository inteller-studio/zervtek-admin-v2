'use client'

import { useState } from 'react'
import { Download, Send, Printer, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { type WonAuction } from '../../data/won-auctions'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: WonAuction | null
}

export function InvoiceDialog({
  open,
  onOpenChange,
  auction,
}: InvoiceDialogProps) {
  const [includeShipping, setIncludeShipping] = useState(true)
  const [includeCustoms, setIncludeCustoms] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  if (!auction) return null

  const invoiceNumber = `INV-${auction.auctionId.replace('AUC-', '')}`
  const invoiceDate = format(new Date(), 'MMM dd, yyyy')
  const dueDate = format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')

  const subtotal = auction.winningBid
  const shippingCost = includeShipping ? auction.shippingCost : 0
  const customsFee = includeCustoms ? auction.customsFee : 0
  const total = subtotal + shippingCost + customsFee
  const balanceDue = total - auction.paidAmount

  const handleGenerate = async (action: 'download' | 'email' | 'print') => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const messages = {
      download: { title: 'Invoice downloaded', desc: `${invoiceNumber}.pdf saved` },
      email: { title: 'Invoice sent', desc: `Sent to ${auction.winnerEmail}` },
      print: { title: 'Print dialog opened', desc: 'Prepare your printer' },
    }

    toast.success(messages[action].title, { description: messages[action].desc })
    setIsGenerating(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Invoice
          </DialogTitle>
          <DialogDescription>
            {invoiceNumber} • {auction.auctionId}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Customer & Dates */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-xs font-medium text-muted-foreground'>Bill To</p>
              <p className='font-medium'>{auction.winnerName}</p>
              <p className='text-sm text-muted-foreground'>{auction.winnerEmail}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs font-medium text-muted-foreground'>Invoice Date</p>
              <p className='font-medium'>{invoiceDate}</p>
              <p className='mt-2 text-xs font-medium text-muted-foreground'>Due Date</p>
              <p className='font-medium'>{dueDate}</p>
            </div>
          </div>

          <Separator />

          {/* Vehicle Info */}
          <div>
            <p className='text-xs font-medium text-muted-foreground'>Vehicle</p>
            <p className='font-medium'>
              {auction.vehicleInfo.year} {auction.vehicleInfo.make} {auction.vehicleInfo.model}
            </p>
            <p className='font-mono text-xs text-muted-foreground'>
              VIN: {auction.vehicleInfo.vin}
            </p>
          </div>

          <Separator />

          {/* Line Items */}
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm'>Vehicle Price</span>
              <span className='font-medium'>¥{auction.winningBid.toLocaleString()}</span>
            </div>

            {includeShipping && (
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Shipping ({auction.destinationPort || 'TBD'})</span>
                <span>¥{auction.shippingCost.toLocaleString()}</span>
              </div>
            )}

            {includeCustoms && (
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Customs & Duties</span>
                <span>¥{auction.customsFee.toLocaleString()}</span>
              </div>
            )}

            <Separator />

            <div className='flex justify-between font-medium'>
              <span>Total</span>
              <span>¥{total.toLocaleString()}</span>
            </div>

            {auction.paidAmount > 0 && (
              <div className='flex justify-between text-sm text-green-600'>
                <span>Amount Paid</span>
                <span>-¥{auction.paidAmount.toLocaleString()}</span>
              </div>
            )}

            <div className='flex justify-between text-lg font-bold'>
              <span>Balance Due</span>
              <span className={balanceDue <= 0 ? 'text-green-600' : 'text-orange-600'}>
                ¥{Math.max(0, balanceDue).toLocaleString()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <Switch
                id='inc-shipping'
                checked={includeShipping}
                onCheckedChange={setIncludeShipping}
              />
              <Label htmlFor='inc-shipping' className='cursor-pointer text-sm'>
                Include Shipping
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                id='inc-customs'
                checked={includeCustoms}
                onCheckedChange={setIncludeCustoms}
              />
              <Label htmlFor='inc-customs' className='cursor-pointer text-sm'>
                Include Customs
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => handleGenerate('print')}
            disabled={isGenerating}
          >
            <Printer className='mr-2 h-4 w-4' />
            Print
          </Button>
          <Button
            variant='outline'
            onClick={() => handleGenerate('email')}
            disabled={isGenerating}
          >
            <Send className='mr-2 h-4 w-4' />
            Email
          </Button>
          <Button onClick={() => handleGenerate('download')} disabled={isGenerating}>
            <Download className='mr-2 h-4 w-4' />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

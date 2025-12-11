'use client'

import { useState } from 'react'
import { Ship } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { type WonAuction, type ShipmentTracking } from '../../data/won-auctions'

interface ShippingUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auction: WonAuction | null
  onSubmit: (auctionId: string, shipment: ShipmentTracking) => void
}

export function ShippingUpdateDialog({
  open,
  onOpenChange,
  auction,
  onSubmit,
}: ShippingUpdateDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [shippingStatus, setShippingStatus] = useState<ShipmentTracking['status']>('preparing')
  const [shippingLocation, setShippingLocation] = useState('')

  const handleSubmit = () => {
    if (!auction || !trackingNumber || !carrier) return

    const newShipment: ShipmentTracking = {
      carrier,
      trackingNumber,
      status: shippingStatus,
      currentLocation: shippingLocation || 'Warehouse',
      lastUpdate: new Date(),
      events: [
        {
          date: new Date(),
          location: shippingLocation || 'Warehouse',
          status: shippingStatus.replace(/_/g, ' '),
          description: 'Shipment information updated',
        },
      ],
    }

    onSubmit(auction.id, newShipment)

    toast.success('Shipping information updated', {
      description: `Tracking: ${trackingNumber}`,
    })

    // Reset form
    setTrackingNumber('')
    setCarrier('')
    setShippingStatus('preparing')
    setShippingLocation('')
    onOpenChange(false)
  }

  if (!auction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Shipping Information</DialogTitle>
          <DialogDescription>
            Add shipping details for {auction.vehicleInfo.year} {auction.vehicleInfo.make}{' '}
            {auction.vehicleInfo.model}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Shipping Carrier</Label>
            <Input
              placeholder='e.g., Maersk Line, MSC, CMA CGM'
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Tracking Number</Label>
            <Input
              placeholder='Enter tracking number'
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Shipping Status</Label>
            <Select
              value={shippingStatus}
              onValueChange={(v) => setShippingStatus(v as ShipmentTracking['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='preparing'>Preparing</SelectItem>
                <SelectItem value='in_transit'>In Transit</SelectItem>
                <SelectItem value='at_port'>At Port</SelectItem>
                <SelectItem value='customs_clearance'>Customs Clearance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Current Location</Label>
            <Input
              placeholder='e.g., Yokohama Port, Japan'
              value={shippingLocation}
              onChange={(e) => setShippingLocation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!trackingNumber || !carrier}>
            <Ship className='mr-2 h-4 w-4' />
            Update Shipping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

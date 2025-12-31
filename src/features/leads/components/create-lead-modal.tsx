'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MdPersonAdd, MdDirectionsCar, MdEmail, MdPhone, MdPerson, MdDescription } from 'react-icons/md'
import { toast } from 'sonner'
import { type LeadType, leadTypeLabels } from '../data/leads'

interface CreateLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const vehicles = [
  '2023 Toyota Supra GR',
  '2022 Nissan GT-R Nismo',
  '2021 Honda NSX',
  '2023 Lexus LC 500',
  '2022 Mazda RX-7 FD',
  '2023 Subaru WRX STI',
  '2022 Mitsubishi Lancer Evo X',
  '2021 Toyota GR Yaris',
  '2023 Honda Civic Type R',
  '2022 Nissan Fairlady Z',
]

const salesStaff = [
  { id: 'staff-001', name: 'Mike Johnson' },
  { id: 'staff-002', name: 'Sarah Williams' },
  { id: 'staff-003', name: 'Tom Anderson' },
  { id: 'staff-004', name: 'Jessica Chen' },
]

export function CreateLeadModal({ open, onOpenChange, onSuccess }: CreateLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    vehicleName: '',
    type: '' as LeadType | '',
    subject: '',
    message: '',
    assignedTo: '',
  })

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.customerEmail || !formData.vehicleName || !formData.type) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Lead created successfully')
    setIsSubmitting(false)
    resetForm()
    onOpenChange(false)
    onSuccess?.()
  }

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      vehicleName: '',
      type: '',
      subject: '',
      message: '',
      assignedTo: '',
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MdPersonAdd className="h-5 w-5 text-primary" />
            Create New Lead
          </DialogTitle>
          <DialogDescription>
            Add a new customer lead to the system. Fill in the customer and vehicle details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MdPerson className="h-4 w-4" />
              Customer Information
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                    className="pl-10"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    className="pl-10"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Lead Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MdDirectionsCar className="h-4 w-4" />
              Vehicle & Lead Details
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehicleName">
                  Vehicle <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.vehicleName}
                  onValueChange={(value) => setFormData({ ...formData, vehicleName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle} value={vehicle}>
                        {vehicle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Lead Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as LeadType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(leadTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of the inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Message Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MdDescription className="h-4 w-4" />
              Message
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Customer Message</Label>
              <Textarea
                id="message"
                placeholder="Enter the customer's inquiry or message..."
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Leave unassigned or select staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {salesStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Optionally assign this lead to a sales staff member
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

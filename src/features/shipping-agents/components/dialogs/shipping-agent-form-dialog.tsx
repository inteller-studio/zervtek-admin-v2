'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ShippingAgent, type ShippingAgentFormData, SHIPPING_AGENT_STATUSES } from '../../types'

const shippingAgentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof shippingAgentFormSchema>

interface ShippingAgentFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ShippingAgentFormData) => void
  agent?: ShippingAgent | null
  isLoading?: boolean
}

export function ShippingAgentFormDialog({
  open,
  onClose,
  onSubmit,
  agent,
  isLoading = false,
}: ShippingAgentFormDialogProps) {
  const isEditing = !!agent

  const form = useForm<FormValues>({
    resolver: zodResolver(shippingAgentFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: 'Japan',
      postalCode: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      status: 'active',
      notes: '',
    },
  })

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        address: agent.address,
        city: agent.city,
        country: agent.country,
        postalCode: agent.postalCode || '',
        contactPerson: agent.contactPerson,
        contactEmail: agent.contactEmail || '',
        contactPhone: agent.contactPhone,
        website: agent.website || '',
        status: agent.status,
        notes: agent.notes || '',
      })
    } else {
      form.reset({
        name: '',
        address: '',
        city: '',
        country: 'Japan',
        postalCode: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        status: 'active',
        notes: '',
      })
    }
  }, [agent, form])

  const handleSubmit = (data: FormValues) => {
    onSubmit(data as ShippingAgentFormData)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Shipping Agent' : 'Add New Shipping Agent'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the shipping agent information below.'
              : 'Enter the details for the new shipping agent.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            {/* Basic Info */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Japan Auto Logistics' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='2-4-1 Kaigan, Minato-ku' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='Tokyo' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='Japan' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder='105-0022' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='https://example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info */}
            <div className='grid grid-cols-2 gap-4 pt-2'>
              <FormField
                control={form.control}
                name='contactPerson'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder='Tanaka Hiroshi' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contactPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+81-3-1234-5678' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contactEmail'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Contact Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='contact@shipping.jp' type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div className='grid grid-cols-2 gap-4 pt-2'>
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHIPPING_AGENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Additional information about the shipping agent...'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-4'>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update Agent' : 'Add Agent'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

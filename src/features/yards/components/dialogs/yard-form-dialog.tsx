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
import { NumericInput } from '@/components/ui/numeric-input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Yard, type YardFormData, YARD_STATUSES, JAPANESE_PREFECTURES } from '../../types'

const yardFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  prefecture: z.string().min(1, 'Prefecture is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().min(1, 'Contact phone is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof yardFormSchema>

interface YardFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: YardFormData) => void
  yard?: Yard | null
  isLoading?: boolean
}

export function YardFormDialog({
  open,
  onClose,
  onSubmit,
  yard,
  isLoading = false,
}: YardFormDialogProps) {
  const isEditing = !!yard

  const form = useForm<FormValues>({
    resolver: zodResolver(yardFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      prefecture: '',
      country: 'Japan',
      postalCode: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      capacity: 50,
      status: 'active',
      notes: '',
    },
  })

  useEffect(() => {
    if (yard) {
      form.reset({
        name: yard.name,
        address: yard.address,
        city: yard.city,
        prefecture: yard.prefecture,
        country: yard.country,
        postalCode: yard.postalCode || '',
        contactPerson: yard.contactPerson,
        contactEmail: yard.contactEmail || '',
        contactPhone: yard.contactPhone,
        capacity: yard.capacity,
        status: yard.status,
        notes: yard.notes || '',
      })
    } else {
      form.reset({
        name: '',
        address: '',
        city: '',
        prefecture: '',
        country: 'Japan',
        postalCode: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        capacity: 50,
        status: 'active',
        notes: '',
      })
    }
  }, [yard, form])

  const handleSubmit = (data: FormValues) => {
    onSubmit(data as YardFormData)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Yard' : 'Add New Yard'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the yard information below.'
              : 'Enter the details for the new yard.'}
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
                    <FormLabel>Yard Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Tokyo Central Yard' {...field} />
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
                      <Input placeholder='1-2-3 Minato-ku' {...field} />
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
                name='prefecture'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefecture</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select prefecture' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JAPANESE_PREFECTURES.map((pref) => (
                          <SelectItem key={pref} value={pref}>
                            {pref}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input placeholder='105-0001' {...field} />
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
                      <Input placeholder='contact@yard.jp' type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Capacity & Status */}
            <div className='grid grid-cols-2 gap-4 pt-2'>
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (Vehicles)</FormLabel>
                    <FormControl>
                      <NumericInput
                        min={1}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {YARD_STATUSES.map((status) => (
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
                      placeholder='Additional information about the yard...'
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
                {isLoading ? 'Saving...' : isEditing ? 'Update Yard' : 'Add Yard'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

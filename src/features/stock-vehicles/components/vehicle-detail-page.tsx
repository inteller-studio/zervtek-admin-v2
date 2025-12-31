'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MdError, MdSync } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { vehicles } from '../data/vehicles'
import { VehiclePageHeader } from './vehicle-page/vehicle-page-header'
import { VehiclePageSidebar } from './vehicle-page/vehicle-page-sidebar'
import { VehiclePageContent } from './vehicle-page/vehicle-page-content'
import { VehiclePageFooter } from './vehicle-page/vehicle-page-footer'
import { toast } from 'sonner'

interface VehicleDetailPageProps {
  vehicleId: string
}

export function VehicleDetailPage({ vehicleId }: VehicleDetailPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Find vehicle from mock data
  const vehicle = vehicles.find((v) => v.id === vehicleId)

  // Handle create invoice
  const handleCreateInvoice = () => {
    if (!vehicle) return
    toast.success('Opening invoice creation...')
    // In real implementation, would open invoice drawer or navigate to invoice page
    router.push(`/invoices/create?vehicleId=${vehicle.id}`)
  }

  // Handle edit
  const handleEdit = () => {
    if (!vehicle) return
    toast.info('Edit mode coming soon')
    // In real implementation, would navigate to edit page or open edit drawer
  }

  // Handle delete
  const handleDelete = () => {
    if (!vehicle) return
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      toast.success(`${vehicle.year} ${vehicle.make} ${vehicle.model} deleted successfully`)
      router.push('/stock')
      setIsLoading(false)
    }, 1000)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='flex flex-col items-center gap-4'
        >
          <MdSync className='h-8 w-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>Processing...</p>
        </motion.div>
      </div>
    )
  }

  // Vehicle not found
  if (!vehicle) {
    return (
      <motion.div
        className='flex h-full items-center justify-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='flex flex-col items-center gap-4 text-center'>
          <motion.div
            className='rounded-full bg-destructive/10 p-4'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
          >
            <MdError className='h-8 w-8 text-destructive' />
          </motion.div>
          <div>
            <h2 className='text-lg font-semibold'>Vehicle Not Found</h2>
            <p className='text-sm text-muted-foreground mt-1'>
              The vehicle with ID &ldquo;{vehicleId}&rdquo; could not be found.
            </p>
          </div>
          <Button variant='outline' onClick={() => router.push('/stock')}>
            Back to Stock
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={vehicle.id}
        className='flex h-full flex-col overflow-hidden bg-background'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Main Layout */}
        <div className='flex flex-1 overflow-hidden'>
          {/* Sidebar */}
          <VehiclePageSidebar vehicle={vehicle} />

          {/* Main Content Area */}
          <div className='flex flex-1 flex-col overflow-hidden'>
            {/* Header */}
            <VehiclePageHeader vehicle={vehicle} />

            {/* Content */}
            <VehiclePageContent vehicle={vehicle} />

            {/* Footer */}
            <VehiclePageFooter
              vehicle={vehicle}
              onCreateInvoice={handleCreateInvoice}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

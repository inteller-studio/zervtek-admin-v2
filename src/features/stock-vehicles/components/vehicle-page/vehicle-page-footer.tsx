'use client'

import { motion } from 'framer-motion'
import {
  MdDescription,
  MdEdit,
  MdDelete,
  MdWarehouse,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { type Vehicle } from '../../data/vehicles'

interface VehiclePageFooterProps {
  vehicle: Vehicle
  onCreateInvoice: () => void
  onEdit: () => void
  onDelete: () => void
}

export function VehiclePageFooter({
  vehicle,
  onCreateInvoice,
  onEdit,
  onDelete,
}: VehiclePageFooterProps) {
  return (
    <motion.div
      className='flex items-center justify-between border-t px-6 py-4 shrink-0 relative overflow-hidden'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Glass morphism background */}
      <div className='absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-muted/30 backdrop-blur-sm' />

      {/* Subtle animated gradient overlay */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] opacity-50'
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content */}
      <div className='relative flex items-center justify-between w-full'>
        {/* Left Side - Action Buttons */}
        <div className='flex items-center gap-3'>
          {vehicle.status === 'available' && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size='default'
                className='group relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white'
                onClick={onCreateInvoice}
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <MdDescription className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                Create Invoice
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size='default'
              variant='outline'
              className='group relative overflow-hidden'
              onClick={onEdit}
            >
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent'
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <MdEdit className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
              Edit
            </Button>
          </motion.div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size='default'
                  variant='outline'
                  className='group relative overflow-hidden text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10'
                >
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-transparent via-destructive/5 to-transparent'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <MdDelete className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
                  Delete
                </Button>
              </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {vehicle.year} {vehicle.make}{' '}
                  {vehicle.model} ({vehicle.stockNumber})? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive hover:bg-destructive/90'
                  onClick={onDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Right Side - Vehicle Info */}
        <motion.div
          className={cn(
            'px-4 py-2 rounded-xl text-sm relative overflow-hidden',
            'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20'
          )}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className='relative flex items-center gap-2'>
            <MdWarehouse className='h-4 w-4 text-primary' />
            <span className='font-medium'>{vehicle.stockNumber}</span>
            <span className='text-muted-foreground'>•</span>
            <span className='text-muted-foreground'>{vehicle.location}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

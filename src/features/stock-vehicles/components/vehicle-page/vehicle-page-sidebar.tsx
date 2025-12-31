'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MdLocalOffer,
  MdInventory2,
  MdWarehouse,
  MdEmojiEvents,
  MdCalendarToday,
  MdSpeed,
  MdBuild,
  MdLocalGasStation,
  MdBrush,
  MdDirectionsCar,
  MdTrendingUp,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type Vehicle } from '../../data/vehicles'

// Animated number counter hook
function useAnimatedNumber(value: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + (value - startValue) * easeProgress)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return displayValue
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

interface VehiclePageSidebarProps {
  vehicle: Vehicle
}

export function VehiclePageSidebar({ vehicle }: VehiclePageSidebarProps) {
  const animatedPrice = useAnimatedNumber(vehicle.price)
  const animatedMileage = useAnimatedNumber(vehicle.mileage)

  return (
    <motion.div
      className='w-[300px] shrink-0 border-r bg-gradient-to-b from-muted/10 via-muted/20 to-muted/30 overflow-y-auto'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='p-4 space-y-4'>
        {/* Stock Details Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-primary/10'>
                <MdLocalOffer className='h-4 w-4 text-primary' />
              </div>
              <h3 className='text-sm font-semibold'>Stock Details</h3>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdLocalOffer className='h-3.5 w-3.5' />
                Stock ID
              </span>
              <span className='text-sm font-mono font-medium'>{vehicle.id}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdInventory2 className='h-3.5 w-3.5' />
                Stock #
              </span>
              <span className='text-sm font-mono font-medium'>{vehicle.stockNumber}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdWarehouse className='h-3.5 w-3.5' />
                Location
              </span>
              <span className='text-sm font-medium'>{vehicle.location}</span>
            </div>

            {vehicle.score && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                  <MdEmojiEvents className='h-3.5 w-3.5' />
                  Score
                </span>
                <span className='text-sm font-medium text-amber-600'>{vehicle.score}</span>
              </div>
            )}

            {vehicle.dateAvailable && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                  <MdCalendarToday className='h-3.5 w-3.5' />
                  Available
                </span>
                <span className='text-sm font-medium'>{vehicle.dateAvailable}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Specifications Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-blue-500/10'>
                <MdDirectionsCar className='h-4 w-4 text-blue-500' />
              </div>
              <h3 className='text-sm font-semibold'>Specifications</h3>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdSpeed className='h-3.5 w-3.5' />
                Mileage
              </span>
              <span className='text-sm font-medium'>
                {vehicle.mileageDisplay || `${animatedMileage.toLocaleString()} km`}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdBuild className='h-3.5 w-3.5' />
                Transmission
              </span>
              <span className='text-sm font-medium'>{vehicle.transmission}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdLocalGasStation className='h-3.5 w-3.5' />
                Fuel Type
              </span>
              <span className='text-sm font-medium'>{vehicle.fuelType}</span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
                <MdBrush className='h-3.5 w-3.5' />
                Color
              </span>
              <span className='text-sm font-medium'>{vehicle.exteriorColor}</span>
            </div>

            {vehicle.displacement && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Engine</span>
                <span className='text-sm font-medium'>{vehicle.displacement}</span>
              </div>
            )}

            {vehicle.modelCode && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Model Code</span>
                <span className='text-sm font-mono font-medium'>{vehicle.modelCode}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Condition Card */}
        {(vehicle.exteriorGrade || vehicle.interiorGrade) && (
          <motion.div
            className='rounded-xl border border-border/50 bg-card overflow-hidden'
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='px-4 py-3 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent border-b border-border/50'>
              <div className='flex items-center gap-2'>
                <div className='p-1.5 rounded-lg bg-emerald-500/10'>
                  <MdEmojiEvents className='h-4 w-4 text-emerald-500' />
                </div>
                <h3 className='text-sm font-semibold'>Condition Grades</h3>
              </div>
            </div>

            <div className='p-4'>
              <div className='grid grid-cols-2 gap-3'>
                {vehicle.exteriorGrade && (
                  <motion.div
                    className='text-center p-4 rounded-xl bg-muted/50'
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className='text-xs text-muted-foreground mb-1'>Exterior</p>
                    <p className='text-2xl font-bold'>{vehicle.exteriorGrade}</p>
                  </motion.div>
                )}
                {vehicle.interiorGrade && (
                  <motion.div
                    className='text-center p-4 rounded-xl bg-muted/50'
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className='text-xs text-muted-foreground mb-1'>Interior</p>
                    <p className='text-2xl font-bold'>{vehicle.interiorGrade}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Price Card */}
        <motion.div
          className='rounded-xl border border-border/50 bg-card overflow-hidden'
          variants={cardVariants}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className='px-4 py-3 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-b border-border/50'>
            <div className='flex items-center gap-2'>
              <div className='p-1.5 rounded-lg bg-amber-500/10'>
                <MdTrendingUp className='h-4 w-4 text-amber-500' />
              </div>
              <h3 className='text-sm font-semibold'>Pricing</h3>
            </div>
          </div>

          <div className='p-4'>
            <div className='text-center'>
              <p className='text-xs text-muted-foreground mb-1'>Stock Price</p>
              <motion.p
                className='text-3xl font-bold tracking-tight'
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                ¥{animatedPrice.toLocaleString()}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Source Card */}
        {vehicle.source === 'vendor' && vehicle.vendorName && (
          <motion.div
            className='rounded-xl border border-border/50 bg-card overflow-hidden'
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='px-4 py-3 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent border-b border-border/50'>
              <h3 className='text-sm font-semibold'>Vendor</h3>
            </div>
            <div className='p-4 space-y-2'>
              <p className='text-sm font-medium'>{vehicle.vendorName}</p>
              {vehicle.vendorContact && (
                <p className='text-sm text-muted-foreground'>{vehicle.vendorContact}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* History Card */}
        {vehicle.history && (
          <motion.div
            className='rounded-xl border border-border/50 bg-card overflow-hidden'
            variants={cardVariants}
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className='px-4 py-3 bg-gradient-to-r from-slate-500/5 via-transparent to-transparent border-b border-border/50'>
              <h3 className='text-sm font-semibold'>History</h3>
            </div>
            <div className='p-4'>
              <p className='text-sm text-muted-foreground'>{vehicle.history}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

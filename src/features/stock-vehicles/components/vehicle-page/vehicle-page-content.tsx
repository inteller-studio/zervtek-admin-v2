'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDirectionsCar,
  MdDescription,
  MdImage,
  MdContentCopy,
  MdCheck,
  MdSpeed,
  MdBuild,
  MdLocalGasStation,
  MdBrush,
  MdCalendarToday,
  MdTag,
  MdWarehouse,
  MdEmojiEvents,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type Vehicle } from '../../data/vehicles'
import { toast } from 'sonner'

interface VehiclePageContentProps {
  vehicle: Vehicle
}

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
}

const tabs: TabItem[] = [
  { id: 'specifications', label: 'Specifications', icon: <MdDirectionsCar className='h-4 w-4' /> },
  { id: 'gallery', label: 'Gallery', icon: <MdImage className='h-4 w-4' /> },
  { id: 'documents', label: 'Documents', icon: <MdDescription className='h-4 w-4' /> },
]

// Info Row Component with copy functionality
function InfoRow({
  label,
  value,
  icon,
  mono,
  copyable,
}: {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
  mono?: boolean
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className='flex justify-between items-center py-3 border-b border-border/50 last:border-0'>
      <span className='text-sm text-muted-foreground flex items-center gap-2'>
        {icon}
        {label}
      </span>
      <div className='flex items-center gap-2'>
        <span className={cn('text-sm font-medium text-right', mono && 'font-mono text-xs')}>
          {value}
        </span>
        {copyable && typeof value === 'string' && (
          <motion.button
            onClick={handleCopy}
            className='p-1.5 rounded-lg hover:bg-muted transition-colors'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode='wait'>
              {copied ? (
                <motion.div
                  key='check'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <MdCheck className='h-3.5 w-3.5 text-emerald-500' />
                </motion.div>
              ) : (
                <motion.div key='copy' initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <MdContentCopy className='h-3.5 w-3.5 text-muted-foreground' />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </div>
  )
}

export function VehiclePageContent({ vehicle }: VehiclePageContentProps) {
  const [activeTab, setActiveTab] = useState('specifications')
  const [previousTab, setPreviousTab] = useState('specifications')

  const handleTabChange = (tabId: string) => {
    setPreviousTab(activeTab)
    setActiveTab(tabId)
  }

  const getTabDirection = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab)
    const prevIndex = tabs.findIndex((t) => t.id === previousTab)
    return currentIndex > prevIndex ? 1 : -1
  }

  const direction = getTabDirection()

  return (
    <motion.div
      className='flex-1 overflow-hidden flex flex-col'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Tab Navigation */}
      <div className='border-b px-6 py-4'>
        <div className='flex gap-1 p-1 bg-muted/50 rounded-lg w-fit'>
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        <AnimatePresence mode='wait' custom={direction}>
          {activeTab === 'specifications' && (
            <motion.div
              key='specifications'
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
              className='space-y-6'
            >
              {/* Vehicle Details Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdDirectionsCar className='h-5 w-5 text-primary' />
                  Vehicle Details
                </h3>
                <div className='space-y-0'>
                  <InfoRow label='Make' value={vehicle.make} icon={<MdDirectionsCar className='h-4 w-4' />} />
                  <InfoRow label='Model' value={vehicle.model} />
                  <InfoRow label='Year' value={vehicle.year.toString()} icon={<MdCalendarToday className='h-4 w-4' />} />
                  {vehicle.grade && <InfoRow label='Grade' value={vehicle.grade} icon={<MdEmojiEvents className='h-4 w-4' />} />}
                  {vehicle.modelCode && <InfoRow label='Model Code' value={vehicle.modelCode} mono copyable />}
                </div>
              </motion.div>

              {/* Specifications Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdBuild className='h-5 w-5 text-primary' />
                  Specifications
                </h3>
                <div className='grid grid-cols-2 gap-6'>
                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdSpeed className='h-6 w-6 text-blue-500 mx-auto mb-2' />
                    <p className='text-xl font-bold'>
                      {vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}
                    </p>
                    <p className='text-xs text-muted-foreground'>Mileage</p>
                  </motion.div>

                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdBuild className='h-6 w-6 text-emerald-500 mx-auto mb-2' />
                    <p className='text-xl font-bold'>{vehicle.transmission}</p>
                    <p className='text-xs text-muted-foreground'>Transmission</p>
                  </motion.div>

                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdLocalGasStation className='h-6 w-6 text-amber-500 mx-auto mb-2' />
                    <p className='text-xl font-bold'>{vehicle.fuelType}</p>
                    <p className='text-xs text-muted-foreground'>Fuel Type</p>
                  </motion.div>

                  <motion.div
                    className='p-4 rounded-xl bg-muted/50 text-center'
                    whileHover={{ scale: 1.02 }}
                  >
                    <MdBrush className='h-6 w-6 text-purple-500 mx-auto mb-2' />
                    <p className='text-xl font-bold'>{vehicle.exteriorColor}</p>
                    <p className='text-xs text-muted-foreground'>Color</p>
                  </motion.div>

                  {vehicle.displacement && (
                    <motion.div
                      className='p-4 rounded-xl bg-muted/50 text-center col-span-2'
                      whileHover={{ scale: 1.02 }}
                    >
                      <p className='text-xl font-bold'>{vehicle.displacement}</p>
                      <p className='text-xs text-muted-foreground'>Engine Displacement</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Stock Information Card */}
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <MdWarehouse className='h-5 w-5 text-primary' />
                  Stock Information
                </h3>
                <div className='space-y-0'>
                  <InfoRow label='Stock Number' value={vehicle.stockNumber} icon={<MdTag className='h-4 w-4' />} mono copyable />
                  <InfoRow label='Stock ID' value={vehicle.id} mono copyable />
                  <InfoRow label='Location' value={vehicle.location} icon={<MdWarehouse className='h-4 w-4' />} />
                  {vehicle.auctionHouse && <InfoRow label='Auction House' value={vehicle.auctionHouse} />}
                  {vehicle.dateAvailable && <InfoRow label='Date Available' value={vehicle.dateAvailable} icon={<MdCalendarToday className='h-4 w-4' />} />}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key='gallery'
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                  <MdImage className='h-5 w-5 text-primary' />
                  Vehicle Gallery
                </h3>

                {vehicle.images && vehicle.images.length > 0 ? (
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {vehicle.images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        className='relative aspect-video rounded-xl overflow-hidden cursor-pointer group'
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <img
                          src={img}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${idx + 1}`}
                          className='h-full w-full object-cover'
                        />
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors' />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                    <MdImage className='h-12 w-12 mb-4 opacity-30' />
                    <p className='text-sm'>No images available</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key='documents'
              custom={direction}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className='rounded-xl border bg-card p-6'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                  <MdDescription className='h-5 w-5 text-primary' />
                  Documents
                </h3>

                <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                  <MdDescription className='h-12 w-12 mb-4 opacity-30' />
                  <p className='text-sm'>No documents available</p>
                  <p className='text-xs mt-1'>Export documents and inspection reports will appear here</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

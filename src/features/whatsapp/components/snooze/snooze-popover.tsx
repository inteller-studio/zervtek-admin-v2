'use client'

import { useState } from 'react'
import { addDays, addHours, nextSaturday, nextMonday, setHours, setMinutes, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { MdCalendarToday, MdAccessTime, MdBedtime, MdWbSunny, MdWbTwilight } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { SnoozePreset } from '../../types'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface SnoozeOption {
  preset: SnoozePreset
  label: string
  sublabel: string
  icon: React.ReactNode
  getDate: () => Date
}

function getSnoozeOptions(): SnoozeOption[] {
  const now = new Date()
  const currentHour = now.getHours()

  // Later today: 5 PM if before 2 PM, otherwise +4 hours
  const laterToday = currentHour < 14
    ? setMinutes(setHours(now, 17), 0)
    : addHours(now, 4)

  // Tomorrow 9 AM
  const tomorrow = setMinutes(setHours(addDays(now, 1), 9), 0)

  // This weekend: Saturday 10 AM
  const weekend = setMinutes(setHours(nextSaturday(now), 10), 0)

  // Next week: Monday 9 AM
  const nextWeek = setMinutes(setHours(nextMonday(now), 9), 0)

  return [
    {
      preset: 'later_today',
      label: 'Later today',
      sublabel: format(laterToday, 'h:mm a'),
      icon: <MdAccessTime className='h-4 w-4' />,
      getDate: () => laterToday,
    },
    {
      preset: 'tomorrow',
      label: 'Tomorrow',
      sublabel: format(tomorrow, 'EEE h:mm a'),
      icon: <MdWbTwilight className='h-4 w-4' />,
      getDate: () => tomorrow,
    },
    {
      preset: 'weekend',
      label: 'This weekend',
      sublabel: format(weekend, 'EEE h:mm a'),
      icon: <MdWbSunny className='h-4 w-4' />,
      getDate: () => weekend,
    },
    {
      preset: 'next_week',
      label: 'Next week',
      sublabel: format(nextWeek, 'EEE, MMM d'),
      icon: <MdBedtime className='h-4 w-4' />,
      getDate: () => nextWeek,
    },
  ]
}

interface SnoozePopoverProps {
  children: React.ReactNode
  onSnooze: (preset: SnoozePreset, returnAt: Date) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SnoozePopover({
  children,
  onSnooze,
  open,
  onOpenChange,
}: SnoozePopoverProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customDate, setCustomDate] = useState<Date>()
  const [customTime, setCustomTime] = useState('09:00')

  const options = getSnoozeOptions()

  const handlePresetSelect = (option: SnoozeOption) => {
    onSnooze(option.preset, option.getDate())
    onOpenChange?.(false)
  }

  const handleCustomSnooze = () => {
    if (!customDate) return

    const [hours, minutes] = customTime.split(':').map(Number)
    const returnAt = setMinutes(setHours(customDate, hours), minutes)
    onSnooze('custom', returnAt)
    onOpenChange?.(false)
    setShowCustom(false)
    setCustomDate(undefined)
    setCustomTime('09:00')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowCustom(false)
      setCustomDate(undefined)
      setCustomTime('09:00')
    }
    onOpenChange?.(newOpen)
  }

  // Generate time options (every 30 minutes)
  const timeOptions = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      const value = `${hour}:${minute}`
      const label = format(new Date().setHours(h, m), 'h:mm a')
      timeOptions.push({ value, label })
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='w-72 overflow-hidden p-0' align='start'>
        <AnimatePresence mode="wait" initial={false}>
          {showCustom ? (
            <motion.div
              key="custom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className='p-3'
            >
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-sm font-medium'>Pick date & time</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowCustom(false)}
                >
                  Back
                </Button>
              </div>
              <CalendarComponent
                mode='single'
                selected={customDate}
                onSelect={setCustomDate}
                disabled={(date) => date < new Date()}
                className='rounded-md border'
              />
              <div className='mt-3 flex items-center gap-2'>
                <MdAccessTime className='h-4 w-4 text-muted-foreground' />
                <Select value={customTime} onValueChange={setCustomTime}>
                  <SelectTrigger className='flex-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='max-h-60'>
                    {timeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className='mt-3 w-full'
                disabled={!customDate}
                onClick={handleCustomSnooze}
              >
                {customDate
                  ? `Snooze until ${format(customDate, 'MMM d')} at ${format(new Date().setHours(parseInt(customTime.split(':')[0]), parseInt(customTime.split(':')[1])), 'h:mm a')}`
                  : 'Select a date'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="preset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className='py-1'
            >
              <div className='px-3 py-2'>
                <span className='text-xs font-medium text-muted-foreground'>
                  Snooze until
                </span>
              </div>
              {options.map((option, index) => (
                <motion.button
                  key={option.preset}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  onClick={() => handlePresetSelect(option)}
                  className='flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none'
                >
                  <span className='text-muted-foreground'>{option.icon}</span>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>{option.label}</div>
                    <div className='text-xs text-muted-foreground'>{option.sublabel}</div>
                  </div>
                </motion.button>
              ))}
              <Separator className='my-1' />
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: options.length * 0.04 }}
                onClick={() => setShowCustom(true)}
                className='flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors duration-150'
              >
                <MdCalendarToday className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Pick date & time</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}

// Convenience wrapper that uses the UI store for state
interface ChatSnoozePopoverProps {
  chatId: string
  onSnooze: (chatId: string, preset: SnoozePreset, returnAt: Date) => void
  children: React.ReactNode
}

export function ChatSnoozePopover({
  chatId,
  onSnooze,
  children,
}: ChatSnoozePopoverProps) {
  const { snoozePopoverChatId, setSnoozePopoverChatId } = useWhatsAppUIStore()

  const isOpen = snoozePopoverChatId === chatId

  return (
    <SnoozePopover
      open={isOpen}
      onOpenChange={(open) => setSnoozePopoverChatId(open ? chatId : null)}
      onSnooze={(preset, returnAt) => onSnooze(chatId, preset, returnAt)}
    >
      {children}
    </SnoozePopover>
  )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MdClose } from 'react-icons/md'
import { cn } from '@/lib/utils'
import type { ConversationLabel } from '../../types'
import { getLabelColorConfig } from '../../data/label-colors'

interface LabelBadgeProps {
  label: ConversationLabel
  size?: 'sm' | 'default'
  onRemove?: () => void
  className?: string
}

export function LabelBadge({ label, size = 'default', onRemove, className }: LabelBadgeProps) {
  const colorConfig = getLabelColorConfig(label.color)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-opacity duration-200',
        colorConfig.bgClass,
        colorConfig.textClass,
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colorConfig.dotClass)} />
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className='ml-0.5 rounded-full p-0.5 transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        >
          <MdClose className='h-2.5 w-2.5' />
        </button>
      )}
    </span>
  )
}

interface LabelBadgeListProps {
  labels: ConversationLabel[]
  maxVisible?: number
  size?: 'sm' | 'default'
  onRemove?: (labelId: string) => void
  className?: string
}

export function LabelBadgeList({
  labels,
  maxVisible = 2,
  size = 'sm',
  onRemove,
  className,
}: LabelBadgeListProps) {
  if (!labels.length) return null

  const visibleLabels = labels.slice(0, maxVisible)
  const hiddenCount = labels.length - maxVisible

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <AnimatePresence mode='popLayout'>
        {visibleLabels.map((label) => (
          <motion.div
            key={label.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <LabelBadge
              label={label}
              size={size}
              onRemove={onRemove ? () => onRemove(label.id) : undefined}
            />
          </motion.div>
        ))}
        {hiddenCount > 0 && (
          <motion.span
            key='hidden-count'
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-[10px] text-muted-foreground'
          >
            +{hiddenCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

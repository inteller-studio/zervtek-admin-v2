'use client'

import { motion } from 'framer-motion'
import { MdHourglassEmpty, MdVerifiedUser, MdTrendingUp, MdCheckCircle } from 'react-icons/md'
import { type IconType } from 'react-icons'
import { cn } from '@/lib/utils'
import { TVTaskCard, type TVDisplayRequest } from './tv-task-card'
import { TVEmptyState } from './tv-empty-state'

type ColumnStatus = 'pending' | 'assigned' | 'in_progress' | 'completed'

interface ColumnConfig {
  id: ColumnStatus
  title: string
  icon: IconType
  iconColor: string
}

// Minimal, unified column config - only icons differentiate
const columnConfigs: ColumnConfig[] = [
  {
    id: 'pending',
    title: 'Pending',
    icon: MdHourglassEmpty,
    iconColor: 'text-slate-500',
  },
  {
    id: 'assigned',
    title: 'Assigned',
    icon: MdVerifiedUser,
    iconColor: 'text-slate-500',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: MdTrendingUp,
    iconColor: 'text-slate-500',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: MdCheckCircle,
    iconColor: 'text-emerald-500', // Only completed gets color
  },
]

interface TVKanbanColumnProps {
  status: ColumnStatus
  requests: TVDisplayRequest[]
  index: number
}

const columnVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
}

export function TVKanbanColumn({ status, requests, index }: TVKanbanColumnProps) {
  const config = columnConfigs.find((c) => c.id === status)!
  const Icon = config.icon
  // Show fewer cards for TV - larger cards need more space
  const displayRequests = requests.slice(0, 6)

  return (
    <motion.div
      variants={columnVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className={cn(
        'flex flex-col rounded-2xl bg-white',
        'border border-slate-200/80',
        'min-h-[calc(100vh-220px)]'
      )}
      style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      {/* Clean column header - larger for TV */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-6 w-6', config.iconColor)} />
          <h2 className="text-lg font-semibold text-slate-700">
            {config.title}
          </h2>
        </div>

        {/* Minimal count badge - larger for TV */}
        <motion.div
          key={displayRequests.length}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-3 text-base font-semibold text-slate-600"
        >
          {displayRequests.length}
        </motion.div>
      </div>

      {/* Cards container - larger gap for TV */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
          {displayRequests.length > 0 ? (
            displayRequests.map((request, i) => (
              <TVTaskCard key={request.id} request={request} index={i} />
            ))
          ) : (
            <TVEmptyState status={status} />
          )}
        </div>

        {/* Subtle bottom fade for scroll indication */}
        {displayRequests.length > 4 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
    </motion.div>
  )
}

export { columnConfigs }

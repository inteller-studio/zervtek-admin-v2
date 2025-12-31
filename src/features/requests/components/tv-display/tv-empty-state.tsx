'use client'

import { motion } from 'framer-motion'
import { MdInbox } from 'react-icons/md'

type ColumnStatus = 'pending' | 'assigned' | 'in_progress' | 'completed'

interface TVEmptyStateProps {
  status: ColumnStatus
}

const emptyMessages: Record<ColumnStatus, string> = {
  pending: 'No pending requests',
  assigned: 'No assigned requests',
  in_progress: 'No active requests',
  completed: 'No completed requests',
}

export function TVEmptyState({ status }: TVEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="flex flex-1 flex-col items-center justify-center py-16"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <MdInbox className="h-8 w-8 text-slate-400" />
      </div>
      <p className="mt-4 text-base font-medium text-slate-400">
        {emptyMessages[status]}
      </p>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { TVKanbanColumn } from './tv-kanban-column'
import type { TVDisplayRequest } from './tv-task-card'

interface TVKanbanBoardProps {
  requests: TVDisplayRequest[]
}

const statuses = ['pending', 'assigned', 'in_progress', 'completed'] as const

export function TVKanbanBoard({ requests }: TVKanbanBoardProps) {
  const getColumnRequests = (status: (typeof statuses)[number]) => {
    return requests.filter((r) => r.status === status)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="grid grid-cols-4 gap-6"
    >
      {statuses.map((status, index) => (
        <TVKanbanColumn
          key={status}
          status={status}
          requests={getColumnRequests(status)}
          index={index}
        />
      ))}
    </motion.div>
  )
}

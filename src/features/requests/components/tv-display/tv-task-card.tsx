'use client'

import { motion } from 'framer-motion'
import { MdAccessTime } from 'react-icons/md'

export interface TVDisplayRequest {
  id: string
  type: 'inspection' | 'translation'
  title: string
  customerName: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedToName?: string
  waitTime: number
  createdAt: Date
}

interface TVTaskCardProps {
  request: TVDisplayRequest
  index: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
}

export function TVTaskCard({ request, index }: TVTaskCardProps) {
  const isUrgent = request.priority === 'urgent'
  const isPending = request.status === 'pending'

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
    >
      {/* Pulsing dot - urgent only */}
      {isUrgent && (
        <div className="absolute top-5 right-5">
          <span className="relative flex h-3 w-3">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-red-500"
              animate={{
                scale: [1, 1.8],
                opacity: [0.7, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-medium text-slate-900 leading-snug line-clamp-2 pr-6">
          {request.title}
        </h3>

        {/* Metadata */}
        <p className="mt-1.5 text-sm text-slate-400">
          <span className="font-mono">#{request.id.split('-').pop()}</span>
          <span className="mx-2">·</span>
          <span className="capitalize">{request.type}</span>
        </p>

        {/* Customer */}
        <p className="mt-4 text-base text-slate-600">{request.customerName}</p>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          {/* Left: Wait time or Assignee */}
          {isPending ? (
            <div className="flex items-center gap-2 text-slate-500">
              <MdAccessTime className="h-4 w-4" />
              <span className="text-base tabular-nums font-medium">
                {request.waitTime}m
              </span>
            </div>
          ) : request.assignedToName ? (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-white">
                {request.assignedToName.charAt(0)}
              </div>
              <span className="text-base text-slate-600">
                {request.assignedToName}
              </span>
            </div>
          ) : (
            <span className="text-base text-slate-400">Unassigned</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

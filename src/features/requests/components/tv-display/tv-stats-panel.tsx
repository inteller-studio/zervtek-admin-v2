'use client'

import { motion } from 'framer-motion'
import { MdTrendingUp, MdError, MdCheckCircle } from 'react-icons/md'
import { type IconType } from 'react-icons'
import { cn } from '@/lib/utils'

interface TVStatsPanelProps {
  totalActive: number
  urgentCount: number
  completedToday: number
}

interface StatItemProps {
  icon: IconType
  label: string
  value: number
  iconColor?: string
  valueColor?: string
}

function StatItem({
  icon: Icon,
  label,
  value,
  iconColor = 'text-slate-400',
  valueColor = 'text-slate-900',
}: StatItemProps) {
  return (
    <div className="flex items-center gap-4">
      <Icon className={cn('h-7 w-7', iconColor)} />
      <div>
        <motion.p
          key={value}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className={cn('text-4xl font-bold tabular-nums', valueColor)}
        >
          {value}
        </motion.p>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>
    </div>
  )
}

export function TVStatsPanel({
  totalActive,
  urgentCount,
  completedToday,
}: TVStatsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex items-center gap-10 rounded-2xl border border-slate-200/60 bg-white px-8 py-4"
      style={{
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <StatItem
        icon={MdTrendingUp}
        label="Active"
        value={totalActive}
        iconColor="text-blue-500"
      />

      <div className="h-12 w-px bg-slate-100" />

      <StatItem
        icon={MdError}
        label="Urgent"
        value={urgentCount}
        iconColor={urgentCount > 0 ? 'text-red-500' : 'text-slate-300'}
        valueColor={urgentCount > 0 ? 'text-red-600' : 'text-slate-400'}
      />

      <div className="h-12 w-px bg-slate-100" />

      <StatItem
        icon={MdCheckCircle}
        label="Done"
        value={completedToday}
        iconColor="text-emerald-500"
        valueColor="text-emerald-600"
      />
    </motion.div>
  )
}

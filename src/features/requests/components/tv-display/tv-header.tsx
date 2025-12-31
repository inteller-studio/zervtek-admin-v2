'use client'

import { motion } from 'framer-motion'
import { MdAccessTime, MdFullscreen, MdFullscreenExit } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { TVLiveIndicator } from './tv-live-indicator'
import { TVStatsPanel } from './tv-stats-panel'

interface TVHeaderProps {
  currentTime: Date
  isFullscreen: boolean
  totalActive: number
  urgentCount: number
  completedToday: number
  onToggleFullscreen: () => void
}

export function TVHeader({
  currentTime,
  isFullscreen,
  totalActive,
  urgentCount,
  completedToday,
  onToggleFullscreen,
}: TVHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-8 flex items-center justify-between"
    >
      {/* Left: Title and Live Indicator */}
      <div className="flex items-center gap-5">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Service Board
        </h1>
        <TVLiveIndicator />
      </div>

      {/* Center: Stats Panel */}
      <TVStatsPanel
        totalActive={totalActive}
        urgentCount={urgentCount}
        completedToday={completedToday}
      />

      {/* Right: Clock and Controls */}
      <div className="flex items-center gap-4">
        {/* Clock - larger for TV */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-5 py-3">
          <MdAccessTime className="h-5 w-5 text-slate-400" />
          <span className="font-mono text-2xl font-medium tabular-nums text-slate-700">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        {/* Fullscreen Toggle - larger for TV */}
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFullscreen}
          className="h-12 w-12 border-slate-200/60 bg-white hover:bg-slate-50"
        >
          {isFullscreen ? (
            <MdFullscreenExit className="h-5 w-5 text-slate-600" />
          ) : (
            <MdFullscreen className="h-5 w-5 text-slate-600" />
          )}
        </Button>
      </div>
    </motion.header>
  )
}

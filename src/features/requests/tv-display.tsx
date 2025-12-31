'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { requests } from './data/requests'
import { TVHeader } from './components/tv-display/tv-header'
import { TVKanbanBoard } from './components/tv-display/tv-kanban-board'
import type { TVDisplayRequest } from './components/tv-display/tv-task-card'

export function TVDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [, setRefreshKey] = useState(0)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-refresh data
  useEffect(() => {
    const refreshTimer = setInterval(() => setRefreshKey((k) => k + 1), 30000)
    return () => clearInterval(refreshTimer)
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Transform requests to display format
  const displayRequests: TVDisplayRequest[] = useMemo(() => {
    return requests
      .filter((r) => r.status !== 'cancelled')
      .map((r) => ({
        id: r.requestId,
        type: r.type,
        title: r.title,
        customerName: r.customerName,
        status: r.status as TVDisplayRequest['status'],
        priority: r.priority,
        assignedToName: r.assignedToName,
        waitTime: Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 60000),
        createdAt: r.createdAt,
      }))
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const activeRequests = displayRequests.filter((r) => r.status !== 'completed')
    return {
      totalActive: activeRequests.length,
      urgentCount: activeRequests.filter((r) => r.priority === 'urgent').length,
      completedToday: displayRequests.filter((r) => r.status === 'completed').length,
    }
  }, [displayRequests])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-auto p-10' : 'p-8'
      }`}
    >
      <div className="mx-auto max-w-[1920px]">
        <TVHeader
          currentTime={currentTime}
          isFullscreen={isFullscreen}
          totalActive={stats.totalActive}
          urgentCount={stats.urgentCount}
          completedToday={stats.completedToday}
          onToggleFullscreen={toggleFullscreen}
        />

        <TVKanbanBoard requests={displayRequests} />

        {/* Minimal footer - larger for TV */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-400"
        >
          <span>Auto-refresh every 30s</span>
          <span className="text-slate-300">•</span>
          <span>Updated {currentTime.toLocaleTimeString()}</span>
        </motion.footer>
      </div>
    </motion.div>
  )
}

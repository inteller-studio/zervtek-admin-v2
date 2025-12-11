'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Maximize,
  Minimize,
  Shield,
  Languages,
  Users,
  Timer,
  User,
  Activity,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  RotateCw,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { requests } from './data/requests'

interface DisplayRequest {
  id: string
  type: 'inspection' | 'translation'
  title: string
  customerName: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  createdAt: Date
  waitTime: number
}

type ViewMode = 'grid' | 'rotating'
type Category = 'pending' | 'in_progress'

export function TVDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [, setRefreshKey] = useState(0)
  const [fullscreenTheme, setFullscreenTheme] = useState<'light' | 'dark'>('light')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentCategory, setCurrentCategory] = useState<Category>('pending')
  const [isRotating, setIsRotating] = useState(true)
  const [rotationSpeed] = useState(8000) // 8 seconds per category

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const refreshTimer = setInterval(() => setRefreshKey((k) => k + 1), 30000)
    return () => clearInterval(refreshTimer)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreenTheme = useCallback(() => {
    setFullscreenTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'grid' ? 'rotating' : 'grid'))
    setCurrentCategory('pending')
  }, [])

  const displayRequests: DisplayRequest[] = requests
    .filter((r) => r.status !== 'cancelled' && r.status !== 'completed')
    .slice(0, 12)
    .map((r) => ({
      id: r.requestId,
      type: r.type,
      title: r.title,
      customerName: r.customerName,
      status: r.status as DisplayRequest['status'],
      priority: r.priority,
      assignedTo: r.assignedTo,
      createdAt: r.createdAt,
      waitTime: Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 60000),
    }))

  const pendingRequests = displayRequests.filter((r) => r.status === 'pending')
  const inProgressRequests = displayRequests.filter((r) => r.status === 'in_progress' || r.status === 'assigned')
  const urgentCount = displayRequests.filter((r) => r.priority === 'urgent').length

  const toggleCategory = useCallback(() => {
    setCurrentCategory((prev) => (prev === 'pending' ? 'in_progress' : 'pending'))
  }, [])

  // Auto-rotation effect for categories
  useEffect(() => {
    if (viewMode === 'rotating' && isRotating) {
      const rotationTimer = setInterval(() => {
        setCurrentCategory((prev) => (prev === 'pending' ? 'in_progress' : 'pending'))
      }, rotationSpeed)
      return () => clearInterval(rotationTimer)
    }
  }, [viewMode, isRotating, rotationSpeed])

  const currentCategoryRequests = currentCategory === 'pending' ? pendingRequests : inProgressRequests

  const RequestCard = ({ request, variant }: { request: DisplayRequest; variant: 'pending' | 'active' }) => {
    const isUrgent = request.priority === 'urgent'
    const isHigh = request.priority === 'high'

    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md',
          isUrgent && 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20',
          isHigh && !isUrgent && 'border-amber-200 dark:border-amber-900/50'
        )}
      >
        {/* Priority accent line */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-1',
            isUrgent && 'bg-red-500',
            isHigh && !isUrgent && 'bg-amber-500',
            !isUrgent && !isHigh && variant === 'pending' && 'bg-slate-300 dark:bg-slate-700',
            !isUrgent && !isHigh && variant === 'active' && 'bg-emerald-500'
          )}
        />

        <div className='flex items-center gap-4'>
          {/* Type Icon */}
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              request.type === 'inspection'
                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {request.type === 'inspection' ? (
              <Shield className='h-5 w-5' />
            ) : (
              <Languages className='h-5 w-5' />
            )}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500'>
                {request.id.split('-').pop()}
              </span>
              {isUrgent && (
                <span className='inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:bg-red-900/50 dark:text-red-400'>
                  <Circle className='h-1.5 w-1.5 fill-current' />
                  Urgent
                </span>
              )}
              {isHigh && !isUrgent && (
                <span className='inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'>
                  High
                </span>
              )}
            </div>
            <h3 className='mt-1 font-semibold leading-tight text-slate-900 line-clamp-1 dark:text-slate-100'>
              {request.title}
            </h3>
            <div className='mt-1.5 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400'>
              <span className='flex items-center gap-1.5'>
                <User className='h-3.5 w-3.5' />
                {request.customerName}
              </span>
              <span className='text-slate-300 dark:text-slate-600'>•</span>
              <span className='capitalize'>{request.type}</span>
            </div>
          </div>

          {/* Right side info */}
          <div className='shrink-0 text-right'>
            {variant === 'pending' && (
              <div className='flex flex-col items-end'>
                <div className='flex items-baseline gap-1'>
                  <span className='text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100'>
                    {request.waitTime}
                  </span>
                  <span className='text-sm font-medium text-slate-400'>min</span>
                </div>
                <span className='mt-0.5 flex items-center gap-1 text-xs text-slate-400'>
                  <Timer className='h-3 w-3' />
                  waiting
                </span>
              </div>
            )}
            {variant === 'active' && request.assignedTo && (
              <div className='flex flex-col items-end'>
                <span className='font-semibold text-slate-900 dark:text-slate-100'>
                  {request.assignedTo}
                </span>
                <span className='mt-0.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                  <Activity className='h-3 w-3' />
                  working
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const EmptyState = ({ type }: { type: 'pending' | 'active' }) => (
    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800'>
      {type === 'pending' ? (
        <>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
            <CheckCircle2 className='h-7 w-7 text-emerald-600 dark:text-emerald-400' />
          </div>
          <p className='mt-4 font-semibold text-slate-900 dark:text-slate-100'>All clear</p>
          <p className='mt-1 text-sm text-slate-500'>No pending requests</p>
        </>
      ) : (
        <>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
            <Users className='h-7 w-7 text-slate-400' />
          </div>
          <p className='mt-4 font-semibold text-slate-900 dark:text-slate-100'>No active work</p>
          <p className='mt-1 text-sm text-slate-500'>Assign requests to begin</p>
        </>
      )}
    </div>
  )

  const isDark = isFullscreen ? fullscreenTheme === 'dark' : false

  return (
    <div
      className={cn(
        isFullscreen && fullscreenTheme === 'dark' && 'dark'
      )}
    >
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          isDark ? 'bg-slate-950' : 'bg-slate-50 dark:bg-slate-950',
          isFullscreen && 'fixed inset-0 z-50 overflow-auto p-8'
        )}
      >
      {/* Header */}
      <header className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className={cn(
            'font-bold tracking-tight text-slate-900 dark:text-slate-100',
            isFullscreen ? 'text-4xl' : 'text-2xl'
          )}>
            Service Monitor
          </h1>
          <p className='mt-1 text-slate-500'>Real-time request tracking</p>
        </div>

        <div className='flex items-center gap-6'>
          {/* Stats */}
          <div className='hidden md:flex items-center gap-8'>
            <div className='text-center'>
              <p className='text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100'>
                {pendingRequests.length}
              </p>
              <p className='text-xs font-medium uppercase tracking-wider text-slate-400'>Pending</p>
            </div>
            <div className='h-10 w-px bg-slate-200 dark:bg-slate-800' />
            <div className='text-center'>
              <p className='text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
                {inProgressRequests.length}
              </p>
              <p className='text-xs font-medium uppercase tracking-wider text-slate-400'>Active</p>
            </div>
            {urgentCount > 0 && (
              <>
                <div className='h-10 w-px bg-slate-200 dark:bg-slate-800' />
                <div className='text-center'>
                  <p className='text-3xl font-bold tabular-nums text-red-600 dark:text-red-400'>
                    {urgentCount}
                  </p>
                  <p className='text-xs font-medium uppercase tracking-wider text-slate-400'>Urgent</p>
                </div>
              </>
            )}
          </div>

          {/* Time & Controls */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900'>
              <Clock className='h-4 w-4 text-slate-400' />
              <span className='font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100'>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className='flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950'>
              <span className='relative flex h-2 w-2'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
              </span>
              <span className='text-sm font-semibold text-emerald-700 dark:text-emerald-300'>Live</span>
            </div>

            {isFullscreen && (
              <Button
                variant='outline'
                size='icon'
                onClick={toggleFullscreenTheme}
                className='h-10 w-10 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
              >
                {fullscreenTheme === 'dark' ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
              </Button>
            )}

            <Button
              variant={viewMode === 'rotating' ? 'default' : 'outline'}
              size='icon'
              onClick={toggleViewMode}
              className={cn(
                'h-10 w-10',
                viewMode === 'rotating'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
              )}
              title={viewMode === 'rotating' ? 'Switch to Grid View' : 'Switch to Rotating View'}
            >
              <RotateCw className={cn('h-4 w-4', viewMode === 'rotating' && 'animate-spin')} style={{ animationDuration: '3s' }} />
            </Button>

            <Button
              variant='outline'
              size='icon'
              onClick={toggleFullscreen}
              className='h-10 w-10 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
            >
              {isFullscreen ? <Minimize className='h-4 w-4' /> : <Maximize className='h-4 w-4' />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className='grid gap-8 lg:grid-cols-2'>
          {/* Pending Column */}
          <section>
            <div className='mb-5 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800'>
                <Clock className='h-5 w-5 text-slate-600 dark:text-slate-400' />
              </div>
              <div className='flex-1'>
                <h2 className='font-semibold text-slate-900 dark:text-slate-100'>Pending Queue</h2>
                <p className='text-sm text-slate-500'>Awaiting assignment</p>
              </div>
              <div className='flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-200 px-2.5 font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                {pendingRequests.length}
              </div>
            </div>

            <div className='space-y-3'>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} variant='pending' />
                ))
              ) : (
                <EmptyState type='pending' />
              )}
            </div>
          </section>

          {/* In Progress Column */}
          <section>
            <div className='mb-5 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30'>
                <Activity className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div className='flex-1'>
                <h2 className='font-semibold text-slate-900 dark:text-slate-100'>In Progress</h2>
                <p className='text-sm text-slate-500'>Currently being handled</p>
              </div>
              <div className='flex h-8 min-w-8 items-center justify-center rounded-lg bg-emerald-100 px-2.5 font-semibold tabular-nums text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'>
                {inProgressRequests.length}
              </div>
            </div>

            <div className='space-y-3'>
              {inProgressRequests.length > 0 ? (
                inProgressRequests.map((request) => (
                  <RequestCard key={request.id} request={request} variant='active' />
                ))
              ) : (
                <EmptyState type='active' />
              )}
            </div>
          </section>
        </div>
      ) : (
        /* Rotating Category View */
        <div className='space-y-6'>
          {/* Category Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500',
                currentCategory === 'pending'
                  ? 'bg-slate-200 dark:bg-slate-800'
                  : 'bg-emerald-100 dark:bg-emerald-900/30'
              )}>
                {currentCategory === 'pending' ? (
                  <Clock className='h-7 w-7 text-slate-600 dark:text-slate-400' />
                ) : (
                  <Activity className='h-7 w-7 text-emerald-600 dark:text-emerald-400' />
                )}
              </div>
              <div>
                <h2 className='text-3xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-500'>
                  {currentCategory === 'pending' ? 'Pending Queue' : 'In Progress'}
                </h2>
                <p className='text-lg text-slate-500'>
                  {currentCategory === 'pending' ? 'Awaiting assignment' : 'Currently being handled'}
                </p>
              </div>
            </div>
            <div className={cn(
              'flex h-14 min-w-14 items-center justify-center rounded-2xl px-6 text-3xl font-bold tabular-nums transition-all duration-500',
              currentCategory === 'pending'
                ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            )}>
              {currentCategoryRequests.length}
            </div>
          </div>

          {/* Requests Grid */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {currentCategoryRequests.length > 0 ? (
              currentCategoryRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  variant={currentCategory === 'pending' ? 'pending' : 'active'}
                />
              ))
            ) : (
              <div className='col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800'>
                {currentCategory === 'pending' ? (
                  <>
                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
                      <CheckCircle2 className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <p className='mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100'>All clear</p>
                    <p className='mt-1 text-slate-500'>No pending requests</p>
                  </>
                ) : (
                  <>
                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
                      <Users className='h-8 w-8 text-slate-400' />
                    </div>
                    <p className='mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100'>No active work</p>
                    <p className='mt-1 text-slate-500'>Assign requests to begin</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className='flex items-center justify-center gap-6 pt-4'>
            {/* Category Selector */}
            <div className='flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900'>
              <button
                onClick={() => setCurrentCategory('pending')}
                className={cn(
                  'flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300',
                  currentCategory === 'pending'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <Clock className='h-4 w-4' />
                Pending
                <span className='ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700'>
                  {pendingRequests.length}
                </span>
              </button>
              <button
                onClick={() => setCurrentCategory('in_progress')}
                className={cn(
                  'flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300',
                  currentCategory === 'in_progress'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                <Activity className='h-4 w-4' />
                In Progress
                <span className={cn(
                  'ml-1 rounded-full px-2 py-0.5 text-xs',
                  currentCategory === 'in_progress'
                    ? 'bg-emerald-700'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                )}>
                  {inProgressRequests.length}
                </span>
              </button>
            </div>

            {/* Play/Pause */}
            <Button
              variant='outline'
              size='lg'
              onClick={() => setIsRotating(!isRotating)}
              className='h-12 rounded-full border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
            >
              {isRotating ? (
                <>
                  <Pause className='h-5 w-5 mr-2' />
                  Pause
                </>
              ) : (
                <>
                  <Play className='h-5 w-5 mr-2' />
                  Auto-Rotate
                </>
              )}
            </Button>
          </div>

          {/* Status indicator */}
          <p className='text-center text-sm text-slate-500'>
            {isRotating ? 'Auto-rotating between categories every 8 seconds' : 'Auto-rotation paused'}
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className='mt-10 flex items-center justify-center gap-2 text-xs text-slate-400'>
        <span>Auto-refresh every 30 seconds</span>
        <span>•</span>
        <span>Last updated {currentTime.toLocaleTimeString()}</span>
      </footer>
      </div>
    </div>
  )
}

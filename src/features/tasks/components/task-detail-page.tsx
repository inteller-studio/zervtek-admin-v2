'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { ConfigDrawer } from '@/components/config-drawer'

import { tasks as initialTasks } from '../data/tasks'
import { TaskPageHeader } from './task-page/task-page-header'
import { TaskPageContent } from './task-page/task-page-content'

interface TaskDetailPageProps {
  taskId: string
}

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const router = useRouter()

  // Data state
  const [tasks, setTasks] = useState(initialTasks)
  const task = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId])

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/tasks')
  }, [router])

  // Handle status change
  const handleStatusChange = useCallback((status: string) => {
    if (!task) return
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: status as typeof t.status, updatedAt: new Date() } : t
    ))
    toast.success(`Task status updated to ${status}`)
  }, [task])

  // Handle priority change
  const handlePriorityChange = useCallback((priority: string) => {
    if (!task) return
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, priority: priority as typeof t.priority, updatedAt: new Date() } : t
    ))
    toast.success(`Task priority updated to ${priority}`)
  }, [task])

  // Handle label change
  const handleLabelChange = useCallback((label: string) => {
    if (!task) return
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, label: label as typeof t.label, updatedAt: new Date() } : t
    ))
    toast.success(`Task label updated to ${label}`)
  }, [task])

  // Handle title update
  const handleTitleUpdate = useCallback((title: string) => {
    if (!task) return
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, title, updatedAt: new Date() } : t
    ))
    toast.success('Task title updated')
  }, [task])

  // Handle description update
  const handleDescriptionUpdate = useCallback((description: string) => {
    if (!task) return
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, description, updatedAt: new Date() } : t
    ))
    toast.success('Task description updated')
  }, [task])

  // Handle assignee update
  const handleAssigneeUpdate = useCallback((assignee: string) => {
    if (!task) return
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, assignee, updatedAt: new Date() } : t
    ))
    toast.success('Task assignee updated')
  }, [task])

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!task) return
    setTasks(prev => prev.filter(t => t.id !== task.id))
    toast.success('Task deleted')
    router.push('/tasks')
  }, [task, router])

  // If task not found
  if (!task) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ConfigDrawer />
          </div>
          <HeaderActions />
        </Header>
        <Main className='flex flex-1 items-center justify-center'>
          <div className='text-center'>
            <p className='text-muted-foreground'>Task not found</p>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-0 !p-0 overflow-hidden'>
        {/* Page Header */}
        <TaskPageHeader
          task={task}
          onBack={handleBack}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />

        {/* Main Content Area */}
        <div className='flex-1 overflow-hidden'>
          <TaskPageContent
            task={task}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onLabelChange={handleLabelChange}
            onTitleUpdate={handleTitleUpdate}
            onDescriptionUpdate={handleDescriptionUpdate}
            onAssigneeUpdate={handleAssigneeUpdate}
          />
        </div>
      </Main>
    </>
  )
}

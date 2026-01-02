'use client'

import { use } from 'react'
import { TaskDetailPage } from '@/features/tasks/components/task-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TaskPage({ params }: PageProps) {
  const { id } = use(params)
  return <TaskDetailPage taskId={id} />
}

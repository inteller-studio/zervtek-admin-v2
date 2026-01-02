'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  MdEdit,
  MdSave,
  MdClose,
  MdPerson,
  MdCalendarToday,
  MdFlag,
  MdLabel,
  MdCheckCircle,
  MdAccessTime,
  MdPlayCircle,
  MdCancel,
  MdList,
  MdDescription,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Status styles
const statusConfig = [
  { value: 'todo', label: 'Todo', icon: MdList, color: 'text-slate-600' },
  { value: 'in progress', label: 'In Progress', icon: MdPlayCircle, color: 'text-blue-600' },
  { value: 'done', label: 'Done', icon: MdCheckCircle, color: 'text-emerald-600' },
  { value: 'canceled', label: 'Canceled', icon: MdCancel, color: 'text-red-600' },
  { value: 'backlog', label: 'Backlog', icon: MdAccessTime, color: 'text-amber-600' },
]

const priorityConfig = [
  { value: 'high', label: 'High', color: 'text-red-600 bg-red-50' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 bg-amber-50' },
  { value: 'low', label: 'Low', color: 'text-slate-600 bg-slate-50' },
]

const labelConfig = [
  { value: 'bug', label: 'Bug', color: 'text-red-600 bg-red-50' },
  { value: 'feature', label: 'Feature', color: 'text-purple-600 bg-purple-50' },
  { value: 'documentation', label: 'Documentation', color: 'text-blue-600 bg-blue-50' },
]

interface Task {
  id: string
  title: string
  status: string
  label: string
  priority: string
  createdAt: Date
  updatedAt: Date
  assignee: string
  description: string
  dueDate: Date
}

interface TaskPageContentProps {
  task: Task
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  onLabelChange: (label: string) => void
  onTitleUpdate: (title: string) => void
  onDescriptionUpdate: (description: string) => void
  onAssigneeUpdate: (assignee: string) => void
}

export function TaskPageContent({
  task,
  onStatusChange,
  onPriorityChange,
  onLabelChange,
  onTitleUpdate,
  onDescriptionUpdate,
  onAssigneeUpdate,
}: TaskPageContentProps) {
  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingAssignee, setIsEditingAssignee] = useState(false)

  const [titleValue, setTitleValue] = useState(task.title)
  const [descriptionValue, setDescriptionValue] = useState(task.description)
  const [assigneeValue, setAssigneeValue] = useState(task.assignee)

  const handleSaveTitle = () => {
    onTitleUpdate(titleValue)
    setIsEditingTitle(false)
  }

  const handleSaveDescription = () => {
    onDescriptionUpdate(descriptionValue)
    setIsEditingDescription(false)
  }

  const handleSaveAssignee = () => {
    onAssigneeUpdate(assigneeValue)
    setIsEditingAssignee(false)
  }

  return (
    <ScrollArea className='h-full'>
      <div className='p-6'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Content - Left Column */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Title Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base font-semibold flex items-center gap-2'>
                      <MdDescription className='h-5 w-5 text-muted-foreground' />
                      Title
                    </CardTitle>
                    {!isEditingTitle ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditingTitle(true)}
                      >
                        <MdEdit className='h-4 w-4' />
                      </Button>
                    ) : (
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setIsEditingTitle(false)
                            setTitleValue(task.title)
                          }}
                        >
                          <MdClose className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleSaveTitle}
                        >
                          <MdSave className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingTitle ? (
                    <Input
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      className='text-lg'
                      autoFocus
                    />
                  ) : (
                    <p className='text-lg'>{task.title}</p>
                  )}
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base font-semibold flex items-center gap-2'>
                      <MdDescription className='h-5 w-5 text-muted-foreground' />
                      Description
                    </CardTitle>
                    {!isEditingDescription ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <MdEdit className='h-4 w-4' />
                      </Button>
                    ) : (
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setIsEditingDescription(false)
                            setDescriptionValue(task.description)
                          }}
                        >
                          <MdClose className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleSaveDescription}
                        >
                          <MdSave className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingDescription ? (
                    <Textarea
                      value={descriptionValue}
                      onChange={(e) => setDescriptionValue(e.target.value)}
                      rows={6}
                      autoFocus
                    />
                  ) : (
                    <p className='text-muted-foreground whitespace-pre-wrap'>
                      {task.description || 'No description provided.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Timeline - Placeholder */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <MdAccessTime className='h-5 w-5 text-muted-foreground' />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex gap-3'>
                      <div className='h-2 w-2 rounded-full bg-emerald-500 mt-2' />
                      <div>
                        <p className='text-sm'>Task created</p>
                        <p className='text-xs text-muted-foreground'>
                          {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <div className='h-2 w-2 rounded-full bg-blue-500 mt-2' />
                      <div>
                        <p className='text-sm'>Last updated</p>
                        <p className='text-xs text-muted-foreground'>
                          {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right Column */}
            <div className='space-y-6'>
              {/* Status Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={task.status} onValueChange={onStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusConfig.map((status) => {
                        const Icon = status.icon
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            <div className='flex items-center gap-2'>
                              <Icon className={cn('h-4 w-4', status.color)} />
                              {status.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Priority Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                    <MdFlag className='h-4 w-4' />
                    Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={task.priority} onValueChange={onPriorityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityConfig.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <Badge variant='outline' className={cn('font-normal', priority.color)}>
                            {priority.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Label Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                    <MdLabel className='h-4 w-4' />
                    Label
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={task.label} onValueChange={onLabelChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {labelConfig.map((label) => (
                        <SelectItem key={label.value} value={label.value}>
                          <Badge variant='outline' className={cn('font-normal', label.color)}>
                            {label.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Assignee Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                      <MdPerson className='h-4 w-4' />
                      Assignee
                    </CardTitle>
                    {!isEditingAssignee ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsEditingAssignee(true)}
                      >
                        <MdEdit className='h-4 w-4' />
                      </Button>
                    ) : (
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setIsEditingAssignee(false)
                            setAssigneeValue(task.assignee)
                          }}
                        >
                          <MdClose className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleSaveAssignee}
                        >
                          <MdSave className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingAssignee ? (
                    <Input
                      value={assigneeValue}
                      onChange={(e) => setAssigneeValue(e.target.value)}
                      placeholder='Enter assignee name'
                      autoFocus
                    />
                  ) : (
                    <p className='font-medium'>{task.assignee || 'Unassigned'}</p>
                  )}
                </CardContent>
              </Card>

              {/* Due Date Card */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                    <MdCalendarToday className='h-4 w-4' />
                    Due Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='font-medium'>
                    {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  MdArrowBack,
  MdCheckCircle,
  MdAccessTime,
  MdPlayCircle,
  MdCancel,
  MdList,
  MdDelete,
  MdMoreVert,
} from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Status styles
const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  todo: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: MdList },
  'in progress': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', icon: MdPlayCircle },
  done: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-300', icon: MdCheckCircle },
  canceled: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', icon: MdCancel },
  backlog: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-700 dark:text-amber-300', icon: MdAccessTime },
}

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/15 text-red-600 border-red-200',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-200',
  low: 'bg-slate-500/15 text-slate-600 border-slate-200',
}

const labelStyles: Record<string, string> = {
  bug: 'bg-red-500/10 text-red-600',
  feature: 'bg-purple-500/10 text-purple-600',
  documentation: 'bg-blue-500/10 text-blue-600',
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
}

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

interface TaskPageHeaderProps {
  task: Task
  onBack: () => void
  onStatusChange: (status: string) => void
  onDelete: () => void
}

export function TaskPageHeader({
  task,
  onBack,
  onStatusChange,
  onDelete,
}: TaskPageHeaderProps) {
  const statusStyle = statusStyles[task.status] || statusStyles.todo
  const StatusIcon = statusStyle.icon

  return (
    <motion.div
      className='border-b bg-background'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='px-6 py-5'>
        <div className='max-w-5xl mx-auto'>
          {/* Back Button */}
          <motion.div variants={itemVariants} className='mb-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='-ml-3 group text-muted-foreground hover:text-foreground'
            >
              <motion.div
                className='flex items-center'
                whileHover={{ x: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <MdArrowBack className='h-4 w-4 mr-2' />
                Back to Tasks
              </motion.div>
            </Button>
          </motion.div>

          {/* Main Content */}
          <div className='flex items-start justify-between gap-4'>
            {/* Left - Task Info */}
            <motion.div className='flex-1 min-w-0 space-y-3' variants={itemVariants}>
              {/* Task ID + Title */}
              <div>
                <p className='text-sm font-mono text-muted-foreground mb-1'>{task.id}</p>
                <motion.h1
                  className='text-2xl font-semibold tracking-tight text-foreground'
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {task.title}
                </motion.h1>
              </div>

              {/* Badges Row */}
              <motion.div
                className='flex items-center gap-2 flex-wrap'
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Status Badge */}
                <Badge className={cn('text-xs font-medium px-2.5 py-0.5 gap-1.5', statusStyle.bg, statusStyle.text)}>
                  <StatusIcon className='h-3.5 w-3.5' />
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>

                {/* Priority Badge */}
                <Badge variant='outline' className={cn('text-xs font-medium', priorityStyles[task.priority])}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>

                {/* Label Badge */}
                <Badge className={cn('text-xs font-medium border-0', labelStyles[task.label])}>
                  {task.label.charAt(0).toUpperCase() + task.label.slice(1)}
                </Badge>
              </motion.div>

              {/* Meta Info */}
              <motion.div
                className='flex items-center gap-4 text-sm text-muted-foreground'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <span>Created {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                <span className='text-muted-foreground/50'>•</span>
                <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                {task.assignee && (
                  <>
                    <span className='text-muted-foreground/50'>•</span>
                    <span>Assigned to {task.assignee}</span>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right - Actions */}
            <motion.div variants={itemVariants} className='flex items-center gap-2'>
              {/* Quick Status Change */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => onStatusChange('todo')}>
                    <MdList className='mr-2 h-4 w-4' />
                    Todo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('in progress')}>
                    <MdPlayCircle className='mr-2 h-4 w-4' />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('done')}>
                    <MdCheckCircle className='mr-2 h-4 w-4' />
                    Done
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('backlog')}>
                    <MdAccessTime className='mr-2 h-4 w-4' />
                    Backlog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('canceled')}>
                    <MdCancel className='mr-2 h-4 w-4' />
                    Canceled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <MdMoreVert className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-red-600 focus:text-red-600'
                    onClick={onDelete}
                  >
                    <MdDelete className='mr-2 h-4 w-4' />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

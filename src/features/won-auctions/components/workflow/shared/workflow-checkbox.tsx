'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { MdCheck, MdPerson, MdAccessTime, MdChat, MdAttachFile, MdClose, MdDescription, MdImage, MdAdd } from 'react-icons/md'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type TaskCompletion, type WorkflowAttachment } from '../../../types/workflow'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  file: File
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

interface WorkflowCheckboxProps {
  id: string
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  completion?: TaskCompletion
  onCheckedChange: (checked: boolean, notes?: string, attachments?: WorkflowAttachment[]) => void
  onEdit?: (completion: TaskCompletion) => void
  showNoteOnComplete?: boolean
  showDocumentUpload?: boolean
  currentUser?: string
  className?: string
}

export function WorkflowCheckbox({
  id,
  label,
  description,
  checked,
  disabled = false,
  completion,
  onCheckedChange,
  onEdit,
  showNoteOnComplete = false,
  showDocumentUpload = false,
  currentUser = 'System',
  className,
}: WorkflowCheckboxProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])

  // Inline note editing state
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [inlineNote, setInlineNote] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditingNote && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditingNote])

  // Initialize inline note from completion
  useEffect(() => {
    if (completion?.notes) {
      setInlineNote(completion.notes)
    }
  }, [completion?.notes])

  const handleCheckedChange = (value: boolean) => {
    // Only show modal if document upload is needed
    if (value && showDocumentUpload) {
      setDialogOpen(true)
    } else {
      onCheckedChange(value)
    }
  }

  const handleConfirmWithDocuments = () => {
    // Convert uploaded files to WorkflowAttachment format
    const attachments: WorkflowAttachment[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      url: URL.createObjectURL(f.file),
      type: f.type.startsWith('image/') ? 'image' : 'document',
      size: f.size,
      uploadedBy: currentUser,
      uploadedAt: new Date(),
    }))

    onCheckedChange(true, undefined, attachments.length > 0 ? attachments : undefined)
    setFiles([])
    setDialogOpen(false)
  }

  const handleCancel = () => {
    setFiles([])
    setDialogOpen(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: UploadedFile[] = Array.from(e.target.files).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }))
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5)) // Max 5 files
    }
    e.target.value = '' // Reset input
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleSaveNote = () => {
    if (completion && onEdit) {
      onEdit({
        ...completion,
        notes: inlineNote || undefined,
      })
    }
    setIsEditingNote(false)
  }

  const handleCancelNote = () => {
    setInlineNote(completion?.notes || '')
    setIsEditingNote(false)
  }

  return (
    <div className={cn('flex items-start gap-3 py-2', className)}>
      {/* Animated Checkbox */}
      <motion.button
        type='button'
        role='checkbox'
        aria-checked={checked}
        id={id}
        disabled={disabled}
        onClick={() => !disabled && handleCheckedChange(!checked)}
        className={cn(
          'mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked
            ? 'bg-foreground border-foreground'
            : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        whileTap={!disabled ? { scale: 0.85 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              viewBox='0 0 24 24'
              className='h-3.5 w-3.5 text-background'
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <motion.path
                d='M5 12l5 5L20 7'
                fill='none'
                stroke='currentColor'
                strokeWidth={3}
                strokeLinecap='round'
                strokeLinejoin='round'
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Document Upload Modal - Only shown when showDocumentUpload is true */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-[380px] p-0 gap-0 rounded-2xl overflow-hidden border shadow-2xl bg-background'>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleConfirmWithDocuments()
            }}
          >
            {/* Header */}
            <div className='flex items-center gap-4 p-5 border-b bg-muted/50'>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className='h-12 w-12 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20'
              >
                <MdCheck className='h-6 w-6 text-white' />
              </motion.div>
              <div className='min-w-0'>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className='font-semibold text-base text-foreground'
                >
                  Mark as Complete
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='text-sm text-muted-foreground truncate'
                >
                  {label}
                </motion.p>
              </div>
            </div>

            {/* Content - Document Upload Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className='p-5 space-y-4'
            >
              <div className='space-y-2'>
                <label className='text-sm font-medium text-muted-foreground'>
                  Attach documents (optional)
                </label>
                <div className='relative'>
                  <input
                    type='file'
                    accept='.pdf,.doc,.docx,.png,.jpg,.jpeg'
                    multiple
                    onChange={handleFileSelect}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                  />
                  <div className='flex items-center justify-center gap-2 py-4 px-3 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-muted-foreground/40 transition-colors bg-muted/30'>
                    <MdAttachFile className='h-5 w-5 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>
                      Drop files or click to browse
                    </span>
                  </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className='space-y-1.5 mt-2'>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className='flex items-center gap-2 p-2 rounded-md border bg-muted/30 text-sm'
                      >
                        {file.type.startsWith('image/') ? (
                          <MdImage className='h-4 w-4 text-muted-foreground shrink-0' />
                        ) : (
                          <MdDescription className='h-4 w-4 text-muted-foreground shrink-0' />
                        )}
                        <span className='flex-1 truncate'>{file.name}</span>
                        <span className='text-xs text-muted-foreground shrink-0'>
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          type='button'
                          onClick={() => removeFile(file.id)}
                          className='p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors'
                        >
                          <MdClose className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Footer */}
            <div className='flex justify-end gap-3 p-5 pt-0'>
              <Button
                type='button'
                variant='ghost'
                onClick={handleCancel}
                className='text-muted-foreground hover:text-foreground'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5'
              >
                <MdCheck className='h-4 w-4' />
                Complete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium cursor-pointer select-none',
              checked && 'text-muted-foreground line-through',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        </div>
        {description && (
          <p className='text-xs text-muted-foreground mt-0.5'>{description}</p>
        )}

        {/* Completion info */}
        {checked && completion && (
          <div className='space-y-1 mt-1.5'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                <MdPerson className='h-3 w-3' />
                {completion.completedBy}
              </span>
              <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                <MdAccessTime className='h-3 w-3' />
                {format(new Date(completion.completedAt), 'MMM d, yyyy HH:mm')}
              </span>
            </div>

            {/* Inline Note Display/Edit */}
            {showNoteOnComplete && (
              <AnimatePresence mode='wait'>
                {isEditingNote ? (
                  <motion.div
                    key='editing'
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='mt-2 space-y-2'
                  >
                    <Textarea
                      ref={textareaRef}
                      placeholder='Add a note...'
                      value={inlineNote}
                      onChange={(e) => setInlineNote(e.target.value)}
                      rows={2}
                      className='resize-none text-sm'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          handleSaveNote()
                        }
                        if (e.key === 'Escape') {
                          handleCancelNote()
                        }
                      }}
                    />
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={handleSaveNote}
                        className='h-7 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                      >
                        Save
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        onClick={handleCancelNote}
                        className='h-7 text-xs'
                      >
                        Cancel
                      </Button>
                      <span className='text-[10px] text-muted-foreground'>Ctrl+Enter to save</span>
                    </div>
                  </motion.div>
                ) : completion.notes ? (
                  <motion.button
                    key='display'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onEdit && setIsEditingNote(true)}
                    className='flex items-start gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors text-left mt-1 group'
                  >
                    <MdChat className='h-3 w-3 mt-0.5 shrink-0' />
                    <span className='group-hover:underline'>{completion.notes}</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key='add'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onEdit && setIsEditingNote(true)}
                    className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1'
                  >
                    <MdAdd className='h-3 w-3' />
                    Add note
                  </motion.button>
                )}
              </AnimatePresence>
            )}

            {/* Attached files */}
            {completion.attachments && completion.attachments.length > 0 && (
              <div className='flex flex-wrap items-center gap-1.5 mt-1'>
                <MdAttachFile className='h-3 w-3 text-muted-foreground' />
                {completion.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-1.5 py-0.5 rounded'
                  >
                    {att.type === 'image' ? (
                      <MdImage className='h-3 w-3' />
                    ) : (
                      <MdDescription className='h-3 w-3' />
                    )}
                    {att.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status indicator */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className='shrink-0'
          >
            <div className='h-5 w-5 rounded-full bg-foreground flex items-center justify-center'>
              <MdCheck className='h-3 w-3 text-background' />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

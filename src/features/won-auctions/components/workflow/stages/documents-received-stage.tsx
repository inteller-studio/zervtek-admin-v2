'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MdFactCheck, MdError, MdDirectionsCar, MdBlock, MdCheck, MdPerson, MdAccessTime } from 'react-icons/md'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../../data/won-auctions'
import { type PurchaseWorkflow, type AccessoriesChecklist, type AccessoriesSubItems, type TaskCompletion } from '../../../types/workflow'
import { Input } from '@/components/ui/input'
import { updateWorkflowStage, updateTaskCompletion } from '../../../utils/workflow'
import { WorkflowCheckbox } from '../shared/workflow-checkbox'
import { MdVpnKey, MdDescription, MdMenuBook, MdCollections, MdBuildCircle, MdMoreHoriz } from 'react-icons/md'

const ACCESSORIES_LIST: { key: keyof AccessoriesChecklist; label: string; description: string; icon: React.ElementType; hasSubItems?: boolean; hasInput?: boolean }[] = [
  { key: 'spareKeys', label: 'Spare Keys', description: 'Additional keys for the vehicle', icon: MdVpnKey },
  { key: 'maintenanceRecords', label: 'Maintenance Records', description: 'Service history and maintenance documentation', icon: MdDescription },
  { key: 'manuals', label: 'Manuals', description: "Owner's manual and instruction booklets", icon: MdMenuBook },
  { key: 'catalogues', label: 'Catalogues', description: 'Parts catalogues and promotional materials', icon: MdCollections },
  { key: 'accessories', label: 'Accessories', description: 'Select included accessories', icon: MdBuildCircle, hasSubItems: true },
  { key: 'others', label: 'Others', description: 'Any other items not listed above', icon: MdMoreHoriz, hasInput: true },
]

const ACCESSORIES_SUB_ITEMS: { key: keyof AccessoriesSubItems; label: string }[] = [
  { key: 'remotes', label: 'Remotes' },
  { key: 'shiftKnobs', label: 'Shift Knobs' },
  { key: 'floorMats', label: 'Floor Mats' },
  { key: 'originalRemote', label: 'Original Remote' },
  { key: 'antenna', label: 'Antenna' },
  { key: 'jackSet', label: 'Jack Set' },
  { key: 'toolKit', label: 'Tool Kit' },
]

interface DocumentsReceivedStageProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  onWorkflowUpdate: (workflow: PurchaseWorkflow) => void
  currentUser: string
  onOpenExportCertificate?: () => void
}

export function DocumentsReceivedStage({
  workflow,
  onWorkflowUpdate,
  currentUser,
  onOpenExportCertificate,
}: DocumentsReceivedStageProps) {
  const stage = workflow.stages.documentsReceived

  const handleRegistrationChange = (isRegistered: boolean) => {
    const updatedStage = {
      ...stage,
      isRegistered,
      status: 'in_progress' as const,
      // Initialize tasks based on registration status
      registeredTasks: isRegistered
        ? {
            receivedNumberPlates: { completed: false },
            deregistered: { completed: false },
            exportCertificateCreated: { completed: false },
            sentDeregistrationCopy: { completed: false },
            insuranceRefundReceived: { completed: false },
          }
        : undefined,
      unregisteredTasks: !isRegistered
        ? {
            exportCertificateCreated: { completed: false },
          }
        : undefined,
      // Initialize accessories checklist
      accessories: stage.accessories || {
        spareKeys: false,
        maintenanceRecords: false,
        manuals: false,
        catalogues: false,
        accessories: false,
        others: false,
      },
    }
    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleRegisteredTaskChange = (
    task: keyof NonNullable<typeof stage.registeredTasks>,
    checked: boolean,
    notes?: string
  ) => {
    if (!stage.registeredTasks) return

    const updatedTasks = {
      ...stage.registeredTasks,
      [task]: updateTaskCompletion(stage.registeredTasks[task], checked, currentUser, notes),
    }

    // Check if all tasks are complete
    const allComplete = Object.values(updatedTasks).every((t) => t.completed)

    const updatedStage = {
      ...stage,
      registeredTasks: updatedTasks,
      status: allComplete ? ('completed' as const) : ('in_progress' as const),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleUnregisteredTaskChange = (
    task: keyof NonNullable<typeof stage.unregisteredTasks>,
    checked: boolean,
    notes?: string
  ) => {
    if (!stage.unregisteredTasks) return

    const updatedTasks = {
      ...stage.unregisteredTasks,
      [task]: updateTaskCompletion(stage.unregisteredTasks[task], checked, currentUser, notes),
    }

    // Check if all tasks are complete
    const allComplete = Object.values(updatedTasks).every((t) => t.completed)

    const updatedStage = {
      ...stage,
      unregisteredTasks: updatedTasks,
      status: allComplete ? ('completed' as const) : ('in_progress' as const),
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  // Edit handlers for inline note editing
  const handleRegisteredTaskEdit = (
    task: keyof NonNullable<typeof stage.registeredTasks>,
    completion: TaskCompletion
  ) => {
    if (!stage.registeredTasks) return

    const updatedTasks = {
      ...stage.registeredTasks,
      [task]: { ...stage.registeredTasks[task], completion },
    }

    const updatedStage = {
      ...stage,
      registeredTasks: updatedTasks,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleUnregisteredTaskEdit = (
    task: keyof NonNullable<typeof stage.unregisteredTasks>,
    completion: TaskCompletion
  ) => {
    if (!stage.unregisteredTasks) return

    const updatedTasks = {
      ...stage.unregisteredTasks,
      [task]: { ...stage.unregisteredTasks[task], completion },
    }

    const updatedStage = {
      ...stage,
      unregisteredTasks: updatedTasks,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const getDefaultAccessories = (): AccessoriesChecklist => ({
    spareKeys: false,
    maintenanceRecords: false,
    manuals: false,
    catalogues: false,
    accessories: false,
    accessoriesSubItems: {
      remotes: false,
      shiftKnobs: false,
      floorMats: false,
      originalRemote: false,
      antenna: false,
      jackSet: false,
      toolKit: false,
    },
    others: false,
    othersText: '',
  })

  const handleAccessoryChange = (key: keyof AccessoriesChecklist, checked: boolean) => {
    const currentAccessories = stage.accessories || getDefaultAccessories()
    const updatedAccessories = {
      ...currentAccessories,
      [key]: checked,
    }

    const updatedStage = {
      ...stage,
      accessories: updatedAccessories,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleAccessorySubItemChange = (key: keyof AccessoriesSubItems, checked: boolean) => {
    const currentAccessories = stage.accessories || getDefaultAccessories()
    const updatedSubItems = {
      ...(currentAccessories.accessoriesSubItems || getDefaultAccessories().accessoriesSubItems!),
      [key]: checked,
    }

    const updatedAccessories = {
      ...currentAccessories,
      accessoriesSubItems: updatedSubItems,
    }

    const updatedStage = {
      ...stage,
      accessories: updatedAccessories,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  const handleOthersTextChange = (text: string) => {
    const currentAccessories = stage.accessories || getDefaultAccessories()
    const updatedAccessories = {
      ...currentAccessories,
      othersText: text,
    }

    const updatedStage = {
      ...stage,
      accessories: updatedAccessories,
    }

    onWorkflowUpdate(updateWorkflowStage(workflow, 'documentsReceived', updatedStage))
  }

  return (
    <div className='space-y-4'>
      {/* Info Alert */}
      <Alert>
        <MdFactCheck className='h-4 w-4' />
        <AlertDescription>
          Complete document-related tasks based on the vehicle&apos;s registration status.
        </AlertDescription>
      </Alert>

      {/* Registration Status Selection */}
      <div className='space-y-3'>
        <Label className='text-sm font-medium'>Vehicle Registration Status</Label>
        <RadioGroup
          value={stage.isRegistered === null ? undefined : stage.isRegistered ? 'registered' : 'unregistered'}
          onValueChange={(value) => handleRegistrationChange(value === 'registered')}
          className='grid grid-cols-2 gap-3'
        >
          <Label
            htmlFor='registered'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
              stage.isRegistered === true && 'border-primary bg-primary/5'
            )}
          >
            <RadioGroupItem value='registered' id='registered' />
            <div className='flex items-center gap-2'>
              <MdDirectionsCar className='h-4 w-4 text-emerald-600' />
              <div>
                <p className='text-sm font-medium'>Registered</p>
                <p className='text-xs text-muted-foreground'>Has number plates</p>
              </div>
            </div>
          </Label>
          <Label
            htmlFor='unregistered'
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
              stage.isRegistered === false && 'border-primary bg-primary/5'
            )}
          >
            <RadioGroupItem value='unregistered' id='unregistered' />
            <div className='flex items-center gap-2'>
              <MdBlock className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>Not Registered</p>
                <p className='text-xs text-muted-foreground'>No number plates</p>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {stage.isRegistered === null && (
        <Alert variant='default' className='bg-amber-50 border-amber-200'>
          <MdError className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            Select the vehicle registration status to see available tasks.
          </AlertDescription>
        </Alert>
      )}

      {/* Registered Vehicle Tasks */}
      {stage.isRegistered === true && stage.registeredTasks && (
        <div className='space-y-2'>
          <Separator />
          <Label className='text-sm font-medium'>Registered Vehicle Tasks</Label>
          <div className='border rounded-lg divide-y'>
            <WorkflowCheckbox
              id='received-number-plates'
              label='Received Number Plates'
              description='Confirm that the number plates have been received from the auction'
              checked={stage.registeredTasks.receivedNumberPlates.completed}
              completion={stage.registeredTasks.receivedNumberPlates.completion}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('receivedNumberPlates', checked, notes)
              }
              onEdit={(completion) => handleRegisteredTaskEdit('receivedNumberPlates', completion)}
              showNoteOnComplete
              className='px-3'
            />
            <WorkflowCheckbox
              id='deregistered'
              label='Deregister Vehicle'
              description='Complete the deregistration process for the vehicle'
              checked={stage.registeredTasks.deregistered.completed}
              completion={stage.registeredTasks.deregistered.completion}
              disabled={!stage.registeredTasks.receivedNumberPlates.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('deregistered', checked, notes)
              }
              onEdit={(completion) => handleRegisteredTaskEdit('deregistered', completion)}
              showNoteOnComplete
              className='px-3'
            />
            {/* Export Certificate - Opens detailed dialog */}
            <div className='flex items-start gap-3 py-3 px-3'>
              <motion.button
                type='button'
                role='checkbox'
                aria-checked={stage.registeredTasks.exportCertificateCreated.completed}
                id='export-certificate-registered'
                disabled={!stage.registeredTasks.deregistered.completed}
                onClick={() => {
                  if (stage.registeredTasks?.deregistered.completed && onOpenExportCertificate) {
                    onOpenExportCertificate()
                  }
                }}
                className={cn(
                  'mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  stage.registeredTasks.exportCertificateCreated.completed
                    ? 'bg-foreground border-foreground'
                    : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60',
                  !stage.registeredTasks.deregistered.completed && 'opacity-50 cursor-not-allowed'
                )}
                whileTap={stage.registeredTasks.deregistered.completed ? { scale: 0.85 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <AnimatePresence>
                  {stage.registeredTasks.exportCertificateCreated.completed && (
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
              <div className='flex-1 min-w-0'>
                <label
                  htmlFor='export-certificate-registered'
                  className={cn(
                    'text-sm font-medium cursor-pointer select-none',
                    stage.registeredTasks.exportCertificateCreated.completed && 'text-muted-foreground line-through',
                    !stage.registeredTasks.deregistered.completed && 'cursor-not-allowed opacity-50'
                  )}
                >
                  Create Export Certificate
                </label>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Upload the export certificate for the vehicle
                </p>
                {/* Completion info */}
                {stage.registeredTasks.exportCertificateCreated.completed && stage.registeredTasks.exportCertificateCreated.completion && (
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground'>
                    {stage.registeredTasks.exportCertificateCreated.completion.notes && (
                      <span className='font-medium text-foreground'>
                        {stage.registeredTasks.exportCertificateCreated.completion.notes}
                      </span>
                    )}
                    <span className='flex items-center gap-1'>
                      <MdPerson className='h-3 w-3' />
                      {stage.registeredTasks.exportCertificateCreated.completion.completedBy}
                    </span>
                    <span className='flex items-center gap-1'>
                      <MdAccessTime className='h-3 w-3' />
                      {format(new Date(stage.registeredTasks.exportCertificateCreated.completion.completedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {stage.registeredTasks.exportCertificateCreated.completed && (
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
            <WorkflowCheckbox
              id='sent-deregistration-copy'
              label='Send Deregistration Copy to Auction House'
              description='Send a copy of the deregistration certificate to the auction house'
              checked={stage.registeredTasks.sentDeregistrationCopy.completed}
              completion={stage.registeredTasks.sentDeregistrationCopy.completion}
              disabled={!stage.registeredTasks.deregistered.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('sentDeregistrationCopy', checked, notes)
              }
              onEdit={(completion) => handleRegisteredTaskEdit('sentDeregistrationCopy', completion)}
              showNoteOnComplete
              className='px-3'
            />
            <WorkflowCheckbox
              id='insurance-refund'
              label='Get Insurance Refund'
              description='Claim the insurance refund for the deregistered vehicle'
              checked={stage.registeredTasks.insuranceRefundReceived.completed}
              completion={stage.registeredTasks.insuranceRefundReceived.completion}
              disabled={!stage.registeredTasks.deregistered.completed}
              onCheckedChange={(checked, notes) =>
                handleRegisteredTaskChange('insuranceRefundReceived', checked, notes)
              }
              onEdit={(completion) => handleRegisteredTaskEdit('insuranceRefundReceived', completion)}
              showNoteOnComplete
              className='px-3'
            />
          </div>
        </div>
      )}

      {/* Unregistered Vehicle Tasks */}
      {stage.isRegistered === false && stage.unregisteredTasks && (
        <div className='space-y-2'>
          <Separator />
          <Label className='text-sm font-medium'>Unregistered Vehicle Tasks</Label>
          <div className='border rounded-lg'>
            {/* Export Certificate - Opens detailed dialog */}
            <div className='flex items-start gap-3 py-3 px-3'>
              <motion.button
                type='button'
                role='checkbox'
                aria-checked={stage.unregisteredTasks.exportCertificateCreated.completed}
                id='export-certificate-unregistered'
                onClick={() => {
                  if (onOpenExportCertificate) {
                    onOpenExportCertificate()
                  }
                }}
                className={cn(
                  'mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  stage.unregisteredTasks.exportCertificateCreated.completed
                    ? 'bg-foreground border-foreground'
                    : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60'
                )}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <AnimatePresence>
                  {stage.unregisteredTasks.exportCertificateCreated.completed && (
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
              <div className='flex-1 min-w-0'>
                <label
                  htmlFor='export-certificate-unregistered'
                  className={cn(
                    'text-sm font-medium cursor-pointer select-none',
                    stage.unregisteredTasks.exportCertificateCreated.completed && 'text-muted-foreground line-through'
                  )}
                >
                  Create Export Certificate
                </label>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Upload the export certificate for the unregistered vehicle
                </p>
                {/* Completion info */}
                {stage.unregisteredTasks.exportCertificateCreated.completed && stage.unregisteredTasks.exportCertificateCreated.completion && (
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground'>
                    {stage.unregisteredTasks.exportCertificateCreated.completion.notes && (
                      <span className='font-medium text-foreground'>
                        {stage.unregisteredTasks.exportCertificateCreated.completion.notes}
                      </span>
                    )}
                    <span className='flex items-center gap-1'>
                      <MdPerson className='h-3 w-3' />
                      {stage.unregisteredTasks.exportCertificateCreated.completion.completedBy}
                    </span>
                    <span className='flex items-center gap-1'>
                      <MdAccessTime className='h-3 w-3' />
                      {format(new Date(stage.unregisteredTasks.exportCertificateCreated.completion.completedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {stage.unregisteredTasks.exportCertificateCreated.completed && (
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
          </div>
        </div>
      )}

      {/* Accessories Checklist - Shows for both registered and unregistered */}
      {stage.isRegistered !== null && (
        <div className='space-y-2'>
          <Separator />
          <Label className='text-sm font-medium'>Included Accessories</Label>
          <div className='border rounded-lg divide-y'>
            {ACCESSORIES_LIST.map((item) => {
              const Icon = item.icon
              const isChecked = Boolean(stage.accessories?.[item.key])
              return (
                <div key={item.key}>
                  <div
                    className='flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-muted/50 transition-colors'
                    onClick={() => handleAccessoryChange(item.key, !isChecked)}
                  >
                    <motion.button
                      type='button'
                      role='checkbox'
                      aria-checked={isChecked}
                      className={cn(
                        'h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors',
                        isChecked
                          ? 'bg-foreground border-foreground'
                          : 'border-muted-foreground/50 dark:border-muted-foreground/70 hover:border-foreground/60'
                      )}
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AnimatePresence>
                        {isChecked && (
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
                    <Icon className='h-4 w-4 text-muted-foreground shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className={cn('text-sm font-medium', isChecked && 'text-muted-foreground')}>
                        {item.label}
                      </p>
                      <p className='text-xs text-muted-foreground'>{item.description}</p>
                    </div>
                  </div>

                  {/* Accessories Sub-items */}
                  {item.hasSubItems && isChecked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className='pb-3 px-3 pl-11'
                    >
                      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                        {ACCESSORIES_SUB_ITEMS.map((subItem) => {
                          const subChecked = stage.accessories?.accessoriesSubItems?.[subItem.key] ?? false
                          return (
                            <div
                              key={subItem.key}
                              className='flex items-center gap-2 cursor-pointer'
                              onClick={() => handleAccessorySubItemChange(subItem.key, !subChecked)}
                            >
                              <motion.button
                                type='button'
                                role='checkbox'
                                aria-checked={subChecked}
                                className={cn(
                                  'h-4 w-4 rounded border-2 flex items-center justify-center transition-colors',
                                  subChecked
                                    ? 'bg-foreground border-foreground'
                                    : 'border-muted-foreground/50 hover:border-foreground/60'
                                )}
                                whileTap={{ scale: 0.85 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <AnimatePresence>
                                  {subChecked && (
                                    <motion.svg
                                      viewBox='0 0 24 24'
                                      className='h-2.5 w-2.5 text-background'
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
                              <span className='text-sm'>{subItem.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Others Input */}
                  {item.hasInput && isChecked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className='pb-3 px-3 pl-11'
                    >
                      <Input
                        placeholder='Enter other items...'
                        value={stage.accessories?.othersText || ''}
                        onChange={(e) => handleOthersTextChange(e.target.value)}
                        className='text-sm'
                      />
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

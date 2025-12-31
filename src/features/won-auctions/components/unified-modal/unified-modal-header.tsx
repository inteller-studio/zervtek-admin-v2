'use client'

import { format } from 'date-fns'
import { MdClose, MdDirectionsCar, MdPerson, MdCalendarToday, MdLocationOn, MdContentCopy, MdCheck } from 'react-icons/md'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { type Purchase } from '../../data/won-auctions'
import { type PurchaseWorkflow } from '../../types/workflow'
import { StageProgress } from '../workflow/shared/stage-progress'
import { calculateWorkflowProgress, isStageComplete } from '../../utils/workflow'
import { ModeToggle, type ModalMode } from './shared/mode-toggle'

// Status styles
const statusStyles: Record<Purchase['status'], string> = {
  payment_pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  documents_pending: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  shipping: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  completed: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

const statusLabels: Record<Purchase['status'], string> = {
  payment_pending: 'Payment Pending',
  processing: 'Processing',
  documents_pending: 'Docs Pending',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
}

interface UnifiedModalHeaderProps {
  auction: Purchase
  workflow: PurchaseWorkflow
  mode: ModalMode
  onModeChange: (mode: ModalMode) => void
  onClose: () => void
  onStageClick: (stageNumber: number) => void
}

export function UnifiedModalHeader({
  auction,
  workflow,
  mode,
  onModeChange,
  onClose,
  onStageClick,
}: UnifiedModalHeaderProps) {
  const [vinCopied, setVinCopied] = useState(false)
  const progress = calculateWorkflowProgress(workflow)

  // Get completed stages array
  const completedStages: number[] = []
  for (let i = 1; i <= 8; i++) {
    if (isStageComplete(workflow, i)) {
      completedStages.push(i)
    }
  }

  const copyVin = () => {
    navigator.clipboard.writeText(auction.vehicleInfo.vin)
    setVinCopied(true)
    toast.success('VIN copied to clipboard')
    setTimeout(() => setVinCopied(false), 2000)
  }

  const vehicleTitle = `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`

  return (
    <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <SheetHeader className='px-6 py-4'>
        <div className='flex items-start justify-between gap-4'>
          {/* Left: Vehicle Info */}
          <div className='flex gap-4 min-w-0'>
            {/* Vehicle Image */}
            <div className='h-16 w-20 rounded-lg overflow-hidden bg-muted shrink-0'>
              {auction.vehicleInfo.images[0] && auction.vehicleInfo.images[0] !== '#' ? (
                <img
                  src={auction.vehicleInfo.images[0]}
                  alt={vehicleTitle}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='h-full w-full flex items-center justify-center'>
                  <MdDirectionsCar className='h-6 w-6 text-muted-foreground' />
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className='space-y-1 min-w-0'>
              <div className='flex items-center gap-2 flex-wrap'>
                <SheetTitle className='text-lg font-semibold truncate'>
                  {vehicleTitle}
                </SheetTitle>
                <Badge variant='outline' className='text-xs shrink-0'>
                  {auction.auctionId}
                </Badge>
                <Badge
                  variant='outline'
                  className={cn('text-xs shrink-0', statusStyles[auction.status])}
                >
                  {statusLabels[auction.status]}
                </Badge>
              </div>

              {/* VIN */}
              <button
                onClick={copyVin}
                className='inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors'
              >
                <span className='truncate'>{auction.vehicleInfo.vin}</span>
                {vinCopied ? (
                  <MdCheck className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
                ) : (
                  <MdContentCopy className='h-3.5 w-3.5 shrink-0' />
                )}
              </button>

              {/* Meta info */}
              <div className='flex items-center gap-3 text-xs text-muted-foreground flex-wrap'>
                <span className='flex items-center gap-1'>
                  <MdPerson className='h-3 w-3' />
                  {auction.winnerName}
                </span>
                <span className='flex items-center gap-1'>
                  <MdCalendarToday className='h-3 w-3' />
                  {format(new Date(auction.auctionEndDate), 'MMM d, yyyy')}
                </span>
                {auction.destinationPort && (
                  <span className='flex items-center gap-1'>
                    <MdLocationOn className='h-3 w-3' />
                    {auction.destinationPort.split(',')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Mode Toggle, Progress & Close */}
          <div className='flex items-center gap-4 shrink-0'>
            {/* Stage Progress - only visible in workflow mode or on larger screens */}
            <div className='hidden lg:block'>
              <StageProgress
                currentStage={workflow.currentStage}
                completedStages={completedStages}
                onStageClick={(stage) => {
                  onModeChange('workflow')
                  onStageClick(stage)
                }}
                variant='dots'
              />
            </div>

            {/* Mode Toggle */}
            <ModeToggle
              mode={mode}
              onModeChange={onModeChange}
              workflowProgress={progress}
            />

            {/* Close Button */}
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 shrink-0'
            >
              <MdClose className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </Button>
          </div>
        </div>
      </SheetHeader>

      {/* Progress Bar */}
      <div className='h-1 bg-muted'>
        <div
          className='h-full bg-emerald-500 transition-all duration-500'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

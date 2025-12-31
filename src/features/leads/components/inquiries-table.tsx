'use client'

import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  MdDirectionsCar,
  MdVisibility,
  MdInbox,
  MdAttachMoney,
  MdInventory2,
  MdLocalShipping,
  MdSearch,
  MdHelp,
} from 'react-icons/md'
import { cn } from '@/lib/utils'
import { type InquirySubmission, type InquiryStatus } from '../data/submissions'

interface InquiriesTableProps {
  data: InquirySubmission[]
  selectedId: string | null
  onRowClick: (submission: InquirySubmission) => void
}

// Status left border colors
const statusBorderColors: Record<InquiryStatus, string> = {
  new: 'border-l-blue-500',
  in_progress: 'border-l-amber-500',
  responded: 'border-l-emerald-500',
  closed: 'border-l-slate-300 dark:border-l-slate-600',
}

// Status badge styles
const statusBadgeStyles: Record<InquiryStatus, string> = {
  new: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  responded: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  closed: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/20',
}

// Status labels
const statusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  responded: 'Responded',
  closed: 'Closed',
}

// Inquiry type icons and colors
const inquiryTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  price: { icon: MdAttachMoney, color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', label: 'Price' },
  availability: { icon: MdInventory2, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', label: 'Availability' },
  shipping: { icon: MdLocalShipping, color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400', label: 'Shipping' },
  inspection: { icon: MdSearch, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', label: 'Inspection' },
  general: { icon: MdHelp, color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400', label: 'General' },
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatPrice(price?: number): string {
  if (!price) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatMileage(mileage?: number): string {
  if (!mileage) return ''
  return new Intl.NumberFormat('en-US').format(mileage) + ' km'
}

export function InquiriesTable({ data, selectedId, onRowClick }: InquiriesTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <MdInbox className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-1">No inquiries found</h3>
        <p className="text-sm text-muted-foreground/70">Try adjusting your filters or search</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[130px] font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Vehicle</TableHead>
            <TableHead className="w-[110px] font-semibold">Type</TableHead>
            <TableHead className="w-[100px] font-semibold">Status</TableHead>
            <TableHead className="w-[90px] font-semibold">Time</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((inquiry) => {
            const typeConfig = inquiryTypeConfig[inquiry.metadata.inquiryType] || inquiryTypeConfig.general
            const TypeIcon = typeConfig.icon
            const isSelected = selectedId === inquiry.id
            const isNew = inquiry.status === 'new'
            const isClosed = inquiry.status === 'closed'

            return (
              <TableRow
                key={inquiry.id}
                onClick={() => onRowClick(inquiry)}
                className={cn(
                  'cursor-pointer transition-all duration-150 group',
                  'border-l-4 border-l-transparent',
                  statusBorderColors[inquiry.status as InquiryStatus],
                  'hover:bg-muted/50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
                  isSelected && 'bg-muted/70 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                  isClosed && 'opacity-60'
                )}
              >
                {/* ID */}
                <TableCell className="font-mono text-xs py-3.5">
                  <span className={cn(isNew && 'font-semibold text-foreground')}>
                    {inquiry.submissionNumber}
                  </span>
                </TableCell>

                {/* Customer */}
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {getInitials(inquiry.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-sm truncate',
                        isNew ? 'font-semibold' : 'font-medium'
                      )}>
                        {inquiry.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {inquiry.country || inquiry.customerEmail}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Vehicle */}
                <TableCell className="py-3.5">
                  <div className="flex items-start gap-2">
                    <div className="rounded bg-muted/60 p-1.5 flex-shrink-0">
                      <MdDirectionsCar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {inquiry.metadata.vehicleTitle}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{inquiry.metadata.vehicleTitle}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {inquiry.metadata.vehiclePrice && (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatPrice(inquiry.metadata.vehiclePrice)}
                          </span>
                        )}
                        {inquiry.metadata.vehiclePrice && inquiry.metadata.vehicleMileage && (
                          <span>•</span>
                        )}
                        {inquiry.metadata.vehicleMileage && (
                          <span>{formatMileage(inquiry.metadata.vehicleMileage)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Inquiry Type Badge */}
                <TableCell className="py-3.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      'gap-1 font-medium text-xs',
                      typeConfig.color
                    )}
                  >
                    <TypeIcon className="h-3 w-3" />
                    {typeConfig.label}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium text-xs',
                      statusBadgeStyles[inquiry.status as InquiryStatus]
                    )}
                  >
                    {statusLabels[inquiry.status as InquiryStatus] || inquiry.status}
                  </Badge>
                </TableCell>

                {/* Time */}
                <TableCell className="py-3.5">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(inquiry.createdAt, { addSuffix: false })}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="py-3.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(inquiry)
                    }}
                  >
                    <MdVisibility className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

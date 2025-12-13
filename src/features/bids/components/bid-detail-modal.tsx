'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Clock,
  Gavel,
  Trophy,
  TrendingUp,
  TrendingDown,
  MapPin,
  Mail,
  Building2,
  FileText,
  Handshake,
  MessageSquare,
  Users,
  CircleSlash,
  XCircle,
  Ban,
  FileQuestion,
  HelpCircle,
  Check,
  UserCog,
  Car,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Bid } from '../data/bids'

interface BidDetailModalProps {
  bid: Bid | null
  open: boolean
  onClose: () => void
  onApprove?: (bid: Bid) => void
  onDecline?: (bid: Bid) => void
  onMarkWon?: (bid: Bid, type: 'bid_accepted' | 'contract' | 'contract_nego') => void
  onSoldToOthers?: (bid: Bid) => void
  onMarkUnsold?: (bid: Bid) => void
  onCancelBid?: (bid: Bid) => void
  onAuctionCancelled?: (bid: Bid) => void
  onIncreaseBid?: (bid: Bid) => void
  onCreateInvoice?: (bid: Bid) => void
  loading?: boolean
}

// Unified status styles
const statusStyles: Record<string, string> = {
  pending_approval: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  winning: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  outbid: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  won: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  lost: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  retracted: 'bg-red-500/10 text-red-600 border-red-500/20',
  expired: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  declined: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
}

const auctionStatusStyles: Record<string, string> = {
  live: 'bg-green-500/10 text-green-600 border-green-500/20',
  upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ended: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

const levelStyles: Record<string, string> = {
  unverified: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  premium: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  business: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  business_premium: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
}

const levelLabels: Record<string, string> = {
  unverified: 'Unverified',
  verified: 'Verified',
  premium: 'Premium',
  business: 'Business',
  business_premium: 'Business Premium',
}

const statusLabels: Record<string, string> = {
  pending_approval: 'Pending Approval',
  active: 'Active',
  winning: 'Winning',
  outbid: 'Outbid',
  won: 'Won',
  lost: 'Lost',
  retracted: 'Retracted',
  expired: 'Expired',
  declined: 'Declined',
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="relative h-48 rounded-xl overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Amount skeleton */}
      <div className="flex justify-between items-center p-4 rounded-xl bg-muted/30">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Bidder skeleton */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Details skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/50 p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="rounded-xl border border-border/50 p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, highlight }: { label: string; value: string | React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium", highlight && "text-orange-600")}>{value}</span>
    </div>
  )
}

export function BidDetailModal({
  bid,
  open,
  onClose,
  onApprove,
  onDecline,
  onMarkWon,
  onSoldToOthers,
  onMarkUnsold,
  onCancelBid,
  onAuctionCancelled,
  onIncreaseBid,
  onCreateInvoice,
  loading = false,
}: BidDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap and initial focus
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    if (diff <= 0) return 'Ended'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const isPendingApproval = bid?.status === 'pending_approval'
  const isActiveOrWinning = bid?.status === 'active' || bid?.status === 'winning'
  const isWon = bid?.status === 'won'
  const canIncreaseBid = bid?.auctionStatus === 'live' && bid?.status !== 'winning' && bid?.status !== 'pending_approval'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bid-detail-title"
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
              'max-h-[90vh] overflow-hidden rounded-2xl border border-border/50',
              'bg-background shadow-2xl',
              'focus:outline-none'
            )}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 z-20',
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'bg-black/20 text-white backdrop-blur-sm transition-colors',
                'hover:bg-black/40',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content with scroll */}
            <div className="max-h-[90vh] overflow-y-auto">
              {loading ? (
                <div className="p-6">
                  <LoadingSkeleton />
                </div>
              ) : bid ? (
                <>
                  {/* Header with vehicle image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    {bid.vehicle.thumbnailImage && bid.vehicle.thumbnailImage !== '#' ? (
                      <img
                        src={bid.vehicle.thumbnailImage}
                        alt={`${bid.vehicle.year} ${bid.vehicle.make} ${bid.vehicle.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Car className="h-20 w-20 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Header content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm font-medium opacity-90 mb-1">
                            {bid.auctionHouse} • Lot #{bid.lotNumber}
                          </p>
                          <h2 id="bid-detail-title" className="text-xl font-bold">
                            {bid.vehicle.year} {bid.vehicle.make} {bid.vehicle.model}
                          </h2>
                          <p className="text-sm opacity-80 font-mono mt-1">{bid.vehicle.chassisNumber}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={cn('text-xs', statusStyles[bid.status])}>
                            {statusLabels[bid.status]}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', auctionStatusStyles[bid.auctionStatus])}>
                            {bid.auctionStatus.charAt(0).toUpperCase() + bid.auctionStatus.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bid amount highlight */}
                  <div className="border-b border-border/50 bg-muted/30 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Bid</p>
                        <p className="text-3xl font-bold tracking-tight mt-1">
                          ¥{bid.amount.toLocaleString()}
                        </p>
                        {bid.status === 'winning' && (
                          <div className="flex items-center gap-1.5 mt-2 text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">Currently Leading</span>
                          </div>
                        )}
                        {bid.status === 'outbid' && (
                          <div className="flex items-center gap-1.5 mt-2 text-orange-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Outbid by ¥{(bid.currentHighBid - bid.amount).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current High</p>
                        <p className="text-2xl font-semibold text-muted-foreground mt-1">
                          ¥{bid.currentHighBid.toLocaleString()}
                        </p>
                        {bid.timeRemaining && bid.auctionStatus === 'live' && (
                          <div className="flex items-center justify-end gap-1.5 mt-2 text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">{getTimeRemaining(bid.timeRemaining)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Bidder Card */}
                    <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
                      <Avatar className="h-12 w-12 border-2 border-border/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(bid.bidder.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{bid.bidder.name}</p>
                          <Badge variant="outline" className={cn('text-xs', levelStyles[bid.bidder.level])}>
                            {levelLabels[bid.bidder.level]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{bid.bidder.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="capitalize">{bid.bidder.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {bid.bidder.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">Deposit</p>
                        <p className={cn(
                          "font-semibold",
                          bid.bidder.depositAmount > 0 ? "text-emerald-600" : "text-muted-foreground"
                        )}>
                          {bid.bidder.depositAmount > 0 ? `¥${bid.bidder.depositAmount.toLocaleString()}` : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Bid Details */}
                      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Bid Details
                        </h3>
                        <div className="space-y-1 divide-y divide-border/50">
                          <StatItem label="Bid Number" value={<span className="font-mono">{bid.bidNumber}</span>} />
                          <StatItem
                            label="Type"
                            value={
                              <span className="flex items-center gap-1.5">
                                {bid.type === 'assisted' ? <UserCog className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                                {bid.type === 'assisted' ? 'Assisted' : 'Manual'}
                              </span>
                            }
                          />
                          {bid.type === 'assisted' && bid.assistedBy && (
                            <StatItem label="Assisted By" value={bid.assistedBy} />
                          )}
                          {bid.previousBid && (
                            <StatItem label="Previous Bid" value={`¥${bid.previousBid.toLocaleString()}`} />
                          )}
                          <StatItem label="Placed" value={format(bid.timestamp, 'MMM d, yyyy h:mm a')} />
                        </div>
                      </div>

                      {/* Auction Info */}
                      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Auction Info
                        </h3>
                        <div className="space-y-1 divide-y divide-border/50">
                          <StatItem
                            label="Status"
                            value={
                              <Badge variant="outline" className={cn('text-xs', auctionStatusStyles[bid.auctionStatus])}>
                                {bid.auctionStatus.charAt(0).toUpperCase() + bid.auctionStatus.slice(1)}
                              </Badge>
                            }
                          />
                          <StatItem label="Total Bids" value={bid.totalBids.toString()} />
                          <StatItem label="Auction House" value={bid.auctionHouse} />
                          <StatItem label="Lot Number" value={`#${bid.lotNumber}`} />
                          {bid.timeRemaining && bid.auctionStatus === 'live' && (
                            <StatItem
                              label="Ends In"
                              value={
                                <span className="flex items-center gap-1.5 text-orange-600">
                                  <Clock className="h-3.5 w-3.5" />
                                  {getTimeRemaining(bid.timeRemaining)}
                                </span>
                              }
                              highlight
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {bid.notes && (
                      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          Notes
                        </h3>
                        <p className="text-sm">{bid.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-muted/20">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Pending Approval Actions */}
                      {isPendingApproval && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => onApprove?.(bid)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDecline?.(bid)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      )}

                      {/* Active/Winning Bid Actions */}
                      {isActiveOrWinning && (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <Trophy className="mr-2 h-4 w-4" />
                                Mark Won
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                              <DropdownMenuLabel className="text-xs">Won Results</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onMarkWon?.(bid, 'bid_accepted')}>
                                <Trophy className="mr-2 h-4 w-4 text-emerald-600" />
                                Bid Accepted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onMarkWon?.(bid, 'contract')}>
                                <Handshake className="mr-2 h-4 w-4 text-emerald-600" />
                                Contract
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onMarkWon?.(bid, 'contract_nego')}>
                                <MessageSquare className="mr-2 h-4 w-4 text-emerald-600" />
                                Contract by Nego
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark Lost
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                              <DropdownMenuLabel className="text-xs">Lost Results</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onSoldToOthers?.(bid)}>
                                <Users className="mr-2 h-4 w-4 text-red-600" />
                                Sold to Others
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onMarkUnsold?.(bid)}>
                                <CircleSlash className="mr-2 h-4 w-4 text-orange-600" />
                                Unsold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="text-xs">Other</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onCancelBid?.(bid)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Bid Canceled
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAuctionCancelled?.(bid)}>
                                <Ban className="mr-2 h-4 w-4" />
                                Auction Cancelled
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileQuestion className="mr-2 h-4 w-4" />
                                Result
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Unknown
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}

                      {/* Won Bid Actions */}
                      {isWon && onCreateInvoice && (
                        <Button size="sm" onClick={() => onCreateInvoice(bid)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Button>
                      )}

                      {/* Increase Bid */}
                      {canIncreaseBid && onIncreaseBid && (
                        <Button size="sm" variant="outline" onClick={() => onIncreaseBid(bid)}>
                          <Gavel className="mr-2 h-4 w-4" />
                          Increase Bid
                        </Button>
                      )}
                    </div>

                    <Button variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

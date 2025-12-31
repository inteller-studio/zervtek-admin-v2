import type { Bid } from '../data/bids'

// Filter state types
export interface BidsFilterState {
  selectedStatuses: Bid['status'][]
  selectedTypes: Bid['type'][]
  selectedBidderTypes: Bid['bidder']['type'][]
  selectedAuctionStatuses: Bid['auctionStatus'][]
  amountRange: [number, number]
  onlyWinning: boolean
}

// Sort options
export type SortOption = 'recent' | 'oldest' | 'amount-high' | 'amount-low' | 'ending-soon'

// View mode
export type ViewMode = 'table' | 'cards'

// Bid action types for won dialog
export type BidActionType = 'bid_accepted' | 'contract' | 'contract_nego'

// Tab options
export type BidTab = 'all' | 'pending' | 'active' | 'outbid' | 'won' | 'lost' | 'declined'

// Dialog state
export interface DialogState {
  type: 'view' | 'unsold' | 'soldToOthers' | 'won' | 'approve' | 'decline' | 'customer' | 'invoice' | null
  bid: Bid | null
  wonType?: BidActionType
}

// Visible date item
export interface VisibleDate {
  date: Date
  label: string
  dayNum: string
}

// Constants
export const DEFAULT_AMOUNT_RANGE: [number, number] = [0, 30000000]
export const DEFAULT_ITEMS_PER_PAGE = 20
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100]

export const UNIQUE_STATUSES: Bid['status'][] = [
  'pending_approval',
  'active',
  'outbid',
  'winning',
  'won',
  'lost',
  'retracted',
  'expired',
  'declined',
]

export const UNIQUE_TYPES: Bid['type'][] = ['manual', 'assisted']

export const UNIQUE_BIDDER_TYPES: Bid['bidder']['type'][] = ['individual', 'dealer', 'corporate']

export const UNIQUE_AUCTION_STATUSES: Bid['auctionStatus'][] = ['live', 'upcoming', 'ended']

// Helper functions
export function getStatusVariant(status: string): string {
  switch (status) {
    case 'pending_approval':
      return 'amber'
    case 'active':
      return 'blue'
    case 'winning':
      return 'green'
    case 'outbid':
      return 'orange'
    case 'won':
      return 'emerald'
    case 'lost':
      return 'zinc'
    case 'retracted':
      return 'red'
    case 'expired':
      return 'zinc'
    case 'declined':
      return 'rose'
    default:
      return 'zinc'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending_approval':
      return 'Pending'
    case 'declined':
      return 'Declined'
    default:
      return status
  }
}

export function getTimeRemaining(endTime: Date): string {
  const now = new Date()
  const diffMs = endTime.getTime() - now.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return 'Ended'
  }
}

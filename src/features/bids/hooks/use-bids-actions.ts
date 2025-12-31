import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { Bid } from '../data/bids'
import type { BidActionType, DialogState } from '../types'
import type { Customer, UserLevel } from '@/features/customers/data/customers'

export interface BidsDialogState {
  viewBid: { open: boolean; bid: Bid | null }
  unsold: { open: boolean; bid: Bid | null; price: string; negoStartPrice: string }
  soldToOthers: { open: boolean; bid: Bid | null; price: string }
  won: { open: boolean; bid: Bid | null; price: string; type: BidActionType }
  customer: { open: boolean; customer: Customer | null }
  approve: { open: boolean; bid: Bid | null }
  decline: { open: boolean; bid: Bid | null }
  createInvoice: { open: boolean; bid: Bid | null }
}

const initialDialogState: BidsDialogState = {
  viewBid: { open: false, bid: null },
  unsold: { open: false, bid: null, price: '', negoStartPrice: '' },
  soldToOthers: { open: false, bid: null, price: '' },
  won: { open: false, bid: null, price: '', type: 'bid_accepted' },
  customer: { open: false, customer: null },
  approve: { open: false, bid: null },
  decline: { open: false, bid: null },
  createInvoice: { open: false, bid: null },
}

export function useBidsActions() {
  const [dialogState, setDialogState] = useState<BidsDialogState>(initialDialogState)

  // View bid
  const handleViewBid = useCallback((bid: Bid) => {
    setDialogState((prev) => ({
      ...prev,
      viewBid: { open: true, bid },
    }))
  }, [])

  const closeViewBid = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      viewBid: { open: false, bid: null },
    }))
  }, [])

  // Unsold dialog
  const handleMarkUnsold = useCallback((bid: Bid) => {
    setDialogState((prev) => ({
      ...prev,
      unsold: { open: true, bid, price: '', negoStartPrice: '' },
    }))
  }, [])

  const setUnsoldPrice = useCallback((price: string) => {
    setDialogState((prev) => ({
      ...prev,
      unsold: { ...prev.unsold, price },
    }))
  }, [])

  const setUnsoldNegoPrice = useCallback((negoStartPrice: string) => {
    setDialogState((prev) => ({
      ...prev,
      unsold: { ...prev.unsold, negoStartPrice },
    }))
  }, [])

  const confirmUnsold = useCallback(() => {
    const { bid, price, negoStartPrice } = dialogState.unsold
    if (bid) {
      const priceText = price ? ` at ¥${Number(price).toLocaleString()}` : ''
      const negoText = negoStartPrice ? ` (Nego starts: ¥${Number(negoStartPrice).toLocaleString()})` : ''
      toast.success(`Bid ${bid.bidNumber}: Unsold${priceText}${negoText}`)
      setDialogState((prev) => ({
        ...prev,
        unsold: initialDialogState.unsold,
        viewBid: { open: false, bid: null },
      }))
    }
  }, [dialogState.unsold])

  const closeUnsold = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      unsold: initialDialogState.unsold,
    }))
  }, [])

  // Sold to others dialog
  const handleSoldToOthers = useCallback((bid: Bid) => {
    setDialogState((prev) => ({
      ...prev,
      soldToOthers: { open: true, bid, price: '' },
    }))
  }, [])

  const setSoldToOthersPrice = useCallback((price: string) => {
    setDialogState((prev) => ({
      ...prev,
      soldToOthers: { ...prev.soldToOthers, price },
    }))
  }, [])

  const confirmSoldToOthers = useCallback(() => {
    const { bid, price } = dialogState.soldToOthers
    if (bid) {
      const priceText = price ? ` at ¥${Number(price).toLocaleString()}` : ''
      toast.success(`Bid ${bid.bidNumber}: Sold to Others${priceText}`)
      setDialogState((prev) => ({
        ...prev,
        soldToOthers: initialDialogState.soldToOthers,
        viewBid: { open: false, bid: null },
      }))
    }
  }, [dialogState.soldToOthers])

  const closeSoldToOthers = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      soldToOthers: initialDialogState.soldToOthers,
    }))
  }, [])

  // Won dialog
  const handleMarkWon = useCallback((bid: Bid, type: BidActionType) => {
    setDialogState((prev) => ({
      ...prev,
      won: { open: true, bid, price: bid.amount.toString(), type },
    }))
  }, [])

  const setWonPrice = useCallback((price: string) => {
    setDialogState((prev) => ({
      ...prev,
      won: { ...prev.won, price },
    }))
  }, [])

  const confirmWon = useCallback(() => {
    const { bid, price, type } = dialogState.won
    if (bid) {
      const typeLabels = {
        bid_accepted: 'Bid Accepted',
        contract: 'Contract',
        contract_nego: 'Contract by Nego',
      }
      const priceText = price ? ` at ¥${Number(price).toLocaleString()}` : ''
      toast.success(`Bid ${bid.bidNumber}: ${typeLabels[type]}${priceText}`)
      setDialogState((prev) => ({
        ...prev,
        won: initialDialogState.won,
        viewBid: { open: false, bid: null },
      }))
    }
  }, [dialogState.won])

  const closeWon = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      won: initialDialogState.won,
    }))
  }, [])

  // Customer modal
  const handleViewCustomer = useCallback((bid: Bid) => {
    const customer: Customer = {
      id: bid.bidder.id,
      name: bid.bidder.name,
      email: bid.bidder.email,
      phone: '',
      country: bid.bidder.location,
      city: '',
      address: '',
      status: 'active',
      totalPurchases: 0,
      totalSpent: 0,
      totalBids: 0,
      wonAuctions: 0,
      lostAuctions: 0,
      activeBids: 0,
      verificationStatus:
        bid.bidder.level === 'verified' ||
        bid.bidder.level === 'premium' ||
        bid.bidder.level === 'business' ||
        bid.bidder.level === 'business_premium'
          ? 'verified'
          : 'pending',
      depositAmount: bid.bidder.depositAmount,
      outstandingBalance: 0,
      userLevel: bid.bidder.level as UserLevel,
      preferredLanguage: 'en',
      tags: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      loginCount: 0,
      failedLoginAttempts: 0,
      riskLevel: 'low',
      savedAddresses: [],
      paymentMethods: [],
      twoFactorEnabled: false,
      activeSessions: [],
      verificationDocuments: [],
    }
    setDialogState((prev) => ({
      ...prev,
      customer: { open: true, customer },
    }))
  }, [])

  const closeCustomer = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      customer: { open: false, customer: null },
    }))
  }, [])

  // Approve/Decline dialogs
  const handleApprove = useCallback((bid: Bid) => {
    setDialogState((prev) => ({
      ...prev,
      approve: { open: true, bid },
    }))
  }, [])

  const confirmApprove = useCallback(() => {
    const { bid } = dialogState.approve
    if (bid) {
      toast.success(`Bid ${bid.bidNumber} approved successfully`)
      setDialogState((prev) => ({
        ...prev,
        approve: initialDialogState.approve,
      }))
    }
  }, [dialogState.approve])

  const closeApprove = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      approve: initialDialogState.approve,
    }))
  }, [])

  const handleDecline = useCallback((bid: Bid) => {
    setDialogState((prev) => ({
      ...prev,
      decline: { open: true, bid },
    }))
  }, [])

  const confirmDecline = useCallback(() => {
    const { bid } = dialogState.decline
    if (bid) {
      toast.success(`Bid ${bid.bidNumber} declined`)
      setDialogState((prev) => ({
        ...prev,
        decline: initialDialogState.decline,
      }))
    }
  }, [dialogState.decline])

  const closeDecline = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      decline: initialDialogState.decline,
    }))
  }, [])

  // Create invoice
  const openCreateInvoice = useCallback((bid?: Bid) => {
    setDialogState((prev) => ({
      ...prev,
      createInvoice: { open: true, bid: bid || null },
    }))
  }, [])

  const closeCreateInvoice = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      createInvoice: { open: false, bid: null },
    }))
  }, [])

  return {
    dialogState,
    // View bid
    handleViewBid,
    closeViewBid,
    // Unsold
    handleMarkUnsold,
    setUnsoldPrice,
    setUnsoldNegoPrice,
    confirmUnsold,
    closeUnsold,
    // Sold to others
    handleSoldToOthers,
    setSoldToOthersPrice,
    confirmSoldToOthers,
    closeSoldToOthers,
    // Won
    handleMarkWon,
    setWonPrice,
    confirmWon,
    closeWon,
    // Customer
    handleViewCustomer,
    closeCustomer,
    // Approve/Decline
    handleApprove,
    confirmApprove,
    closeApprove,
    handleDecline,
    confirmDecline,
    closeDecline,
    // Create invoice
    openCreateInvoice,
    closeCreateInvoice,
  }
}

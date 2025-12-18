'use client'

import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type WonAuction } from '../data/won-auctions'
import { type WonAuctionsDialogType, type WonAuctionsDialogTypeBase, type PurchaseModalMode } from '../types'

type WonAuctionsContextType = {
  open: WonAuctionsDialogType
  setOpen: (type: WonAuctionsDialogType) => void
  currentRow: WonAuction | null
  setCurrentRow: React.Dispatch<React.SetStateAction<WonAuction | null>>
  initialMode: PurchaseModalMode
  setInitialMode: React.Dispatch<React.SetStateAction<PurchaseModalMode>>
}

const WonAuctionsContext = React.createContext<WonAuctionsContextType | null>(null)

export function WonAuctionsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<WonAuctionsDialogTypeBase>(null)
  const [currentRow, setCurrentRow] = useState<WonAuction | null>(null)
  const [initialMode, setInitialMode] = useState<PurchaseModalMode>('overview')

  return (
    <WonAuctionsContext value={{ open, setOpen, currentRow, setCurrentRow, initialMode, setInitialMode }}>
      {children}
    </WonAuctionsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWonAuctions = () => {
  const context = React.useContext(WonAuctionsContext)

  if (!context) {
    throw new Error('useWonAuctions must be used within <WonAuctionsProvider>')
  }

  return context
}

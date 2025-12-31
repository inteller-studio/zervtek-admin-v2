'use client'

import { use } from 'react'
import { PurchaseDetailPage } from '@/features/won-auctions/components/purchase-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PurchasePage({ params }: PageProps) {
  const { id } = use(params)
  return <PurchaseDetailPage auctionId={id} />
}

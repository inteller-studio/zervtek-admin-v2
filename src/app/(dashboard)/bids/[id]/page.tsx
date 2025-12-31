'use client'

import { use } from 'react'
import { BidDetailPage } from '@/features/bids/components/bid-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BidPage({ params }: PageProps) {
  const { id } = use(params)
  return <BidDetailPage bidId={id} />
}

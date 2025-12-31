'use client'

import { use } from 'react'
import { InquiryDetailPage } from '@/features/leads/components/inquiry-detail-page'

export default function LeadsInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <InquiryDetailPage id={id} />
}

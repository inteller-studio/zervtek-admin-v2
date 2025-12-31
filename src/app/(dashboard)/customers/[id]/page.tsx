'use client'

import { use } from 'react'
import { CustomerDetailPage } from '@/features/customers/components/customer-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CustomerPage({ params }: PageProps) {
  const { id } = use(params)
  return <CustomerDetailPage customerId={id} />
}

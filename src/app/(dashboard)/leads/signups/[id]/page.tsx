'use client'

import { use } from 'react'
import { SignupDetailPage } from '@/features/leads/components/signup-detail-page'

export default function LeadsSignupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <SignupDetailPage id={id} />
}

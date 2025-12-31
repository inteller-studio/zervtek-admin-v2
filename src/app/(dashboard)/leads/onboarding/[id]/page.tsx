'use client'

import { use } from 'react'
import { OnboardingDetailPage } from '@/features/leads/components/onboarding-detail-page'

export default function LeadsOnboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <OnboardingDetailPage id={id} />
}

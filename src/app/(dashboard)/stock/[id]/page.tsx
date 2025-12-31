'use client'

import { use } from 'react'
import { VehicleDetailPage } from '@/features/stock-vehicles/components/vehicle-detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function StockVehiclePage({ params }: PageProps) {
  const { id } = use(params)
  return <VehicleDetailPage vehicleId={id} />
}

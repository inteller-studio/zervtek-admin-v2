'use client'

import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type WonAuction, type Document } from '../data/won-auctions'
import { DOCUMENT_TYPE_LABELS } from '../types'

// Required documents based on auction status
const getRequiredDocuments = (status: WonAuction['status']): Document['type'][] => {
  const baseDocuments: Document['type'][] = ['invoice']

  switch (status) {
    case 'payment_pending':
      return baseDocuments
    case 'processing':
    case 'documents_pending':
      return [...baseDocuments, 'export_certificate', 'inspection']
    case 'shipping':
      return [
        ...baseDocuments,
        'export_certificate',
        'inspection',
        'bill_of_lading',
        'insurance',
      ]
    case 'delivered':
    case 'completed':
      return [
        ...baseDocuments,
        'export_certificate',
        'inspection',
        'bill_of_lading',
        'insurance',
      ]
    default:
      return baseDocuments
  }
}

interface DocumentChecklistProps {
  auction: WonAuction
  compact?: boolean
}

export function DocumentChecklist({ auction, compact = false }: DocumentChecklistProps) {
  const requiredDocs = getRequiredDocuments(auction.status)
  const existingDocTypes = auction.documents.map((d) => d.type)

  const completedCount = requiredDocs.filter((doc) => existingDocTypes.includes(doc)).length
  const totalRequired = requiredDocs.length
  const allComplete = completedCount === totalRequired

  if (compact) {
    return (
      <Badge
        variant={allComplete ? 'default' : 'outline'}
        className={allComplete ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
      >
        {completedCount}/{totalRequired} docs
      </Badge>
    )
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <h4 className='flex items-center gap-2 text-sm font-medium'>
          <AlertCircle className='h-4 w-4' />
          Required Documents
        </h4>
        <Badge variant={allComplete ? 'default' : 'secondary'}>
          {completedCount}/{totalRequired}
        </Badge>
      </div>
      <div className='space-y-1'>
        {requiredDocs.map((docType) => {
          const hasDocument = existingDocTypes.includes(docType)
          const uploadedDoc = auction.documents.find((d) => d.type === docType)

          return (
            <div key={docType} className='flex items-center justify-between py-1'>
              <div className='flex items-center gap-2'>
                {hasDocument ? (
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                ) : (
                  <Circle className='h-4 w-4 text-muted-foreground' />
                )}
                <span className='text-sm'>{DOCUMENT_TYPE_LABELS[docType]}</span>
              </div>
              {hasDocument ? (
                <Badge variant='outline' className='border-green-200 text-xs text-green-600'>
                  Uploaded
                </Badge>
              ) : (
                <Badge variant='outline' className='text-xs text-muted-foreground'>
                  <Clock className='mr-1 h-3 w-3' />
                  Pending
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { type WonAuction, type Document, type ShipmentTracking, type Payment } from '../data/won-auctions'
import { type PurchaseWorkflow } from '../types/workflow'
import { useWonAuctions } from './won-auctions-provider'
import { RecordPaymentDialog } from './dialogs/record-payment-dialog'
import { DocumentUploadDialog } from './dialogs/document-upload-dialog'
import { DocumentManagementDialog } from './dialogs/document-management-dialog'
import { ShippingUpdateDialog } from './dialogs/shipping-update-dialog'
import { InvoiceDialog } from './dialogs/invoice-dialog'
import { UnifiedPurchaseModal } from './unified-modal/unified-purchase-modal'

interface WonAuctionsDialogsProps {
  onRecordPayment: (auctionId: string, payment: Omit<Payment, 'id' | 'auctionId' | 'recordedBy' | 'recordedAt'>) => void
  onUploadDocuments: (auctionId: string, documents: Document[]) => void
  onUpdateShipping: (auctionId: string, shipment: ShipmentTracking) => void
  onDeleteDocument?: (auctionId: string, documentId: string) => void
  onWorkflowUpdate?: (auctionId: string, workflow: PurchaseWorkflow) => void
  onMarkDelivered?: (auction: WonAuction) => void
  onMarkCompleted?: (auction: WonAuction) => void
}

export function WonAuctionsDialogs({
  onRecordPayment,
  onUploadDocuments,
  onUpdateShipping,
  onDeleteDocument,
  onWorkflowUpdate,
  onMarkDelivered,
  onMarkCompleted,
}: WonAuctionsDialogsProps) {
  const { open, setOpen, currentRow, initialMode } = useWonAuctions()

  return (
    <>
      {/* Unified Purchase Modal - Combined detail and workflow */}
      <UnifiedPurchaseModal
        open={open === 'purchase'}
        onClose={() => setOpen(null)}
        auction={currentRow}
        initialMode={initialMode}
        onWorkflowUpdate={onWorkflowUpdate || (() => {})}
        onDocumentUpload={onUploadDocuments}
        onDocumentDelete={onDeleteDocument}
        onRecordPayment={() => setOpen('payment')}
        onUpdateShipping={() => setOpen('shipping')}
        onGenerateInvoice={() => setOpen('invoice')}
        onMarkDelivered={onMarkDelivered}
        onMarkCompleted={onMarkCompleted}
      />

      <RecordPaymentDialog
        open={open === 'payment'}
        onOpenChange={() => setOpen(open === 'payment' ? null : 'payment')}
        auction={currentRow}
        onSubmit={onRecordPayment}
      />

      <DocumentUploadDialog
        open={open === 'document-upload'}
        onOpenChange={() => setOpen(open === 'document-upload' ? null : 'document-upload')}
        auction={currentRow}
        onUpload={onUploadDocuments}
      />

      <DocumentManagementDialog
        open={open === 'documents'}
        onOpenChange={() => setOpen(open === 'documents' ? null : 'documents')}
        auction={currentRow}
        onUpload={(auctionId, files, type) => {
          // Convert files to documents
          const documents: Document[] = files.map((file) => ({
            id: String(Date.now() + Math.random()),
            name: file.name,
            type,
            uploadedAt: new Date(),
            uploadedBy: 'Current Admin',
            size: file.size,
            url: URL.createObjectURL(file),
          }))
          onUploadDocuments(auctionId, documents)
        }}
        onDelete={onDeleteDocument}
      />

      <ShippingUpdateDialog
        open={open === 'shipping'}
        onOpenChange={() => setOpen(open === 'shipping' ? null : 'shipping')}
        auction={currentRow}
        onSubmit={onUpdateShipping}
      />

      <InvoiceDialog
        open={open === 'invoice'}
        onOpenChange={() => setOpen(open === 'invoice' ? null : 'invoice')}
        auction={currentRow}
      />
    </>
  )
}

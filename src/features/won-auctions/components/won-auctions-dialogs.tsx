'use client'

import { type WonAuction, type Document, type ShipmentTracking, type Payment } from '../data/won-auctions'
import { useWonAuctions } from './won-auctions-provider'
import { RecordPaymentDialog } from './dialogs/record-payment-dialog'
import { DocumentUploadDialog } from './dialogs/document-upload-dialog'
import { DocumentManagementDialog } from './dialogs/document-management-dialog'
import { ShippingUpdateDialog } from './dialogs/shipping-update-dialog'
import { PurchaseDetailModal } from './dialogs/purchase-detail-modal'
import { InvoiceDialog } from './dialogs/invoice-dialog'

interface WonAuctionsDialogsProps {
  onRecordPayment: (auctionId: string, payment: Omit<Payment, 'id' | 'auctionId' | 'recordedBy' | 'recordedAt'>) => void
  onUploadDocuments: (auctionId: string, documents: Document[]) => void
  onUpdateShipping: (auctionId: string, shipment: ShipmentTracking) => void
  onDeleteDocument?: (auctionId: string, documentId: string) => void
}

export function WonAuctionsDialogs({
  onRecordPayment,
  onUploadDocuments,
  onUpdateShipping,
  onDeleteDocument,
}: WonAuctionsDialogsProps) {
  const { open, setOpen, currentRow } = useWonAuctions()

  return (
    <>
      <PurchaseDetailModal
        open={open === 'detail'}
        onClose={() => setOpen(null)}
        auction={currentRow}
        onRecordPayment={() => setOpen('payment')}
        onUploadDocuments={() => setOpen('document-upload')}
        onUpdateShipping={() => setOpen('shipping')}
        onGenerateInvoice={() => setOpen('invoice')}
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

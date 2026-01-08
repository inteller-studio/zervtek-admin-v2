'use client'

import { type Purchase, type Document, type ShipmentTracking, type Payment } from '../data/won-auctions'
import { type PurchaseWorkflow, type DocumentChecklist } from '../types/workflow'
import { useWonAuctions } from './won-auctions-provider'
import { RecordPaymentDialog } from './dialogs/record-payment-dialog'
import { DocumentUploadDialog } from './dialogs/document-upload-dialog'
import { DocumentManagementDialog } from './dialogs/document-management-dialog'
import { ShippingUpdateDialog } from './dialogs/shipping-update-dialog'
import { InvoiceDialog } from './dialogs/invoice-dialog'
import { ExportCertificateDialog } from './dialogs/export-certificate-dialog'
import { UnifiedPurchaseModal } from './unified-modal/unified-purchase-modal'
import { createDefaultWorkflow } from '../utils/workflow'

interface WonAuctionsDialogsProps {
  onRecordPayment: (auctionId: string, payment: Omit<Payment, 'id' | 'auctionId' | 'recordedBy' | 'recordedAt'>) => void
  onUploadDocuments: (auctionId: string, documents: Document[], checklistKey?: keyof DocumentChecklist) => void
  onUpdateShipping: (auctionId: string, shipment: ShipmentTracking) => void
  onDeleteDocument?: (auctionId: string, documentId: string) => void
  onWorkflowUpdate?: (auctionId: string, workflow: PurchaseWorkflow) => void
  onMarkDelivered?: (auction: Purchase) => void
  onMarkCompleted?: (auction: Purchase) => void
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
  const { open, setOpen, currentRow } = useWonAuctions()

  // Get the document checklist from workflow
  const workflow = currentRow?.workflow || createDefaultWorkflow()
  const documentChecklist = workflow.stages.documentsReceived.checklist

  return (
    <>
      {/* Unified Purchase Modal - Combined detail and workflow */}
      <UnifiedPurchaseModal
        open={open === 'purchase'}
        onClose={() => setOpen(null)}
        auction={currentRow}
        onWorkflowUpdate={onWorkflowUpdate || (() => {})}
        onDocumentUpload={onUploadDocuments}
        onDocumentDelete={onDeleteDocument}
        onRecordPayment={() => setOpen('payment')}
        onUpdateShipping={() => setOpen('shipping')}
        onGenerateInvoice={() => setOpen('invoice')}
        onOpenExportCertificate={() => setOpen('export-certificate')}
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
        documentChecklist={documentChecklist}
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

      <ExportCertificateDialog
        open={open === 'export-certificate'}
        onOpenChange={() => setOpen(open === 'export-certificate' ? null : 'export-certificate')}
        auction={currentRow}
        workflow={workflow}
        onWorkflowUpdate={(updatedWorkflow) => {
          if (currentRow && onWorkflowUpdate) {
            onWorkflowUpdate(currentRow.id, updatedWorkflow)
          }
        }}
        currentUser='Current Admin'
      />
    </>
  )
}

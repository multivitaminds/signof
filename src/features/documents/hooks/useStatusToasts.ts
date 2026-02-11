import { useEffect, useRef } from 'react'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useToast } from '../../../components/Toast/useToast'
import { STATUS_LABELS, type DocumentStatus } from '../../../types'
import type { ToastVariant } from '../../../components/Toast/types'

function getVariantForStatus(status: DocumentStatus): ToastVariant {
  switch (status) {
    case 'signed':
    case 'completed':
      return 'success'
    case 'declined':
    case 'voided':
      return 'warning'
    default:
      return 'info'
  }
}

function getDescriptionForStatus(status: DocumentStatus, docName: string): string {
  switch (status) {
    case 'sent':
      return `"${docName}" has been sent to recipients`
    case 'delivered':
      return `"${docName}" was delivered to all recipients`
    case 'viewed':
      return `"${docName}" has been viewed by recipients`
    case 'signed':
      return `"${docName}" has been signed`
    case 'completed':
      return `All signatures collected for "${docName}"`
    case 'declined':
      return `A signer declined "${docName}"`
    case 'voided':
      return `"${docName}" has been voided`
    default:
      return `"${docName}" status changed to ${STATUS_LABELS[status]}`
  }
}

/**
 * Monitors document status changes and shows toast notifications.
 * Skips initial load to avoid flooding on app open.
 */
export function useStatusToasts(): void {
  const { toast } = useToast()
  const documents = useDocumentStore((s) => s.documents)
  const prevStatusMapRef = useRef<Map<string, DocumentStatus> | null>(null)

  useEffect(() => {
    const currentMap = new Map<string, DocumentStatus>()
    for (const doc of documents) {
      currentMap.set(doc.id, doc.status)
    }

    // First render: populate map without toasting
    if (prevStatusMapRef.current === null) {
      prevStatusMapRef.current = currentMap
      return
    }

    const prevMap = prevStatusMapRef.current

    for (const doc of documents) {
      const prevStatus = prevMap.get(doc.id)
      if (prevStatus !== undefined && prevStatus !== doc.status) {
        toast({
          title: STATUS_LABELS[doc.status],
          description: getDescriptionForStatus(doc.status, doc.name),
          variant: getVariantForStatus(doc.status),
          duration: 4000,
        })
      }
    }

    prevStatusMapRef.current = currentMap
  }, [documents, toast])
}

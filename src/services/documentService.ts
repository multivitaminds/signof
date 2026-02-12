import { api } from '../lib/api'
import { useDocumentStore } from '../stores/useDocumentStore'
import type { Document, PricingTableData, DocumentField, SigningOrder } from '../types'

function isApiEnabled(): boolean {
  return Boolean(import.meta.env.VITE_API_URL)
}

export const documentService = {
  async list(): Promise<Document[]> {
    if (!isApiEnabled()) {
      return useDocumentStore.getState().documents
    }
    const res = await api.get<Document[]>('/documents')
    return res.data
  },

  async get(docId: string): Promise<Document | undefined> {
    if (!isApiEnabled()) {
      return useDocumentStore.getState().getDocument(docId)
    }
    const res = await api.get<Document>(`/documents/${docId}`)
    return res.data
  },

  async upload(file: File): Promise<Document> {
    if (!isApiEnabled()) {
      return useDocumentStore.getState().addDocument(file)
    }
    const res = await api.upload<Document>('/documents', file)
    return res.data
  },

  async sign(docId: string, dataUrl: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().signDocument(docId, dataUrl)
      return
    }
    await api.post(`/documents/${docId}/sign`, { dataUrl })
  },

  async signAsSigner(docId: string, signerId: string, dataUrl: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().signAsSigner(docId, signerId, dataUrl)
      return
    }
    await api.post(`/documents/${docId}/signers/${signerId}/sign`, { dataUrl })
  },

  async delete(docId: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().deleteDocument(docId)
      return
    }
    await api.del(`/documents/${docId}`)
  },

  async send(docId: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().sendDocument(docId)
      return
    }
    await api.post(`/documents/${docId}/send`)
  },

  async addSigner(docId: string, name: string, email: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().addSigner(docId, name, email)
      return
    }
    await api.post(`/documents/${docId}/signers`, { name, email })
  },

  async removeSigner(docId: string, signerId: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().removeSigner(docId, signerId)
      return
    }
    await api.del(`/documents/${docId}/signers/${signerId}`)
  },

  async updatePricingTable(docId: string, data: PricingTableData): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().updatePricingTable(docId, data)
      return
    }
    await api.put(`/documents/${docId}/pricing-table`, data)
  },

  async setSigningOrder(docId: string, order: SigningOrder): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().setSigningOrder(docId, order)
      return
    }
    await api.put(`/documents/${docId}/signing-order`, { order })
  },

  async setExpiration(docId: string, date: string | null): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().setDocumentExpiration(docId, date)
      return
    }
    await api.put(`/documents/${docId}/expiration`, { date })
  },

  async decline(docId: string, signerId: string, reason: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().declineDocument(docId, signerId, reason)
      return
    }
    await api.post(`/documents/${docId}/signers/${signerId}/decline`, { reason })
  },

  async addNote(docId: string, content: string, authorName?: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().addDocumentNote(docId, content, authorName)
      return
    }
    await api.post(`/documents/${docId}/notes`, { content, authorName })
  },

  async deleteNote(docId: string, noteId: string): Promise<void> {
    if (!isApiEnabled()) {
      useDocumentStore.getState().deleteDocumentNote(docId, noteId)
      return
    }
    await api.del(`/documents/${docId}/notes/${noteId}`)
  },

  async createFromBuilder(params: {
    file: File
    signers: { name: string; email: string }[]
    fields: DocumentField[]
    signingOrder: SigningOrder
    message?: string
  }): Promise<Document> {
    if (!isApiEnabled()) {
      return useDocumentStore.getState().createDocumentFromBuilder(params)
    }
    const res = await api.upload<Document>('/documents/build', params.file, {
      signers: JSON.stringify(params.signers),
      fields: JSON.stringify(params.fields),
      signingOrder: params.signingOrder,
      ...(params.message ? { message: params.message } : {}),
    })
    return res.data
  },

  async bulkCreate(
    templateDoc: Document,
    recipients: { name: string; email: string }[],
  ): Promise<Document[]> {
    if (!isApiEnabled()) {
      return useDocumentStore.getState().bulkCreateDocuments(templateDoc, recipients)
    }
    const res = await api.post<Document[]>('/documents/bulk', {
      templateDocId: templateDoc.id,
      recipients,
    })
    return res.data
  },
}

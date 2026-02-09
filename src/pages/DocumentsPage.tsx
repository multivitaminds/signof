import { useState, useCallback } from 'react'
import Dashboard from '../components/Dashboard/Dashboard'
import DocumentUpload from '../components/DocumentUpload/DocumentUpload'
import SignaturePad from '../components/SignaturePad/SignaturePad'
import { useDocumentStore } from '../stores/useDocumentStore'
import { type Document } from '../types'
import './DocumentsPage.css'

type ModalView = 'none' | 'upload' | 'sign' | 'view'

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument, signDocument, getDocument } =
    useDocumentStore()
  const [modalView, setModalView] = useState<ModalView>('none')
  const [signingDocId, setSigningDocId] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)

  const handleNewDocument = useCallback(() => {
    setModalView('upload')
  }, [])

  const handleUpload = useCallback(
    (file: File) => {
      addDocument(file)
      setModalView('none')
    },
    [addDocument]
  )

  const handleSign = useCallback((docId: string) => {
    setSigningDocId(docId)
    setModalView('sign')
  }, [])

  const handleSaveSignature = useCallback(
    (dataUrl: string) => {
      if (!signingDocId) return
      signDocument(signingDocId, dataUrl)
      setModalView('none')
      setSigningDocId(null)
    },
    [signingDocId, signDocument]
  )

  const handleDelete = useCallback(
    (docId: string) => {
      deleteDocument(docId)
    },
    [deleteDocument]
  )

  const handleView = useCallback(
    (docId: string) => {
      const doc = getDocument(docId)
      if (doc) {
        setViewingDoc(doc)
        setModalView('view')
      }
    },
    [getDocument]
  )

  const closeModal = useCallback(() => {
    setModalView('none')
    setSigningDocId(null)
    setViewingDoc(null)
  }, [])

  return (
    <div className="documents-page">
      <Dashboard
        documents={documents}
        onNewDocument={handleNewDocument}
        onSign={handleSign}
        onDelete={handleDelete}
        onView={handleView}
      />

      {modalView === 'upload' && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Upload Document"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <DocumentUpload onUpload={handleUpload} onCancel={closeModal} />
          </div>
        </div>
      )}

      {modalView === 'sign' && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Sign Document"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sign Document</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p className="sign-instruction">
              Draw your signature below to sign this document.
            </p>
            <SignaturePad onSave={handleSaveSignature} onCancel={closeModal} />
          </div>
        </div>
      )}

      {modalView === 'view' && viewingDoc && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={viewingDoc.name}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewingDoc.name}</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="view-details">
              <div className="view-row">
                <span className="view-label">Status</span>
                <span className={`status-badge status-${viewingDoc.status}`}>
                  {viewingDoc.status}
                </span>
              </div>
              <div className="view-row">
                <span className="view-label">Created</span>
                <span>
                  {new Date(viewingDoc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="view-row">
                <span className="view-label">Type</span>
                <span>{viewingDoc.fileType}</span>
              </div>
              {viewingDoc.signers.length > 0 && (
                <div className="view-signers">
                  <span className="view-label">Signers</span>
                  <ul>
                    {viewingDoc.signers.map((s) => (
                      <li key={s.id}>
                        {s.name} — <em>{s.status}</em>
                        {s.signedAt &&
                          ` (${new Date(s.signedAt).toLocaleDateString()})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viewingDoc.signatures.length > 0 && (
                <div className="view-signatures">
                  <span className="view-label">Signatures</span>
                  <div className="signature-images">
                    {viewingDoc.signatures.map((sig, i) => (
                      <img
                        key={`sig-${sig.signerId}-${i}`}
                        src={sig.dataUrl}
                        alt={`Signature ${i + 1}`}
                        className="signature-preview"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="view-actions">
              <button className="btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

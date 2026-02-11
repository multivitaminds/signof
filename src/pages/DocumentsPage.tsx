import { useState, useCallback } from 'react'
import Dashboard from '../components/Dashboard/Dashboard'
import DocumentUpload from '../components/DocumentUpload/DocumentUpload'
import SignaturePad from '../components/SignaturePad/SignaturePad'
import AddSigners from '../components/AddSigners/AddSigners'
import SigningCeremony from '../features/documents/components/SigningCeremony/SigningCeremony'
import CompletionCertificate from '../features/documents/components/CompletionCertificate/CompletionCertificate'
import AuditTrailPanel from '../features/documents/components/AuditTrailPanel/AuditTrailPanel'
import AuditTimeline from '../components/AuditTimeline/AuditTimeline'
import { useDocumentStore } from '../stores/useDocumentStore'
import { useStatusToasts } from '../features/documents/hooks/useStatusToasts'
import { SignerStatus, type Document } from '../types'
import './DocumentsPage.css'

type ModalView = 'none' | 'upload' | 'sign' | 'view' | 'add-signers' | 'ceremony' | 'certificate' | 'audit'

export default function DocumentsPage() {
  const {
    documents,
    addDocument,
    deleteDocument,
    signDocument,
    signAsSigner,
    sendDocument,
    addSigner,
    removeSigner,
    getDocument,
  } = useDocumentStore()
  const [modalView, setModalView] = useState<ModalView>('none')
  const [signingDocId, setSigningDocId] = useState<string | null>(null)
  const [signingSignerId, setSigningSignerId] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [pendingUploadDocId, setPendingUploadDocId] = useState<string | null>(null)

  useStatusToasts()

  const handleViewAudit = useCallback(
    (docId: string) => {
      const doc = getDocument(docId)
      if (doc) {
        setViewingDoc(doc)
        setModalView('audit')
      }
    },
    [getDocument]
  )

  const handleNewDocument = useCallback(() => {
    setModalView('upload')
  }, [])

  const handleUpload = useCallback(
    (file: File) => {
      const doc = addDocument(file)
      setPendingUploadDocId(doc.id)
      setModalView('add-signers')
    },
    [addDocument]
  )

  const handleSign = useCallback(
    (docId: string) => {
      const doc = getDocument(docId)
      if (!doc) return
      const pendingSigner = doc.signers.find(
        (s) => s.status === SignerStatus.Pending
      )
      if (pendingSigner) {
        setSigningDocId(docId)
        setSigningSignerId(pendingSigner.id)
        setModalView('ceremony')
      } else {
        setSigningDocId(docId)
        setModalView('sign')
      }
    },
    [getDocument]
  )

  const handleCeremonyComplete = useCallback(
    (dataUrl: string) => {
      if (!signingDocId || !signingSignerId) return
      signAsSigner(signingDocId, signingSignerId, dataUrl)
      setModalView('none')
      setSigningDocId(null)
      setSigningSignerId(null)
    },
    [signingDocId, signingSignerId, signAsSigner]
  )

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

  const handleSend = useCallback(
    (docId: string) => {
      sendDocument(docId)
    },
    [sendDocument]
  )

  const handleCertificate = useCallback(
    (docId: string) => {
      const doc = getDocument(docId)
      if (doc) {
        setViewingDoc(doc)
        setModalView('certificate')
      }
    },
    [getDocument]
  )

  const handleAddSignerForUpload = useCallback(
    (name: string, email: string) => {
      if (!pendingUploadDocId) return
      addSigner(pendingUploadDocId, name, email)
    },
    [pendingUploadDocId, addSigner]
  )

  const handleRemoveSignerForUpload = useCallback(
    (signerId: string) => {
      if (!pendingUploadDocId) return
      removeSigner(pendingUploadDocId, signerId)
    },
    [pendingUploadDocId, removeSigner]
  )

  const handleSendFromSigners = useCallback(() => {
    if (!pendingUploadDocId) return
    sendDocument(pendingUploadDocId)
    setModalView('none')
    setPendingUploadDocId(null)
  }, [pendingUploadDocId, sendDocument])

  const handleSaveAsDraft = useCallback(() => {
    setModalView('none')
    setPendingUploadDocId(null)
  }, [])

  const closeModal = useCallback(() => {
    setModalView('none')
    setSigningDocId(null)
    setSigningSignerId(null)
    setViewingDoc(null)
    setPendingUploadDocId(null)
  }, [])

  return (
    <div className="documents-page">
      <Dashboard
        documents={documents}
        onNewDocument={handleNewDocument}
        onSign={handleSign}
        onDelete={handleDelete}
        onView={handleView}
        onSend={handleSend}
        onCertificate={handleCertificate}
        onViewAudit={handleViewAudit}
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

      {modalView === 'add-signers' && pendingUploadDocId && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Add Signers"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Signers</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <AddSigners
              document={getDocument(pendingUploadDocId)!}
              onAddSigner={handleAddSignerForUpload}
              onRemoveSigner={handleRemoveSignerForUpload}
              onSend={handleSendFromSigners}
              onSaveDraft={handleSaveAsDraft}
            />
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

      {modalView === 'ceremony' && signingDocId && signingSignerId && (
        <SigningCeremony
          document={getDocument(signingDocId)!}
          signer={getDocument(signingDocId)!.signers.find(s => s.id === signingSignerId)!}
          onComplete={handleCeremonyComplete}
          onCancel={closeModal}
        />
      )}

      {modalView === 'certificate' && viewingDoc && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Completion Certificate"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Completion Certificate</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <CompletionCertificate document={viewingDoc} onClose={closeModal} />
          </div>
        </div>
      )}

      {modalView === 'audit' && viewingDoc && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Audit Trail"
        >
          <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()}>
            <AuditTrailPanel document={viewingDoc} onClose={closeModal} />
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
              {viewingDoc.audit.length > 0 && (
                <div className="view-audit">
                  <span className="view-label">Activity</span>
                  <AuditTimeline entries={viewingDoc.audit} />
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

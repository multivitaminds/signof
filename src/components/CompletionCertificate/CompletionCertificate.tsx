import React, { useCallback } from 'react';
import type { Document } from '../../types';
import './CompletionCertificate.css';

interface CompletionCertificateProps {
  document: Document;
  onClose: () => void;
}

const CompletionCertificate: React.FC<CompletionCertificateProps> = ({
  document: doc,
  onClose,
}) => {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const completionDate = (() => {
    const completedEntry = [...doc.audit]
      .reverse()
      .find((entry) => entry.action === 'completed');
    return completedEntry ? completedEntry.timestamp : doc.updatedAt;
  })();

  const getSignatureThumbnail = (signerId: string): string | null => {
    const sig = doc.signatures.find((s) => s.signerId === signerId);
    return sig ? sig.dataUrl : null;
  };

  return (
    <div className="completion-certificate">
      <div className="completion-certificate__border">
        <div className="completion-certificate__header">
          <p className="completion-certificate__brand">SignOf</p>
          <h1 className="completion-certificate__title">Certificate of Completion</h1>
        </div>

        <div className="completion-certificate__body">
          <p className="completion-certificate__document-name">{doc.name}</p>

          <table className="completion-certificate__signers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Signed Date</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              {doc.signers.map((signer) => {
                const thumbnail = getSignatureThumbnail(signer.id);
                return (
                  <tr key={signer.id}>
                    <td>{signer.name}</td>
                    <td>{signer.email}</td>
                    <td>
                      {signer.signedAt ? formatDate(signer.signedAt) : 'Not signed'}
                    </td>
                    <td>
                      {thumbnail ? (
                        <img
                          className="completion-certificate__signature-img"
                          src={thumbnail}
                          alt={`Signature of ${signer.name}`}
                        />
                      ) : (
                        <span className="completion-certificate__no-signature">
                          --
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="completion-certificate__completion-date">
            Completed on {formatDate(completionDate)}
          </p>
        </div>

        <div className="completion-certificate__actions">
          <button type="button" className="btn-primary" onClick={handlePrint}>
            Print / Download
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionCertificate;

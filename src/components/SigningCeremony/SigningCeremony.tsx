import React, { useState, useCallback } from 'react';
import SignaturePad from '../SignaturePad/SignaturePad';
import type { Document, Signer } from '../../types';
import './SigningCeremony.css';

interface SigningCeremonyProps {
  document: Document;
  signer: Signer;
  onComplete: (dataUrl: string) => void;
  onCancel: () => void;
}

const STEPS = ['Identity', 'Agreement', 'Sign', 'Confirmation'] as const;

const SigningCeremony: React.FC<SigningCeremonyProps> = ({
  document: doc,
  signer,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState('');
  const [signedTimestamp, setSignedTimestamp] = useState('');

  const handleContinue = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleAgreeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAgreed(e.target.checked);
    },
    [],
  );

  const handleSignatureSave = useCallback((dataUrl: string) => {
    setCapturedDataUrl(dataUrl);
    setSignedTimestamp(new Date().toISOString());
    setStep(3);
  }, []);

  const handleDone = useCallback(() => {
    onComplete(capturedDataUrl);
  }, [onComplete, capturedDataUrl]);

  const formatTimestamp = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString();
  };

  return (
    <div className="signing-ceremony">
      <div className="signing-ceremony__step-indicator" role="navigation" aria-label="Signing progress">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`signing-ceremony__step${
              i === step ? ' signing-ceremony__step--active' : ''
            }${i < step ? ' signing-ceremony__step--completed' : ''}`}
          >
            <span className="signing-ceremony__step-number">{i + 1}</span>
            <span className="signing-ceremony__step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="signing-ceremony__content">
        {step === 0 && (
          <div className="signing-ceremony__identity">
            <h2>Verify Your Identity</h2>
            <p className="signing-ceremony__identity-text">
              You are signing as <strong>{signer.name}</strong> ({signer.email})
            </p>
            <p className="signing-ceremony__document-name">
              Document: <strong>{doc.name}</strong>
            </p>
            <div className="signing-ceremony__actions">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleContinue}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="signing-ceremony__agreement">
            <h2>Electronic Signature Agreement</h2>
            <label className="signing-ceremony__checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={handleAgreeChange}
              />
              I agree to use electronic signatures for this document.
            </label>
            <p className="signing-ceremony__legal-text">
              By checking this box, you consent to sign this document electronically.
              Electronic signatures are legally binding under the ESIGN Act and UETA.
              You may request a paper copy at any time.
            </p>
            <div className="signing-ceremony__actions">
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleContinue}
                disabled={!agreed}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="signing-ceremony__sign">
            <h2>Sign the Document</h2>
            <SignaturePad onSave={handleSignatureSave} onCancel={onCancel} />
          </div>
        )}

        {step === 3 && (
          <div className="signing-ceremony__confirmation">
            <div className="signing-ceremony__checkmark">
              <span>&#10003;</span>
            </div>
            <h2>Document signed successfully!</h2>
            <p className="signing-ceremony__confirmation-detail">
              Signed by <strong>{signer.name}</strong>
            </p>
            <p className="signing-ceremony__confirmation-time">
              {formatTimestamp(signedTimestamp)}
            </p>
            <div className="signing-ceremony__actions">
              <button type="button" className="btn-primary" onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SigningCeremony;

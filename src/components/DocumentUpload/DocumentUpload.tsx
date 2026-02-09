import React, { useState, useRef, useCallback } from 'react';
import './DocumentUpload.css';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  onCancel?: () => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAcceptedTypes(types: string[]): string {
  return types
    .map((type) => {
      const ext = type.split('/')[1] ?? type;
      if (ext === 'jpeg') return 'JPG';
      return ext.toUpperCase();
    })
    .join(', ');
}

function DocumentUpload({
  onUpload,
  onCancel,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Accepted types: ${formatAcceptedTypes(acceptedTypes)}`;
      }
      if (file.size > maxSize) {
        return `File is too large. Maximum size: ${formatFileSize(maxSize)}`;
      }
      return null;
    },
    [acceptedTypes, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  }, [selectedFile, onUpload]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="document-upload">
      <div
        className={`document-upload__dropzone${dragOver ? ' document-upload__dropzone--active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleZoneClick();
          }
        }}
      >
        <div className="document-upload__icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4L14 16H20V28H28V16H34L24 4Z"
              fill="currentColor"
            />
            <path
              d="M8 34V40C8 41.1 8.9 42 10 42H38C39.1 42 40 41.1 40 40V34H36V38H12V34H8Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <p className="document-upload__prompt">
          Drag and drop a file here, or click to browse
        </p>
        <p className="document-upload__info">
          Accepted: {formatAcceptedTypes(acceptedTypes)} — Max size:{' '}
          {formatFileSize(maxSize)}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="document-upload__input"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          aria-label="Upload document"
        />
      </div>

      {error && (
        <p className="document-upload__error" role="alert">
          {error}
        </p>
      )}

      {selectedFile && (
        <div className="document-upload__file-info">
          <p className="document-upload__file-name">{selectedFile.name}</p>
          <p className="document-upload__file-size">
            {formatFileSize(selectedFile.size)}
          </p>
        </div>
      )}

      <div className="document-upload__actions">
        {selectedFile && (
          <>
            <button
              className="document-upload__btn document-upload__btn--upload"
              onClick={handleUpload}
            >
              Upload
            </button>
            <button
              className="document-upload__btn document-upload__btn--clear"
              onClick={handleClear}
            >
              Clear
            </button>
          </>
        )}
        {onCancel && (
          <button
            className="document-upload__btn document-upload__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default DocumentUpload;

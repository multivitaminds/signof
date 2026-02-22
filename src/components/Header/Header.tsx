import './Header.css'

interface HeaderProps {
  documentCount?: number
}

function Header({ documentCount }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="header-logo">OriginA</h1>
          <p className="header-tagline">Digital Signatures, Simplified</p>
        </div>
        {documentCount !== undefined && (
          <div className="header-doc-count" aria-label={`${documentCount} documents`}>
            <span className="header-doc-count-number">{documentCount}</span>
            <span className="header-doc-count-label">Documents</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

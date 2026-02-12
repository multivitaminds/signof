import { useState, useCallback, useMemo } from 'react'
import { X, Link2, Code, MousePointer, Check, Copy } from 'lucide-react'
import type { EventType } from '../../types'
import { EVENT_TYPE_COLORS } from '../../types'
import './ShareBooking.css'

interface ShareBookingProps {
  eventType: EventType
  isOpen: boolean
  onClose: () => void
}

type ShareTab = 'link' | 'embed' | 'button'

const TAB_CONFIG: Array<{ id: ShareTab; label: string; icon: typeof Link2 }> = [
  { id: 'link', label: 'Link', icon: Link2 },
  { id: 'embed', label: 'Embed', icon: Code },
  { id: 'button', label: 'Button', icon: MousePointer },
]

export default function ShareBooking({ eventType, isOpen, onClose }: ShareBookingProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('link')
  const [copied, setCopied] = useState<string | null>(null)
  const [buttonColor, setButtonColor] = useState(eventType.color)

  const bookingUrl = useMemo(
    () => `${window.location.origin}/book/${eventType.slug}`,
    [eventType.slug]
  )

  const embedCode = useMemo(
    () =>
      `<iframe src="${bookingUrl}" width="100%" height="700" frameborder="0"></iframe>`,
    [bookingUrl]
  )

  const buttonCode = useMemo(
    () =>
      `<a href="${bookingUrl}" style="display:inline-block;padding:12px 24px;background-color:${buttonColor};color:#fff;text-decoration:none;border-radius:8px;font-family:sans-serif;font-size:14px;font-weight:600;">Book a meeting</a>`,
    [bookingUrl, buttonColor]
  )

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback: select text for manual copy
    }
  }, [])

  const handleButtonColorChange = useCallback((color: string) => {
    setButtonColor(color)
  }, [])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content share-booking"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Share ${eventType.name}`}
      >
        <div className="modal-header">
          <h2>Share Booking Link</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="share-booking__tabs" role="tablist">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={`share-booking__tab${
                activeTab === id ? ' share-booking__tab--active' : ''
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="share-booking__body">
          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="share-booking__panel">
              <p className="share-booking__panel-desc">
                Share this link with people to let them book a time with you.
              </p>
              <div className="share-booking__url-row">
                <input
                  type="text"
                  className="share-booking__url-input"
                  value={bookingUrl}
                  readOnly
                  aria-label="Booking URL"
                />
                <button
                  className="btn-primary share-booking__copy-btn"
                  onClick={() => handleCopy(bookingUrl, 'link')}
                >
                  {copied === 'link' ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === 'embed' && (
            <div className="share-booking__panel">
              <p className="share-booking__panel-desc">
                Add this embed code to your website to show the booking widget inline.
              </p>
              <textarea
                className="share-booking__code-textarea"
                value={embedCode}
                readOnly
                rows={4}
                aria-label="Embed code"
              />
              <button
                className="btn-primary share-booking__copy-btn"
                onClick={() => handleCopy(embedCode, 'embed')}
              >
                {copied === 'embed' ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy Embed Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* Button Tab */}
          {activeTab === 'button' && (
            <div className="share-booking__panel">
              <p className="share-booking__panel-desc">
                Add a booking button to your website. Pick a color and copy the HTML.
              </p>
              <div className="share-booking__button-colors">
                <span className="share-booking__button-colors-label">Button color:</span>
                <div className="share-booking__button-color-row">
                  {EVENT_TYPE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`share-booking__button-color-btn${
                        buttonColor === c ? ' share-booking__button-color-btn--selected' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => handleButtonColorChange(c)}
                      aria-label={`Button color ${c}`}
                      aria-pressed={buttonColor === c}
                    />
                  ))}
                </div>
              </div>
              <div className="share-booking__button-preview">
                <span className="share-booking__button-preview-label">Preview:</span>
                <a
                  href={bookingUrl}
                  className="share-booking__button-demo"
                  style={{ backgroundColor: buttonColor }}
                  onClick={(e) => e.preventDefault()}
                >
                  Book a meeting
                </a>
              </div>
              <textarea
                className="share-booking__code-textarea"
                value={buttonCode}
                readOnly
                rows={3}
                aria-label="Button code"
              />
              <button
                className="btn-primary share-booking__copy-btn"
                onClick={() => handleCopy(buttonCode, 'button')}
              >
                {copied === 'button' ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy Button Code
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

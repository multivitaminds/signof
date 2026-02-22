import { useState, useCallback, useRef } from 'react'
import { Upload, X, Eye } from 'lucide-react'
import type { EventType } from '../../types'
import { EVENT_TYPE_COLORS } from '../../types'
import './BookingBranding.css'

interface BookingBrandingProps {
  eventType: EventType
  onUpdate: (updates: Partial<EventType>) => void
}

const PRESET_COLORS = EVENT_TYPE_COLORS

export default function BookingBranding({ eventType, onUpdate }: BookingBrandingProps) {
  const [customColor, setCustomColor] = useState(
    eventType.brandingAccentColor && !PRESET_COLORS.includes(eventType.brandingAccentColor)
      ? eventType.brandingAccentColor
      : ''
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accentColor = eventType.brandingAccentColor || eventType.color

  const handleCompanyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ brandingCompanyName: e.target.value })
    },
    [onUpdate]
  )

  const handleColorSelect = useCallback(
    (color: string) => {
      onUpdate({ brandingAccentColor: color })
    },
    [onUpdate]
  )

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      setCustomColor(color)
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        onUpdate({ brandingAccentColor: color })
      }
    },
    [onUpdate]
  )

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) return
      if (file.size > 2 * 1024 * 1024) return

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        onUpdate({ brandingLogo: dataUrl })
      }
      reader.readAsDataURL(file)
    },
    [onUpdate]
  )

  const handleRemoveLogo = useCallback(() => {
    onUpdate({ brandingLogo: undefined })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onUpdate])

  const handleHideOriginAChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ brandingHideOriginA: e.target.checked })
    },
    [onUpdate]
  )

  return (
    <div className="booking-branding">
      <div className="booking-branding__section">
        <h3 className="booking-branding__section-title">Branding</h3>
        <p className="booking-branding__section-desc">
          Customize how your booking page looks to invitees
        </p>
      </div>

      {/* Company Name */}
      <div className="booking-branding__field">
        <label className="booking-branding__label" htmlFor="branding-company-name">
          Company Name
        </label>
        <input
          id="branding-company-name"
          type="text"
          className="booking-branding__input"
          value={eventType.brandingCompanyName ?? ''}
          onChange={handleCompanyNameChange}
          placeholder="Your company name"
        />
      </div>

      {/* Accent Color */}
      <div className="booking-branding__field">
        <span className="booking-branding__label">Accent Color</span>
        <div className="booking-branding__colors" role="radiogroup" aria-label="Accent color">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`booking-branding__color-btn${
                accentColor === c ? ' booking-branding__color-btn--selected' : ''
              }`}
              style={{ backgroundColor: c }}
              onClick={() => handleColorSelect(c)}
              aria-label={`Color ${c}`}
              aria-pressed={accentColor === c}
            />
          ))}
        </div>
        <div className="booking-branding__custom-color">
          <label htmlFor="branding-custom-color" className="booking-branding__custom-color-label">
            Custom:
          </label>
          <input
            id="branding-custom-color"
            type="text"
            className="booking-branding__input booking-branding__input--small"
            value={customColor}
            onChange={handleCustomColorChange}
            placeholder="#000000"
            maxLength={7}
          />
          {customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor) && (
            <span
              className="booking-branding__color-preview"
              style={{ backgroundColor: customColor }}
            />
          )}
        </div>
      </div>

      {/* Logo Upload */}
      <div className="booking-branding__field">
        <span className="booking-branding__label">Logo</span>
        {eventType.brandingLogo ? (
          <div className="booking-branding__logo-preview">
            <img
              src={eventType.brandingLogo}
              alt="Company logo"
              className="booking-branding__logo-img"
            />
            <button
              type="button"
              className="booking-branding__logo-remove"
              onClick={handleRemoveLogo}
              aria-label="Remove logo"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="booking-branding__logo-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Upload Logo
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="booking-branding__file-input"
          onChange={handleLogoUpload}
          aria-label="Upload logo"
        />
      </div>

      {/* Hide OriginA branding */}
      <div className="booking-branding__field">
        <label className="booking-branding__checkbox-label">
          <input
            type="checkbox"
            checked={eventType.brandingHideOriginA ?? false}
            onChange={handleHideOriginAChange}
          />
          Hide &quot;Powered by OriginA&quot; footer
        </label>
      </div>

      {/* Preview */}
      <div className="booking-branding__field">
        <span className="booking-branding__label">
          <Eye size={14} />
          Preview
        </span>
        <div className="booking-branding__preview">
          <div
            className="booking-branding__preview-bar"
            style={{ backgroundColor: accentColor }}
          />
          <div className="booking-branding__preview-body">
            {eventType.brandingLogo && (
              <img
                src={eventType.brandingLogo}
                alt="Logo preview"
                className="booking-branding__preview-logo"
              />
            )}
            {eventType.brandingCompanyName && (
              <span className="booking-branding__preview-company">
                {eventType.brandingCompanyName}
              </span>
            )}
            <span className="booking-branding__preview-title">
              {eventType.name || 'Event Name'}
            </span>
          </div>
          {!eventType.brandingHideOriginA && (
            <div className="booking-branding__preview-footer">
              <span>Powered by</span>
              <strong>OriginA</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

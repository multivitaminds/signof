import { useCallback } from 'react'
import { useAppearanceStore } from '../stores/useAppearanceStore'
import type { Theme } from '../../../types'
import type { SidebarDensity, FontSize } from '../types'
import './AppearanceSettings.css'

const ACCENT_COLORS = [
  { color: '#4F46E5', label: 'Indigo' },
  { color: '#2563EB', label: 'Blue' },
  { color: '#059669', label: 'Green' },
  { color: '#7C3AED', label: 'Purple' },
  { color: '#DB2777', label: 'Pink' },
  { color: '#EA580C', label: 'Orange' },
  { color: '#DC2626', label: 'Red' },
  { color: '#0891B2', label: 'Teal' },
]

const THEMES: Array<{ value: Theme; label: string; description: string }> = [
  { value: 'system', label: 'System', description: 'Follow your OS setting' },
  { value: 'light', label: 'Light', description: 'Light background, dark text' },
  { value: 'dark', label: 'Dark', description: 'Dark background, light text' },
]

const DENSITIES: Array<{ value: SidebarDensity; label: string }> = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'spacious', label: 'Spacious' },
]

const FONT_SIZES: Array<{ value: FontSize; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
]

export default function AppearanceSettings() {
  const theme = useAppearanceStore((s) => s.theme)
  const setTheme = useAppearanceStore((s) => s.setTheme)
  const accentColor = useAppearanceStore((s) => s.accentColor)
  const setAccentColor = useAppearanceStore((s) => s.setAccentColor)
  const sidebarDensity = useAppearanceStore((s) => s.sidebarDensity)
  const setSidebarDensity = useAppearanceStore((s) => s.setSidebarDensity)
  const fontSize = useAppearanceStore((s) => s.fontSize)
  const setFontSize = useAppearanceStore((s) => s.setFontSize)

  const handleThemeChange = useCallback((value: Theme) => {
    setTheme(value)
  }, [setTheme])

  const handleAccentChange = useCallback((color: string) => {
    setAccentColor(color)
  }, [setAccentColor])

  const handleDensityChange = useCallback((density: SidebarDensity) => {
    setSidebarDensity(density)
  }, [setSidebarDensity])

  const handleFontSizeChange = useCallback((size: FontSize) => {
    setFontSize(size)
  }, [setFontSize])

  return (
    <div className="appearance-settings">
      <h1 className="appearance-settings__title">Appearance</h1>
      <p className="appearance-settings__subtitle">Customize the look and feel of your workspace</p>

      {/* Theme */}
      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Theme</h3>
        <div className="appearance-settings__theme-grid">
          {THEMES.map(({ value, label, description }) => (
            <button
              key={value}
              className={`appearance-settings__theme-card ${theme === value ? 'appearance-settings__theme-card--active' : ''}`}
              onClick={() => handleThemeChange(value)}
              aria-pressed={theme === value}
            >
              <span className="appearance-settings__theme-label">{label}</span>
              <span className="appearance-settings__theme-desc">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Accent Color</h3>
        <div className="appearance-settings__colors">
          {ACCENT_COLORS.map(({ color, label }) => (
            <button
              key={color}
              className={`appearance-settings__color-swatch ${accentColor === color ? 'appearance-settings__color-swatch--active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleAccentChange(color)}
              title={label}
              aria-label={`Set accent color to ${label}`}
              aria-pressed={accentColor === color}
            >
              {accentColor === color && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Density */}
      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Sidebar Density</h3>
        <div className="appearance-settings__segmented">
          {DENSITIES.map(({ value, label }) => (
            <button
              key={value}
              className={`appearance-settings__segmented-btn ${sidebarDensity === value ? 'appearance-settings__segmented-btn--active' : ''}`}
              onClick={() => handleDensityChange(value)}
              aria-pressed={sidebarDensity === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Font Size</h3>
        <div className="appearance-settings__segmented">
          {FONT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              className={`appearance-settings__segmented-btn ${fontSize === value ? 'appearance-settings__segmented-btn--active' : ''}`}
              onClick={() => handleFontSizeChange(value)}
              aria-pressed={fontSize === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Preview</h3>
        <div className="appearance-settings__preview" data-testid="appearance-preview">
          <div className="appearance-settings__preview-sidebar" data-density={sidebarDensity}>
            <div className="appearance-settings__preview-sidebar-item appearance-settings__preview-sidebar-item--active" style={{ borderLeftColor: accentColor }}>
              Dashboard
            </div>
            <div className="appearance-settings__preview-sidebar-item">Documents</div>
            <div className="appearance-settings__preview-sidebar-item">Projects</div>
          </div>
          <div className="appearance-settings__preview-content">
            <div className="appearance-settings__preview-heading" data-font-size={fontSize}>
              Preview Heading
            </div>
            <div className="appearance-settings__preview-text" data-font-size={fontSize}>
              This is how your content will look with the current settings.
              The accent color, font size, and density are reflected here.
            </div>
            <button
              className="appearance-settings__preview-button"
              style={{ backgroundColor: accentColor }}
              type="button"
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

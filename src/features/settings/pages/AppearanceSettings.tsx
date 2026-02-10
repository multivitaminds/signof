import { useAppStore } from '../../../stores/useAppStore'
import type { Theme } from '../../../stores/useAppStore'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import './AppearanceSettings.css'

const ACCENT_COLORS = [
  { color: '#4F46E5', label: 'Indigo' },
  { color: '#059669', label: 'Emerald' },
  { color: '#D97706', label: 'Amber' },
  { color: '#DC2626', label: 'Red' },
  { color: '#7C3AED', label: 'Violet' },
  { color: '#0891B2', label: 'Cyan' },
  { color: '#DB2777', label: 'Pink' },
  { color: '#2563EB', label: 'Blue' },
]

export default function AppearanceSettings() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const accentColor = useAppStore((s) => s.accentColor)
  const setAccentColor = useAppStore((s) => s.setAccentColor)

  const themes: Array<{ value: Theme; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="appearance-settings">
      <h1 className="appearance-settings__title">Appearance</h1>
      <p className="appearance-settings__subtitle">Customize the look and feel of your workspace</p>

      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Theme</h3>
        <div className="appearance-settings__theme-grid">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`appearance-settings__theme-card ${theme === value ? 'appearance-settings__theme-card--active' : ''}`}
              onClick={() => setTheme(value)}
            >
              <Icon size={24} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="appearance-settings__section">
        <h3 className="appearance-settings__section-title">Accent Color</h3>
        <div className="appearance-settings__colors">
          {ACCENT_COLORS.map(({ color, label }) => (
            <button
              key={color}
              className={`appearance-settings__color-swatch ${accentColor === color ? 'appearance-settings__color-swatch--active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setAccentColor(color)}
              title={label}
              aria-label={`Set accent color to ${label}`}
            >
              {accentColor === color && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

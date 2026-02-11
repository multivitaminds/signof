import { useEffect, useCallback } from 'react'
import { useAppearanceStore } from '../features/settings/stores/useAppearanceStore'
import type { Theme } from '../types'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

const CYCLE_ORDER: readonly Theme[] = ['light', 'dark', 'system'] as const

export function useTheme() {
  const theme = useAppearanceStore((s) => s.theme)
  const setTheme = useAppearanceStore((s) => s.setTheme)
  const accentColor = useAppearanceStore((s) => s.accentColor)

  const resolvedTheme = resolveTheme(theme)

  // Sync data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  // Sync accent color CSS variable
  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--color-primary', accentColor)
      // Compute a slightly darker hover variant
      document.documentElement.style.setProperty('--color-primary-hover', accentColor + 'dd')
    }
  }, [accentColor])

  // Listen for OS theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', getSystemTheme())
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const cycleTheme = useCallback(() => {
    const idx = CYCLE_ORDER.indexOf(theme)
    const nextIdx = (idx + 1) % CYCLE_ORDER.length
    setTheme(CYCLE_ORDER[nextIdx] ?? 'system')
  }, [theme, setTheme])

  return { theme, resolvedTheme, setTheme, cycleTheme } as const
}

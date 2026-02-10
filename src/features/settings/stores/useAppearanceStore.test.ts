import { useAppearanceStore } from './useAppearanceStore'

describe('useAppearanceStore', () => {
  beforeEach(() => {
    useAppearanceStore.setState({
      theme: 'system',
      accentColor: '#4F46E5',
      sidebarDensity: 'default',
      fontSize: 'default',
    })
  })

  it('has correct default values', () => {
    const state = useAppearanceStore.getState()
    expect(state.theme).toBe('system')
    expect(state.accentColor).toBe('#4F46E5')
    expect(state.sidebarDensity).toBe('default')
    expect(state.fontSize).toBe('default')
  })

  it('setTheme updates theme', () => {
    useAppearanceStore.getState().setTheme('dark')
    expect(useAppearanceStore.getState().theme).toBe('dark')
  })

  it('setTheme applies data-theme attribute for light/dark', () => {
    useAppearanceStore.getState().setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    useAppearanceStore.getState().setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('setTheme removes data-theme attribute for system', () => {
    useAppearanceStore.getState().setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    useAppearanceStore.getState().setTheme('system')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('setAccentColor updates accent color', () => {
    useAppearanceStore.getState().setAccentColor('#DC2626')
    expect(useAppearanceStore.getState().accentColor).toBe('#DC2626')
  })

  it('setAccentColor applies CSS custom property', () => {
    useAppearanceStore.getState().setAccentColor('#DC2626')
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#DC2626')
  })

  it('setSidebarDensity updates density', () => {
    useAppearanceStore.getState().setSidebarDensity('compact')
    expect(useAppearanceStore.getState().sidebarDensity).toBe('compact')
  })

  it('setSidebarDensity applies data-density attribute', () => {
    useAppearanceStore.getState().setSidebarDensity('spacious')
    expect(document.documentElement.getAttribute('data-density')).toBe('spacious')
  })

  it('setFontSize updates font size', () => {
    useAppearanceStore.getState().setFontSize('large')
    expect(useAppearanceStore.getState().fontSize).toBe('large')
  })

  it('setFontSize applies root font-size', () => {
    useAppearanceStore.getState().setFontSize('small')
    expect(document.documentElement.style.fontSize).toBe('14px')

    useAppearanceStore.getState().setFontSize('default')
    expect(document.documentElement.style.fontSize).toBe('16px')

    useAppearanceStore.getState().setFontSize('large')
    expect(document.documentElement.style.fontSize).toBe('18px')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppearanceSettings from './AppearanceSettings'

const mockSetTheme = vi.fn()
const mockSetAccentColor = vi.fn()
const mockSetSidebarDensity = vi.fn()
const mockSetFontSize = vi.fn()

vi.mock('../stores/useAppearanceStore', () => ({
  useAppearanceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      theme: 'system',
      accentColor: '#4F46E5',
      sidebarDensity: 'default',
      fontSize: 'default',
      setTheme: mockSetTheme,
      setAccentColor: mockSetAccentColor,
      setSidebarDensity: mockSetSidebarDensity,
      setFontSize: mockSetFontSize,
    }),
}))

describe('AppearanceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title and subtitle', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Customize the look and feel of your workspace')).toBeInTheDocument()
  })

  it('renders all theme options', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  it('renders all accent color swatches', () => {
    render(<AppearanceSettings />)
    expect(screen.getByLabelText('Set accent color to Indigo')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Blue')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Green')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Purple')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Pink')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Orange')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Red')).toBeInTheDocument()
    expect(screen.getByLabelText('Set accent color to Teal')).toBeInTheDocument()
  })

  it('renders sidebar density options', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText('Sidebar Density')).toBeInTheDocument()
    expect(screen.getByText('Compact')).toBeInTheDocument()
    // "Default" appears in multiple places so check its existence
    expect(screen.getAllByText('Default').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Spacious')).toBeInTheDocument()
  })

  it('renders font size options', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText('Font Size')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('renders the preview section', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByTestId('appearance-preview')).toBeInTheDocument()
    expect(screen.getByText('Preview Heading')).toBeInTheDocument()
    expect(screen.getByText('Sample Button')).toBeInTheDocument()
  })

  it('calls setTheme when a theme card is clicked', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)

    await user.click(screen.getByText('Dark'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setAccentColor when a color swatch is clicked', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)

    await user.click(screen.getByLabelText('Set accent color to Blue'))
    expect(mockSetAccentColor).toHaveBeenCalledWith('#2563EB')
  })

  it('calls setSidebarDensity when a density option is clicked', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)

    await user.click(screen.getByText('Compact'))
    expect(mockSetSidebarDensity).toHaveBeenCalledWith('compact')
  })

  it('calls setFontSize when a font size option is clicked', async () => {
    const user = userEvent.setup()
    render(<AppearanceSettings />)

    await user.click(screen.getByText('Large'))
    expect(mockSetFontSize).toHaveBeenCalledWith('large')
  })

  it('marks the current theme as active', () => {
    render(<AppearanceSettings />)
    // System is the active theme
    const systemButton = screen.getByText('System').closest('button')
    expect(systemButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('marks the current accent color as active', () => {
    render(<AppearanceSettings />)
    const indigoSwatch = screen.getByLabelText('Set accent color to Indigo')
    expect(indigoSwatch).toHaveAttribute('aria-pressed', 'true')
  })
})

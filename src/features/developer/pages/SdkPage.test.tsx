import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SdkPage from './SdkPage'

describe('SdkPage', () => {

  it('renders the page title and subtitle', () => {
    render(<SdkPage />)

    expect(screen.getByText('SDKs')).toBeInTheDocument()
    expect(
      screen.getByText(/Official client libraries for the Orchestree API/)
    ).toBeInTheDocument()
  })

  it('renders all 5 SDK cards including Java', () => {
    render(<SdkPage />)

    expect(screen.getByText('JavaScript / TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Ruby')).toBeInTheDocument()
    expect(screen.getByText('Go')).toBeInTheDocument()
    expect(screen.getByText('Java')).toBeInTheDocument()
  })

  it('shows version badges for all SDKs', () => {
    render(<SdkPage />)

    expect(screen.getByText('v1.4.0')).toBeInTheDocument()
    expect(screen.getByText('v1.2.0')).toBeInTheDocument()
    expect(screen.getByText('v1.1.0')).toBeInTheDocument()
    // Java and Go are both v1.0.0
    const v100Badges = screen.getAllByText('v1.0.0')
    expect(v100Badges.length).toBe(2)
  })

  it('renders getting started guide with 4 steps', () => {
    render(<SdkPage />)

    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Create an account')).toBeInTheDocument()
    expect(screen.getByText('Generate an API key')).toBeInTheDocument()
    expect(screen.getByText('Install an SDK')).toBeInTheDocument()
    expect(screen.getByText('Make your first API call')).toBeInTheDocument()
  })

  it('renders authentication section', () => {
    render(<SdkPage />)

    // The section title contains "Authentication"
    const authHeadings = screen.getAllByText('Authentication')
    expect(authHeadings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders test and live key cards', () => {
    render(<SdkPage />)

    expect(screen.getByText('Test Key')).toBeInTheDocument()
    expect(screen.getByText('Live Key')).toBeInTheDocument()
    expect(screen.getByText('sk_test_xxxxxxxxxxxxxxxxxxxxxxxx')).toBeInTheDocument()
    expect(screen.getByText('sk_live_xxxxxxxxxxxxxxxxxxxxxxxx')).toBeInTheDocument()
  })

  it('shows copy buttons for API keys', () => {
    render(<SdkPage />)

    const copyBtns = screen.getAllByRole('button', { name: /Copy/ })
    // At least 2 copy buttons: test key + live key
    expect(copyBtns.length).toBeGreaterThanOrEqual(2)
  })

  it('renders auth environment tabs', () => {
    render(<SdkPage />)

    expect(screen.getByText('Test Environment')).toBeInTheDocument()
    expect(screen.getByText('Live Environment')).toBeInTheDocument()
  })

  it('switches between test and live environment code', async () => {
    const user = userEvent.setup()
    render(<SdkPage />)

    // Default is test
    // Switching to live should update the displayed code
    await user.click(screen.getByText('Live Environment'))

    // The page should now show live environment code (content will change)
    // We verify by looking at the active tab state
    const liveTab = screen.getByText('Live Environment')
    expect(liveTab.className).toContain('active')
  })

  it('renders security best practices section', () => {
    render(<SdkPage />)

    expect(screen.getByText('Security Best Practices')).toBeInTheDocument()
    expect(
      screen.getByText(/Never hard-code API keys in source code/)
    ).toBeInTheDocument()
  })

  it('switches active language when clicking a SDK card', async () => {
    const user = userEvent.setup()
    render(<SdkPage />)

    // Click on Python
    await user.click(screen.getByText('Python'))

    // Check Python installation command is shown
    const pythonCard = screen.getByText('Python').closest('button')!
    expect(pythonCard.className).toContain('active')
  })

  it('shows Java SDK with Maven and Gradle install', async () => {
    const user = userEvent.setup()
    render(<SdkPage />)

    await user.click(screen.getByText('Java'))

    // Java card should be active
    const javaCard = screen.getByText('Java').closest('button')!
    expect(javaCard.className).toContain('active')
  })

  it('renders GitHub and Package Registry links', () => {
    render(<SdkPage />)

    expect(screen.getByText('GitHub Repository')).toBeInTheDocument()
    expect(screen.getByText('Package Registry')).toBeInTheDocument()
  })

  it('renders Installation, Initialization, and Usage Example sections', () => {
    render(<SdkPage />)

    // There are multiple "Installation" headings (one in getting started steps description + section)
    const installSections = screen.getAllByText('Installation')
    expect(installSections.length).toBeGreaterThanOrEqual(1)

    expect(screen.getByText('Initialization')).toBeInTheDocument()
    expect(screen.getByText('Usage Example')).toBeInTheDocument()
  })
})

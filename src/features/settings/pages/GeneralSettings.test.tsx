import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GeneralSettings from './GeneralSettings'

const mockUpdateWorkspace = vi.fn()

vi.mock('../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      workspace: {
        name: 'Test Workspace',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'America/New_York',
      },
      updateWorkspace: mockUpdateWorkspace,
    }),
}))

describe('GeneralSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page title and subtitle', () => {
    render(<GeneralSettings />)
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Manage your workspace settings')).toBeInTheDocument()
  })

  it('renders the workspace name input with current value', () => {
    render(<GeneralSettings />)
    const input = screen.getByDisplayValue('Test Workspace')
    expect(input).toBeInTheDocument()
  })

  it('renders language, date format, and timezone selects', () => {
    render(<GeneralSettings />)
    expect(screen.getByText('Workspace Name')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Date Format')).toBeInTheDocument()
    expect(screen.getByText('Timezone')).toBeInTheDocument()
  })

  it('renders the Danger Zone section', () => {
    render(<GeneralSettings />)
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    expect(screen.getByText('Delete Workspace')).toBeInTheDocument()
  })

  it('calls updateWorkspace when language is changed', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const languageSelect = screen.getByDisplayValue('English')
    await user.selectOptions(languageSelect, 'es')

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ language: 'es' })
  })

  it('calls updateWorkspace when date format is changed', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const dateFormatSelect = screen.getByDisplayValue('MM/DD/YYYY')
    await user.selectOptions(dateFormatSelect, 'YYYY-MM-DD')

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ dateFormat: 'YYYY-MM-DD' })
  })

  it('saves workspace name on blur', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const nameInput = screen.getByDisplayValue('Test Workspace')
    await user.clear(nameInput)
    await user.type(nameInput, 'New Workspace')
    await user.tab() // triggers blur

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ name: 'New Workspace' })
  })
})

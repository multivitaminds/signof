import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GeneralSettings from './GeneralSettings'

const mockUpdateWorkspace = vi.fn()

vi.mock('../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      workspace: {
        name: 'Test Workspace',
        slug: 'test-workspace',
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

  it('renders the workspace URL slug input', () => {
    render(<GeneralSettings />)
    expect(screen.getByText('Workspace URL')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-workspace')).toBeInTheDocument()
    expect(screen.getByText('orchestree.com/')).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Delete Workspace' })).toBeInTheDocument()
  })

  it('renders a Save button for workspace name', () => {
    render(<GeneralSettings />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('calls updateWorkspace when language is changed', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const languageSelect = screen.getByLabelText('Language')
    await user.selectOptions(languageSelect, 'es')

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ language: 'es' })
  })

  it('calls updateWorkspace when date format is changed', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const dateFormatSelect = screen.getByLabelText('Date format')
    await user.selectOptions(dateFormatSelect, 'YYYY-MM-DD')

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ dateFormat: 'YYYY-MM-DD' })
  })

  it('calls updateWorkspace when timezone is changed', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const timezoneSelect = screen.getByLabelText('Timezone')
    await user.selectOptions(timezoneSelect, 'Europe/London')

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ timezone: 'Europe/London' })
  })

  it('saves workspace name on blur', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const nameInput = screen.getByDisplayValue('Test Workspace')
    await user.clear(nameInput)
    await user.type(nameInput, 'New Workspace')
    await user.tab()

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ name: 'New Workspace' })
  })

  it('saves workspace name when Save button is clicked', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    const nameInput = screen.getByDisplayValue('Test Workspace')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Name')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockUpdateWorkspace).toHaveBeenCalledWith({ name: 'Updated Name' })
  })

  it('opens delete confirmation modal when Delete Workspace is clicked', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    // There's only one Delete Workspace button before modal opens
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete Workspace' })
    await user.click(deleteButtons[0]!)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/This will permanently delete/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Type workspace name to confirm deletion')).toBeInTheDocument()
  })

  it('disables the confirm delete button until workspace name is typed', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    await user.click(screen.getByRole('button', { name: 'Delete Workspace' }))

    const confirmButtons = screen.getAllByRole('button', { name: 'Delete Workspace' })
    const confirmButton = confirmButtons[confirmButtons.length - 1]
    expect(confirmButton).toBeDefined()
    if (confirmButton) {
      expect(confirmButton).toBeDisabled()
    }
  })

  it('enables the confirm delete button when workspace name matches', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    await user.click(screen.getByRole('button', { name: 'Delete Workspace' }))

    const confirmInput = screen.getByLabelText('Type workspace name to confirm deletion')
    await user.type(confirmInput, 'Test Workspace')

    const confirmButtons = screen.getAllByRole('button', { name: 'Delete Workspace' })
    const confirmButton = confirmButtons[confirmButtons.length - 1]
    expect(confirmButton).toBeDefined()
    if (confirmButton) {
      expect(confirmButton).not.toBeDisabled()
    }
  })

  it('closes delete modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    await user.click(screen.getByRole('button', { name: 'Delete Workspace' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

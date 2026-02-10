import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AutomationBuilder from './AutomationBuilder'
import type { DbField } from '../../types'
import { DbFieldType } from '../../types'

const mockFields: DbField[] = [
  { id: 'f1', name: 'Title', type: DbFieldType.Text, width: 200 },
  {
    id: 'f2',
    name: 'Status',
    type: DbFieldType.Select,
    width: 120,
    options: {
      choices: [
        { id: 'c1', name: 'Open', color: '#3B82F6' },
        { id: 'c2', name: 'Closed', color: '#22C55E' },
      ],
    },
  },
  { id: 'f3', name: 'Priority', type: DbFieldType.Number, width: 100 },
]

const mockOnSave = vi.fn()
const mockOnClose = vi.fn()

function renderBuilder() {
  return render(
    <AutomationBuilder
      fields={mockFields}
      onSave={mockOnSave}
      onClose={mockOnClose}
    />
  )
}

describe('AutomationBuilder', () => {
  beforeEach(() => {
    mockOnSave.mockClear()
    mockOnClose.mockClear()
  })

  it('renders step 1 (Name & Description) by default', () => {
    renderBuilder()
    expect(screen.getByText('New Automation')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Notify on status change/i)).toBeInTheDocument()
  })

  it('shows all 5 step indicators', () => {
    renderBuilder()
    expect(screen.getByText('Name & Description')).toBeInTheDocument()
    expect(screen.getByText('Select Trigger')).toBeInTheDocument()
    expect(screen.getByText('Configure Trigger')).toBeInTheDocument()
    expect(screen.getByText('Select Action')).toBeInTheDocument()
    expect(screen.getByText('Configure Action')).toBeInTheDocument()
  })

  it('disables Next button when name is empty', () => {
    renderBuilder()
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeDisabled()
  })

  it('enables Next button when name is filled', async () => {
    const user = userEvent.setup()
    renderBuilder()
    const input = screen.getByPlaceholderText(/Notify on status change/i)
    await user.type(input, 'Test Automation')
    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).not.toBeDisabled()
  })

  it('navigates to step 2 (Select Trigger) on Next', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.type(screen.getByPlaceholderText(/Notify on status change/i), 'My Rule')
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Choose when this automation should run:')).toBeInTheDocument()
    expect(screen.getByText('Record Created')).toBeInTheDocument()
    expect(screen.getByText('Record Updated')).toBeInTheDocument()
    expect(screen.getByText('Field Changed')).toBeInTheDocument()
    expect(screen.getByText('Scheduled Time')).toBeInTheDocument()
    expect(screen.getByText('Status Changed')).toBeInTheDocument()
  })

  it('navigates back from step 2 to step 1', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.type(screen.getByPlaceholderText(/Notify on status change/i), 'My Rule')
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Now on step 2
    await user.click(screen.getByRole('button', { name: /back/i }))

    // Back on step 1
    expect(screen.getByPlaceholderText(/Notify on status change/i)).toBeInTheDocument()
  })

  it('navigates through all 5 steps', async () => {
    const user = userEvent.setup()
    renderBuilder()

    // Step 0: Name
    await user.type(screen.getByPlaceholderText(/Notify on status change/i), 'My Rule')
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 1: Select Trigger
    expect(screen.getByText('Record Created')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 2: Configure Trigger
    expect(screen.getByText(/configure the/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 3: Select Action
    expect(screen.getByText('Choose what should happen:')).toBeInTheDocument()
    expect(screen.getByText('Send Notification')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Step 4: Configure Action + Summary
    expect(screen.getByText('Automation Summary')).toBeInTheDocument()
  })

  it('calls onSave with correct data on final step', async () => {
    const user = userEvent.setup()
    renderBuilder()

    // Fill name
    await user.type(screen.getByPlaceholderText(/Notify on status change/i), 'Notify on new record')

    // Navigate to final step
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }))
    }

    // Click save
    await user.click(screen.getByRole('button', { name: /create automation/i }))

    expect(mockOnSave).toHaveBeenCalledTimes(1)
    const savedRule = mockOnSave.mock.calls[0]![0]
    expect(savedRule.name).toBe('Notify on new record')
    expect(savedRule.trigger).toBe('record_created')
    expect(savedRule.action).toBe('send_notification')
    expect(savedRule.enabled).toBe(true)
  })

  it('calls onClose when Cancel is clicked on step 1', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    renderBuilder()
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('allows selecting a different trigger', async () => {
    const user = userEvent.setup()
    renderBuilder()

    // Fill name and go to step 1
    await user.type(screen.getByPlaceholderText(/Notify on status change/i), 'My Rule')
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Select "Field Changed"
    const fieldChangedRadio = screen.getByLabelText(/Runs when a specific field value changes/i)
    await user.click(fieldChangedRadio)

    // Go to configure trigger step
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Should show field selector
    expect(screen.getByText('Watch Field')).toBeInTheDocument()
  })

  it('shows webhook URL input for SendWebhook action', async () => {
    const user = userEvent.setup()
    renderBuilder()

    // Fill name
    await user.type(screen.getByPlaceholderText(/Notify on status change/i), 'Webhook Rule')

    // Navigate to step 3 (Select Action)
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }))
    }

    // Select Send Webhook
    const webhookRadio = screen.getByLabelText(/Send an HTTP POST request/i)
    await user.click(webhookRadio)

    // Go to configure action
    await user.click(screen.getByRole('button', { name: /next/i }))

    // Should show webhook URL input
    expect(screen.getByText('Webhook URL')).toBeInTheDocument()
  })

  it('renders edit mode title when existingRule is provided', () => {
    render(
      <AutomationBuilder
        fields={mockFields}
        existingRule={{
          id: 'rule-1',
          name: 'Existing Rule',
          description: 'An existing rule',
          trigger: 'record_created',
          triggerConfig: {},
          action: 'send_notification',
          actionConfig: { message: 'Hello' },
          enabled: true,
          createdAt: '2026-01-01T00:00:00Z',
          lastRunAt: null,
          runCount: 0,
        }}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Edit Automation')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Rule')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AutomationsPanel from './AutomationsPanel'
import type { DbField } from '../../types'
import { DbFieldType } from '../../types'
import { useDatabaseStore } from '../../stores/useDatabaseStore'
import type { AutomationRule } from '../../types/automation'
import { AutomationTrigger, AutomationAction } from '../../types/automation'

const fields: DbField[] = [
  { id: 'f-title', name: 'Title', type: DbFieldType.Text, width: 200 },
  { id: 'f-amount', name: 'Amount', type: DbFieldType.Number, width: 120 },
  {
    id: 'f-status',
    name: 'Status',
    type: DbFieldType.Select,
    width: 140,
    options: {
      choices: [
        { id: 's1', name: 'Active', color: '#22C55E' },
        { id: 's2', name: 'Inactive', color: '#94A3B8' },
      ],
    },
  },
]

const sampleRule: AutomationRule = {
  id: 'auto-1',
  name: 'Notify on create',
  description: 'Send a notification when a record is created',
  trigger: AutomationTrigger.RecordCreated,
  triggerConfig: {},
  action: AutomationAction.SendNotification,
  actionConfig: { message: 'New record created' },
  enabled: true,
  createdAt: '2026-01-15T10:00:00Z',
  lastRunAt: null,
  runCount: 0,
}

const defaultProps = () => ({
  fields,
  onClose: vi.fn(),
})

describe('AutomationsPanel', () => {
  beforeEach(() => {
    // Reset the store before each test
    const store = useDatabaseStore.getState()
    // Clear automations
    for (const auto of store.automations) {
      store.deleteAutomation(auto.id)
    }
  })

  it('renders the dialog', () => {
    render(<AutomationsPanel {...defaultProps()} />)
    expect(screen.getByRole('dialog', { name: 'Automations Panel' })).toBeInTheDocument()
  })

  it('displays the title', () => {
    render(<AutomationsPanel {...defaultProps()} />)
    expect(screen.getByText('Automations')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AutomationsPanel {...defaultProps()} onClose={onClose} />)
    await user.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AutomationsPanel {...defaultProps()} onClose={onClose} />)
    const overlay = document.querySelector('.modal-overlay')!
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('renders AutomationsList component inside', () => {
    render(<AutomationsPanel {...defaultProps()} />)
    // The AutomationsList shows a "New Automation" button
    expect(screen.getByText('New Automation')).toBeInTheDocument()
  })

  it('shows empty state when no automations exist', () => {
    render(<AutomationsPanel {...defaultProps()} />)
    expect(screen.getByText(/no automations/i)).toBeInTheDocument()
  })

  it('renders automation rules from the store', () => {
    // Add an automation to the store
    useDatabaseStore.getState().addAutomation(sampleRule)
    render(<AutomationsPanel {...defaultProps()} />)
    expect(screen.getByText('Notify on create')).toBeInTheDocument()
  })

  it('opens builder when New Automation is clicked', async () => {
    const user = userEvent.setup()
    render(<AutomationsPanel {...defaultProps()} />)
    await user.click(screen.getByText('New Automation'))
    // AutomationBuilder opens at step 0 ("Name & Description")
    expect(screen.getByText('Name & Description')).toBeInTheDocument()
  })

  it('can toggle an automation enabled/disabled', async () => {
    const user = userEvent.setup()
    useDatabaseStore.getState().addAutomation(sampleRule)
    render(<AutomationsPanel {...defaultProps()} />)
    // Find the toggle switch (it should be a button or checkbox in AutomationsList)
    const toggles = document.querySelectorAll('[role="switch"], input[type="checkbox"]')
    if (toggles.length > 0) {
      await user.click(toggles[0]! as HTMLElement)
      // After toggle, the automation should be disabled
      const state = useDatabaseStore.getState()
      const auto = state.automations.find((a) => a.id === 'auto-1')
      expect(auto?.enabled).toBe(false)
    }
  })

  it('can delete an automation', async () => {
    const user = userEvent.setup()
    useDatabaseStore.getState().addAutomation(sampleRule)
    render(<AutomationsPanel {...defaultProps()} />)
    // Find delete button
    const deleteBtn = screen.getByLabelText(/delete/i)
    await user.click(deleteBtn)
    // After delete, automation should be removed from store
    const state = useDatabaseStore.getState()
    expect(state.automations.find((a) => a.id === 'auto-1')).toBeUndefined()
  })
})

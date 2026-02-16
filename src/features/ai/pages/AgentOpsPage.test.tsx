import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useAgentRuntimeStore from '../stores/useAgentRuntimeStore'
import useMessageBusStore from '../stores/useMessageBusStore'
import useRepairStore from '../stores/useRepairStore'
import AgentOpsPage from './AgentOpsPage'

describe('AgentOpsPage', () => {
  beforeEach(() => {
    useAgentRuntimeStore.setState({
      deployedAgents: new Map(),
      approvalQueue: [],
    })
    useMessageBusStore.setState({
      messages: [],
    })
    useRepairStore.setState({
      repairs: [],
    })
  })

  it('renders all 4 tabs', () => {
    render(<AgentOpsPage />)
    expect(screen.getByText('Monitor')).toBeInTheDocument()
    expect(screen.getByText('Approvals')).toBeInTheDocument()
    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.getByText('Repairs')).toBeInTheDocument()
  })

  it('shows tab counts', () => {
    render(<AgentOpsPage />)
    // All counts should be 0 with empty state
    const counts = screen.getAllByText('0')
    expect(counts.length).toBeGreaterThanOrEqual(4)
  })

  it('defaults to Monitor tab', () => {
    render(<AgentOpsPage />)
    const monitorTab = screen.getByText('Monitor').closest('button')
    expect(monitorTab?.className).toContain('--active')
  })

  it('switches to Approvals tab on click', async () => {
    const user = userEvent.setup()
    render(<AgentOpsPage />)
    await user.click(screen.getByText('Approvals'))
    const approvalsTab = screen.getByText('Approvals').closest('button')
    expect(approvalsTab?.className).toContain('--active')
  })

  it('switches to Messages tab', async () => {
    const user = userEvent.setup()
    render(<AgentOpsPage />)
    await user.click(screen.getByText('Messages'))
    const messagesTab = screen.getByText('Messages').closest('button')
    expect(messagesTab?.className).toContain('--active')
  })

  it('switches to Repairs tab', async () => {
    const user = userEvent.setup()
    render(<AgentOpsPage />)
    await user.click(screen.getByText('Repairs'))
    const repairsTab = screen.getByText('Repairs').closest('button')
    expect(repairsTab?.className).toContain('--active')
  })
})

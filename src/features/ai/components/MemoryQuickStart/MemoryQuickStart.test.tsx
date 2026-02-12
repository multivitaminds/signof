import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemoryQuickStart from './MemoryQuickStart'
import { MEMORY_TEMPLATES } from '../../lib/memoryTemplates'

describe('MemoryQuickStart', () => {
  const onUseTemplate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the section title', () => {
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    expect(screen.getByText(/Quick Start/)).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    expect(screen.getByText(/Build your organization/)).toBeInTheDocument()
  })

  it('renders 8 template cards', () => {
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    const buttons = screen.getAllByRole('button', { name: /Use Template/i })
    expect(buttons).toHaveLength(8)
  })

  it('renders template titles', () => {
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    for (const template of MEMORY_TEMPLATES) {
      expect(screen.getByText(template.title)).toBeInTheDocument()
    }
  })

  it('renders template descriptions', () => {
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    for (const template of MEMORY_TEMPLATES) {
      expect(screen.getByText(template.description)).toBeInTheDocument()
    }
  })

  it('calls onUseTemplate with correct template id when clicking Use Template', async () => {
    const user = userEvent.setup()
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    const buttons = screen.getAllByRole('button', { name: /Use Template/i })
    await user.click(buttons[0]!)
    expect(onUseTemplate).toHaveBeenCalledWith(MEMORY_TEMPLATES[0]!.id)
  })

  it('calls onUseTemplate with the last template id', async () => {
    const user = userEvent.setup()
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    const buttons = screen.getAllByRole('button', { name: /Use Template/i })
    await user.click(buttons[buttons.length - 1]!)
    expect(onUseTemplate).toHaveBeenCalledWith(MEMORY_TEMPLATES[MEMORY_TEMPLATES.length - 1]!.id)
  })

  it('renders each card with a Use Template button', () => {
    render(<MemoryQuickStart onUseTemplate={onUseTemplate} />)
    const buttons = screen.getAllByRole('button', { name: /Use Template/i })
    expect(buttons).toHaveLength(MEMORY_TEMPLATES.length)
  })
})

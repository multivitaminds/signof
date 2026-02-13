import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPanel from './SettingsPanel'
import type { ConversationSettings } from '../../types'

function defaultSettings(): ConversationSettings {
  return { systemPrompt: '', temperature: 0.7, maxTokens: 4096, topP: 1, streaming: true, agentMode: false }
}

describe('SettingsPanel', () => {
  it('renders all setting controls', () => {
    render(<SettingsPanel settings={defaultSettings()} onUpdate={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('System Prompt')).toBeInTheDocument()
    expect(screen.getByLabelText('Temperature')).toBeInTheDocument()
    expect(screen.getByLabelText('Max Tokens')).toBeInTheDocument()
    expect(screen.getByLabelText('Top P')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<SettingsPanel settings={defaultSettings()} onUpdate={vi.fn()} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close settings' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onUpdate when reset button clicked', async () => {
    const onUpdate = vi.fn()
    const user = userEvent.setup()
    render(<SettingsPanel settings={defaultSettings()} onUpdate={onUpdate} onClose={vi.fn()} />)
    await user.click(screen.getByText('Reset to Defaults'))
    expect(onUpdate).toHaveBeenCalledWith({
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      streaming: true,
    })
  })
})

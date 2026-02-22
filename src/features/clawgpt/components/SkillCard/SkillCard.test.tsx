import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillCard from './SkillCard'
import type { Skill } from '../../types'

const mockSkill: Skill = {
  id: 'skill-1',
  name: 'Web Search',
  description: 'Search the web for real-time information',
  category: 'productivity',
  version: '1.2.0',
  author: 'OriginA',
  icon: 'S',
  installed: false,
  enabled: false,
  config: {},
  triggers: [],
  actions: [],
}

describe('SkillCard', () => {
  const defaultProps = {
    skill: mockSkill,
    onInstall: vi.fn(),
    onUninstall: vi.fn(),
    onToggle: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders skill name and description', () => {
    render(<SkillCard {...defaultProps} />)
    expect(screen.getByText('Web Search')).toBeInTheDocument()
    expect(screen.getByText('Search the web for real-time information')).toBeInTheDocument()
  })

  it('renders version badge', () => {
    render(<SkillCard {...defaultProps} />)
    expect(screen.getByText('1.2.0')).toBeInTheDocument()
  })

  it('renders author', () => {
    render(<SkillCard {...defaultProps} />)
    expect(screen.getByText('by OriginA')).toBeInTheDocument()
  })

  it('renders category pill', () => {
    render(<SkillCard {...defaultProps} />)
    expect(screen.getByText('Productivity')).toBeInTheDocument()
  })

  it('shows Install button when not installed', () => {
    render(<SkillCard {...defaultProps} />)
    expect(screen.getByText('Install')).toBeInTheDocument()
  })

  it('shows Uninstall button when installed', () => {
    const skill: Skill = { ...mockSkill, installed: true, enabled: true }
    render(<SkillCard {...defaultProps} skill={skill} />)
    expect(screen.getByText('Uninstall')).toBeInTheDocument()
  })

  it('calls onInstall when Install is clicked', async () => {
    const user = userEvent.setup()
    render(<SkillCard {...defaultProps} />)
    await user.click(screen.getByText('Install'))
    expect(defaultProps.onInstall).toHaveBeenCalledWith('skill-1')
  })

  it('calls onUninstall when Uninstall is clicked', async () => {
    const user = userEvent.setup()
    const skill: Skill = { ...mockSkill, installed: true, enabled: true }
    render(<SkillCard {...defaultProps} skill={skill} />)
    await user.click(screen.getByText('Uninstall'))
    expect(defaultProps.onUninstall).toHaveBeenCalledWith('skill-1')
  })

  it('shows toggle only when installed', () => {
    render(<SkillCard {...defaultProps} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('shows toggle when installed', () => {
    const skill: Skill = { ...mockSkill, installed: true, enabled: true }
    render(<SkillCard {...defaultProps} skill={skill} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('calls onToggle when toggle is clicked', async () => {
    const user = userEvent.setup()
    const skill: Skill = { ...mockSkill, installed: true, enabled: true }
    render(<SkillCard {...defaultProps} skill={skill} />)
    await user.click(screen.getByRole('checkbox'))
    expect(defaultProps.onToggle).toHaveBeenCalledWith('skill-1', false)
  })

  it('shows Disabled label when not enabled', () => {
    const skill: Skill = { ...mockSkill, installed: true, enabled: false }
    render(<SkillCard {...defaultProps} skill={skill} />)
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })
})

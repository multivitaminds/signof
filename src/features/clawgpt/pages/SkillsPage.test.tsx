import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SkillsPage from './SkillsPage'

const mockSkills = [
  { id: 'sk-1', name: 'Smart Reply', description: 'AI-powered replies', category: 'communication', version: '2.1.0', author: 'OriginA', installed: true, enabled: true, config: {}, icon: 'message-square', triggers: [], actions: [] },
  { id: 'sk-2', name: 'Sentiment Analysis', description: 'Detect sentiment', category: 'data', version: '1.4.0', author: 'OriginA', installed: true, enabled: true, config: {}, icon: 'activity', triggers: [], actions: [] },
  { id: 'sk-3', name: 'Calendar Sync', description: 'Book meetings from chat', category: 'productivity', version: '1.1.0', author: 'OriginA', installed: false, enabled: false, config: {}, icon: 'calendar', triggers: [], actions: [] },
  { id: 'sk-4', name: 'Report Generator', description: 'Create data reports', category: 'data', version: '2.0.0', author: 'OriginA', installed: false, enabled: false, config: {}, icon: 'bar-chart', triggers: [], actions: [] },
]

const mockInstallSkill = vi.fn()
const mockUninstallSkill = vi.fn()
const mockEnableSkill = vi.fn()
const mockDisableSkill = vi.fn()
const mockConfigureSkill = vi.fn()

vi.mock('../stores/useSkillStore', () => ({
  useSkillStore: vi.fn(() => ({
    skills: mockSkills,
    installSkill: mockInstallSkill,
    uninstallSkill: mockUninstallSkill,
    enableSkill: mockEnableSkill,
    disableSkill: mockDisableSkill,
    configureSkill: mockConfigureSkill,
  })),
}))

// Mock SkillCard with actual props: skill, onInstall, onUninstall, onToggle
vi.mock('../components/SkillCard/SkillCard', () => ({
  default: ({ skill }: { skill: { id: string; name: string; category: string } }) => (
    <div data-testid={`skill-card-${skill.id}`}>
      <span>{skill.name}</span>
    </div>
  ),
}))

// Mock SkillInstaller with actual props: skill, onSave, onCancel
vi.mock('../components/SkillInstaller/SkillInstaller', () => ({
  default: ({ skill, onCancel }: { skill: { id: string; name: string }; onSave: (config: Record<string, unknown>) => void; onCancel: () => void }) => (
    <div data-testid="skill-installer" role="dialog">
      <span>Installing {skill.name}</span>
      <button onClick={onCancel}>Close Installer</button>
    </div>
  ),
}))

vi.mock('../types', () => ({
  SKILL_CATEGORY_LABELS: {
    communication: 'Communication',
    data: 'Data',
    productivity: 'Productivity',
    creative: 'Creative',
    developer: 'Developer',
    custom: 'Custom',
  },
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <SkillsPage />
    </MemoryRouter>
  )
}

describe('SkillsPage', () => {
  it('renders all skill cards', () => {
    renderPage()
    expect(screen.getByTestId('skill-card-sk-1')).toBeInTheDocument()
    expect(screen.getByTestId('skill-card-sk-2')).toBeInTheDocument()
    expect(screen.getByTestId('skill-card-sk-3')).toBeInTheDocument()
    expect(screen.getByTestId('skill-card-sk-4')).toBeInTheDocument()
  })

  it('renders tab buttons', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Installed' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Available' })).toBeInTheDocument()
  })

  it('All tab is active by default', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')
  })

  it('filters to installed skills only', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Installed' }))

    expect(screen.getByTestId('skill-card-sk-1')).toBeInTheDocument()
    expect(screen.getByTestId('skill-card-sk-2')).toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-3')).not.toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-4')).not.toBeInTheDocument()
  })

  it('filters to available skills only', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: 'Available' }))

    expect(screen.queryByTestId('skill-card-sk-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-2')).not.toBeInTheDocument()
    expect(screen.getByTestId('skill-card-sk-3')).toBeInTheDocument()
    expect(screen.getByTestId('skill-card-sk-4')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderPage()
    expect(screen.getByLabelText('Search skills')).toBeInTheDocument()
  })

  it('filters skills by search query', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Search skills'), 'sentiment')

    expect(screen.getByTestId('skill-card-sk-2')).toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-3')).not.toBeInTheDocument()
  })

  it('shows empty message when no skills match', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Search skills'), 'xyznonexistent')

    expect(screen.getByText('No skills match your filters.')).toBeInTheDocument()
  })

  it('renders category filter pills', () => {
    renderPage()
    // Categories present in our mock data: 'communication', 'data', 'productivity'
    expect(screen.getByRole('button', { name: 'Communication' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Data' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Productivity' })).toBeInTheDocument()
  })

  it('filters by category when pill is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Communication' }))

    expect(screen.getByTestId('skill-card-sk-1')).toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-2')).not.toBeInTheDocument()
    expect(screen.queryByTestId('skill-card-sk-3')).not.toBeInTheDocument()
  })

  it('toggles category filter off when clicked again', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Communication' }))
    expect(screen.queryByTestId('skill-card-sk-2')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Communication' }))
    expect(screen.getByTestId('skill-card-sk-2')).toBeInTheDocument()
  })
})

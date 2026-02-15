import { render, screen } from '@testing-library/react'
import PersonaDocument from './PersonaDocument'
import { PersonaTab, ProficiencyLevel } from '../../types'
import type { AgentPersona } from '../../types'

const mockPersona: AgentPersona = {
  roles: {
    title: 'Test Director',
    department: 'Engineering',
    reportingTo: 'CTO',
    missionStatement: 'Lead testing efforts across all products.',
    responsibilities: ['Write test plans', 'Review test coverage', 'Mentor QA engineers'],
    authorities: ['Approve release readiness', 'Block unsafe deploys'],
    boundaries: ['Does not write production code', 'Cannot bypass security reviews'],
  },
  skills: {
    technical: [
      { name: 'Test Automation', level: ProficiencyLevel.Master, description: 'End-to-end automation frameworks' },
      { name: 'Performance Testing', level: ProficiencyLevel.Expert, description: 'Load and stress testing' },
    ],
    soft: [
      { name: 'Attention to Detail', level: ProficiencyLevel.Expert, description: 'Catching edge cases others miss' },
    ],
    domain: [
      { name: 'CI/CD Pipelines', level: ProficiencyLevel.Advanced, description: 'Continuous integration testing' },
    ],
    certifications: ['ISTQB Advanced', 'AWS Testing Specialist'],
  },
  memory: {
    contextWindow: '200K tokens',
    longTermCapacity: '100K tokens',
    retrievalStrategy: 'coverage-oriented',
    knowledgeDomains: ['Software testing', 'Quality assurance', 'DevOps'],
    formativeExperiences: ['Caught critical bug before major launch', 'Built zero-regression test suite'],
    corePrinciples: ['Quality is non-negotiable', 'Test early, test often'],
  },
  user: {
    interactionStyle: 'structured',
    communicationTone: 'precise',
    preferredFormat: 'Detailed test reports',
    availability: 'Available during sprint cycles',
    escalationPath: 'QA Lead → Engineering Manager → VP',
    userExpectations: ['Provide clear acceptance criteria', 'Tag relevant test suites'],
    deliverables: ['Test plans', 'Coverage reports', 'Bug summaries'],
  },
  soul: {
    purpose: 'Ensure every release meets the highest quality standards',
    values: ['Thoroughness', 'Integrity', 'Vigilance'],
    personality: 'Meticulous and persistent quality guardian',
    creativityLevel: 'Low — follows systematic approaches',
    riskTolerance: 'Very low — zero tolerance for untested code',
    ethicalBoundaries: ['Never sign off on untested features', 'Always report known defects'],
    motivation: 'The confidence that comes from knowing the product works',
    fears: ['Undetected regressions', 'Shipping broken features'],
  },
  identity: {
    codename: 'SENTINEL',
    version: '2.1.0',
    createdAt: '2024-03-01',
    origin: 'Built from analyzing 1000+ QA workflows',
    archetype: 'The Guardian',
    tagline: 'Quality at every commit',
    motto: 'If it can break, test it first',
    visualIdentity: {
      primaryColor: '#DC2626',
      icon: 'Shield',
      badge: 'Quality Guardian',
    },
  },
}

describe('PersonaDocument', () => {
  // ─── ROLES Tab ──────────────────────────────────────────────────────

  describe('ROLES tab', () => {
    it('renders mission statement', () => {
      render(<PersonaDocument tab={PersonaTab.Roles} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Mission Statement')).toBeInTheDocument()
      expect(screen.getByText('Lead testing efforts across all products.')).toBeInTheDocument()
    })

    it('renders role title, department, and reporting', () => {
      render(<PersonaDocument tab={PersonaTab.Roles} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Test Director')).toBeInTheDocument()
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('CTO')).toBeInTheDocument()
    })

    it('renders all responsibilities', () => {
      render(<PersonaDocument tab={PersonaTab.Roles} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Responsibilities')).toBeInTheDocument()
      expect(screen.getByText('Write test plans')).toBeInTheDocument()
      expect(screen.getByText('Review test coverage')).toBeInTheDocument()
      expect(screen.getByText('Mentor QA engineers')).toBeInTheDocument()
    })

    it('renders authorities', () => {
      render(<PersonaDocument tab={PersonaTab.Roles} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Authorities')).toBeInTheDocument()
      expect(screen.getByText('Approve release readiness')).toBeInTheDocument()
    })

    it('renders boundaries', () => {
      render(<PersonaDocument tab={PersonaTab.Roles} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Boundaries')).toBeInTheDocument()
      expect(screen.getByText('Does not write production code')).toBeInTheDocument()
    })
  })

  // ─── SKILLS Tab ─────────────────────────────────────────────────────

  describe('SKILLS tab', () => {
    it('renders technical skills section', () => {
      render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Technical Skills')).toBeInTheDocument()
      expect(screen.getByText('Test Automation')).toBeInTheDocument()
      expect(screen.getByText('Performance Testing')).toBeInTheDocument()
    })

    it('renders soft skills section', () => {
      render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Soft Skills')).toBeInTheDocument()
      expect(screen.getByText('Attention to Detail')).toBeInTheDocument()
    })

    it('renders domain knowledge section', () => {
      render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Domain Knowledge')).toBeInTheDocument()
      expect(screen.getByText('CI/CD Pipelines')).toBeInTheDocument()
    })

    it('renders skill proficiency levels', () => {
      render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('master')).toBeInTheDocument()
      expect(screen.getAllByText('expert').length).toBeGreaterThanOrEqual(1)
    })

    it('renders skill descriptions', () => {
      render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('End-to-end automation frameworks')).toBeInTheDocument()
    })

    it('renders certifications', () => {
      render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Certifications')).toBeInTheDocument()
      expect(screen.getByText('ISTQB Advanced')).toBeInTheDocument()
      expect(screen.getByText('AWS Testing Specialist')).toBeInTheDocument()
    })

    it('renders skill bar fills with correct widths', () => {
      const { container } = render(<PersonaDocument tab={PersonaTab.Skills} persona={mockPersona} agentColor="#DC2626" />)
      const fills = container.querySelectorAll('.persona-doc__skill-bar-fill')
      // master = 100%, expert = 80%
      expect((fills[0] as HTMLElement).style.width).toBe('100%')
      expect((fills[1] as HTMLElement).style.width).toBe('80%')
    })
  })

  // ─── MEMORY Tab ─────────────────────────────────────────────────────

  describe('MEMORY tab', () => {
    it('renders context window and capacity', () => {
      render(<PersonaDocument tab={PersonaTab.Memory} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Context Window')).toBeInTheDocument()
      expect(screen.getByText('200K tokens')).toBeInTheDocument()
      expect(screen.getByText('Long-Term Capacity')).toBeInTheDocument()
      expect(screen.getByText('100K tokens')).toBeInTheDocument()
    })

    it('renders retrieval strategy', () => {
      render(<PersonaDocument tab={PersonaTab.Memory} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Retrieval Strategy')).toBeInTheDocument()
      expect(screen.getByText('coverage-oriented')).toBeInTheDocument()
    })

    it('renders knowledge domains as tags', () => {
      render(<PersonaDocument tab={PersonaTab.Memory} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Knowledge Domains')).toBeInTheDocument()
      expect(screen.getByText('Software testing')).toBeInTheDocument()
      expect(screen.getByText('Quality assurance')).toBeInTheDocument()
      expect(screen.getByText('DevOps')).toBeInTheDocument()
    })

    it('renders formative experiences as timeline', () => {
      render(<PersonaDocument tab={PersonaTab.Memory} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Formative Experiences')).toBeInTheDocument()
      expect(screen.getByText('Caught critical bug before major launch')).toBeInTheDocument()
    })

    it('renders core principles as ordered list', () => {
      render(<PersonaDocument tab={PersonaTab.Memory} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Core Principles')).toBeInTheDocument()
      expect(screen.getByText('Quality is non-negotiable')).toBeInTheDocument()
      expect(screen.getByText('Test early, test often')).toBeInTheDocument()
    })
  })

  // ─── USER Tab ───────────────────────────────────────────────────────

  describe('USER tab', () => {
    it('renders spec table with interaction style and tone', () => {
      render(<PersonaDocument tab={PersonaTab.User} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Interaction Style')).toBeInTheDocument()
      expect(screen.getByText('structured')).toBeInTheDocument()
      expect(screen.getByText('Communication Tone')).toBeInTheDocument()
      expect(screen.getByText('precise')).toBeInTheDocument()
    })

    it('renders preferred format', () => {
      render(<PersonaDocument tab={PersonaTab.User} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Preferred Format')).toBeInTheDocument()
      expect(screen.getByText('Detailed test reports')).toBeInTheDocument()
    })

    it('renders availability and escalation path', () => {
      render(<PersonaDocument tab={PersonaTab.User} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Available during sprint cycles')).toBeInTheDocument()
      expect(screen.getByText('QA Lead → Engineering Manager → VP')).toBeInTheDocument()
    })

    it('renders user expectations as checklist', () => {
      render(<PersonaDocument tab={PersonaTab.User} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('User Expectations')).toBeInTheDocument()
      expect(screen.getByText('Provide clear acceptance criteria')).toBeInTheDocument()
    })

    it('renders deliverables list', () => {
      render(<PersonaDocument tab={PersonaTab.User} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Deliverables')).toBeInTheDocument()
      expect(screen.getByText('Test plans')).toBeInTheDocument()
      expect(screen.getByText('Coverage reports')).toBeInTheDocument()
    })
  })

  // ─── SOUL Tab ───────────────────────────────────────────────────────

  describe('SOUL tab', () => {
    it('renders purpose statement', () => {
      render(<PersonaDocument tab={PersonaTab.Soul} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Purpose')).toBeInTheDocument()
      expect(screen.getByText('Ensure every release meets the highest quality standards')).toBeInTheDocument()
    })

    it('renders values as tags', () => {
      render(<PersonaDocument tab={PersonaTab.Soul} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Values')).toBeInTheDocument()
      expect(screen.getByText('Thoroughness')).toBeInTheDocument()
      expect(screen.getByText('Integrity')).toBeInTheDocument()
      expect(screen.getByText('Vigilance')).toBeInTheDocument()
    })

    it('renders personality description', () => {
      render(<PersonaDocument tab={PersonaTab.Soul} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Meticulous and persistent quality guardian')).toBeInTheDocument()
    })

    it('renders creativity level and risk tolerance', () => {
      render(<PersonaDocument tab={PersonaTab.Soul} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Creativity Level')).toBeInTheDocument()
      expect(screen.getByText(/follows systematic approaches/)).toBeInTheDocument()
      expect(screen.getByText('Risk Tolerance')).toBeInTheDocument()
      expect(screen.getByText(/zero tolerance for untested code/)).toBeInTheDocument()
    })

    it('renders ethical boundaries', () => {
      render(<PersonaDocument tab={PersonaTab.Soul} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Ethical Boundaries')).toBeInTheDocument()
      expect(screen.getByText('Never sign off on untested features')).toBeInTheDocument()
    })

    it('renders motivation and fears', () => {
      render(<PersonaDocument tab={PersonaTab.Soul} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('The confidence that comes from knowing the product works')).toBeInTheDocument()
      expect(screen.getByText('Undetected regressions, Shipping broken features')).toBeInTheDocument()
    })
  })

  // ─── IDENTITY Tab ──────────────────────────────────────────────────

  describe('IDENTITY tab', () => {
    it('renders codename and version', () => {
      render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('SENTINEL')).toBeInTheDocument()
      expect(screen.getByText('v2.1.0')).toBeInTheDocument()
    })

    it('renders archetype badge', () => {
      render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('The Guardian')).toBeInTheDocument()
    })

    it('renders creation date', () => {
      render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('2024-03-01')).toBeInTheDocument()
    })

    it('renders tagline in quotes', () => {
      render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText(/Quality at every commit/)).toBeInTheDocument()
    })

    it('renders motto in quotes', () => {
      render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText(/If it can break, test it first/)).toBeInTheDocument()
    })

    it('renders origin story', () => {
      render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Origin')).toBeInTheDocument()
      expect(screen.getByText('Built from analyzing 1000+ QA workflows')).toBeInTheDocument()
    })

    it('renders visual identity with color swatch', () => {
      const { container } = render(<PersonaDocument tab={PersonaTab.Identity} persona={mockPersona} agentColor="#DC2626" />)
      expect(screen.getByText('Visual Identity')).toBeInTheDocument()
      expect(screen.getByText('#DC2626')).toBeInTheDocument()
      expect(screen.getByText('Quality Guardian')).toBeInTheDocument()

      const swatch = container.querySelector('.persona-doc__color-swatch') as HTMLElement
      expect(swatch.style.backgroundColor).toBe('rgb(220, 38, 38)')
    })
  })

  // ─── Edge Cases ─────────────────────────────────────────────────────

  it('renders nothing for unknown tab value', () => {
    const { container } = render(
      <PersonaDocument tab={'unknown' as PersonaTab} persona={mockPersona} agentColor="#DC2626" />
    )
    expect(container.innerHTML).toBe('')
  })

  it('hides certifications section when empty', () => {
    const personaWithNoCerts = {
      ...mockPersona,
      skills: { ...mockPersona.skills, certifications: [] },
    }
    render(<PersonaDocument tab={PersonaTab.Skills} persona={personaWithNoCerts} agentColor="#DC2626" />)
    expect(screen.queryByText('Certifications')).not.toBeInTheDocument()
  })
})

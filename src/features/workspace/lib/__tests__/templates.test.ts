import { PAGE_TEMPLATES, applyTemplateVariables } from '../templates'

describe('PAGE_TEMPLATES', () => {
  it('has at least 15 templates', () => {
    expect(PAGE_TEMPLATES.length).toBeGreaterThanOrEqual(15)
  })

  it('each template has required fields', () => {
    for (const template of PAGE_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.title).toBeTruthy()
      expect(template.icon).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(Array.isArray(template.blocks)).toBe(true)
    }
  })

  it('includes sprint planning template', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'sprint-planning')
    expect(template).toBeDefined()
    expect(template!.title).toBe('Sprint Planning')
    expect(template!.variables).toBeDefined()
    expect(template!.variables?.date).toBeTruthy()
  })

  it('includes bug report template', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'bug-report')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Steps to Reproduce')).toBe(true)
  })

  it('includes product roadmap template with quarterly sections', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'product-roadmap')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Q1 Goals')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Q4 Goals')).toBe(true)
  })

  it('includes design doc with goals and non-goals', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'design-doc')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Goals')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Non-Goals')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Approach')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Timeline')).toBe(true)
  })

  it('includes user research with participants and recommendations', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'user-research')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Participants')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Findings')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Recommendations')).toBe(true)
  })

  it('includes retrospective with action items', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'retrospective')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'What went well')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'What did not go well')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Action Items')).toBe(true)
  })

  it('includes 1:1 notes with talking points and follow-ups', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === '1on1-notes')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Talking Points')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Action Items')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Follow-ups')).toBe(true)
  })

  it('includes company wiki with team directory and policies', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'company-wiki')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Team Directory')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Policies')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Tools & Integrations')).toBe(true)
  })

  it('includes feature spec with milestones', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'feature-spec')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'Problem Statement')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Milestones')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Requirements')).toBe(true)
  })

  it('includes release notes with known issues', () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === 'release-notes')
    expect(template).toBeDefined()
    expect(template!.blocks.some((b) => b.content === 'New Features')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Bug Fixes')).toBe(true)
    expect(template!.blocks.some((b) => b.content === 'Known Issues')).toBe(true)
  })

  it('all template IDs are unique', () => {
    const ids = PAGE_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('applyTemplateVariables', () => {
  it('replaces {{date}} variable', () => {
    const result = applyTemplateVariables('Sprint Planning - {{date}}', {
      date: '2026-02-10',
    })
    expect(result).toBe('Sprint Planning - 2026-02-10')
  })

  it('replaces {{title}} variable', () => {
    const result = applyTemplateVariables('{{title}}', {
      title: 'My Feature',
    })
    expect(result).toBe('My Feature')
  })

  it('replaces multiple occurrences of the same variable', () => {
    const result = applyTemplateVariables('{{date}} - {{date}}', {
      date: '2026-02-10',
    })
    expect(result).toBe('2026-02-10 - 2026-02-10')
  })

  it('handles multiple different variables', () => {
    const result = applyTemplateVariables('{{title}} - {{date}}', {
      title: 'Spec',
      date: '2026-02-10',
    })
    expect(result).toBe('Spec - 2026-02-10')
  })

  it('leaves unmatched variables as is', () => {
    const result = applyTemplateVariables('Hello {{name}}', {
      date: '2026-02-10',
    })
    expect(result).toBe('Hello {{name}}')
  })

  it('handles empty variables', () => {
    const result = applyTemplateVariables('Hello world', {})
    expect(result).toBe('Hello world')
  })
})

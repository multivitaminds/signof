import { PROJECT_TEMPLATES } from '../projectTemplates'
import type { ProjectTemplate } from '../projectTemplates'

describe('projectTemplates', () => {
  it('exports exactly 8 templates', () => {
    expect(PROJECT_TEMPLATES).toHaveLength(8)
  })

  it('each template has required fields', () => {
    for (const template of PROJECT_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.name).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(template.icon).toBeTruthy()
      expect(template.statuses.length).toBeGreaterThanOrEqual(3)
      expect(template.labels.length).toBeGreaterThanOrEqual(3)
      expect(template.priorities.length).toBeGreaterThan(0)
    }
  })

  it('each template has unique id', () => {
    const ids = PROJECT_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each template status has key, label, and color', () => {
    for (const template of PROJECT_TEMPLATES) {
      for (const status of template.statuses) {
        expect(status.key).toBeTruthy()
        expect(status.label).toBeTruthy()
        expect(status.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    }
  })

  it('each template label has id, name, and color', () => {
    for (const template of PROJECT_TEMPLATES) {
      for (const label of template.labels) {
        expect(label.id).toBeTruthy()
        expect(label.name).toBeTruthy()
        expect(label.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    }
  })

  it('contains the expected template names', () => {
    const names = PROJECT_TEMPLATES.map((t) => t.name)
    expect(names).toContain('Software Development')
    expect(names).toContain('Marketing Campaign')
    expect(names).toContain('Product Launch')
    expect(names).toContain('Bug Tracking')
    expect(names).toContain('Sprint')
    expect(names).toContain('Content Calendar')
    expect(names).toContain('Hiring Pipeline')
    expect(names).toContain('Event Planning')
  })

  it('Software Development template has correct statuses', () => {
    const swDev = PROJECT_TEMPLATES.find((t) => t.name === 'Software Development') as ProjectTemplate
    expect(swDev).toBeDefined()
    const statusLabels = swDev.statuses.map((s) => s.label)
    expect(statusLabels).toEqual(['Backlog', 'Todo', 'In Progress', 'Review', 'Done'])
  })

  it('Bug Tracking template has 6 statuses', () => {
    const bugTracking = PROJECT_TEMPLATES.find((t) => t.name === 'Bug Tracking') as ProjectTemplate
    expect(bugTracking).toBeDefined()
    expect(bugTracking.statuses).toHaveLength(6)
    const statusLabels = bugTracking.statuses.map((s) => s.label)
    expect(statusLabels).toContain('Triaged')
    expect(statusLabels).toContain('Verified')
  })

  it('Hiring Pipeline template has Rejected status', () => {
    const hiring = PROJECT_TEMPLATES.find((t) => t.name === 'Hiring Pipeline') as ProjectTemplate
    expect(hiring).toBeDefined()
    const statusLabels = hiring.statuses.map((s) => s.label)
    expect(statusLabels).toContain('Rejected')
    expect(statusLabels).toContain('Hired')
  })
})

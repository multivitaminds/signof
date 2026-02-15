import { describe, it, expect } from 'vitest'
import { generateMarketplacePersona, getMarketplaceAgentDetail } from './personaGenerator'
import { MARKETPLACE_DOMAINS } from './marketplaceAgents'

describe('generateMarketplacePersona', () => {
  const testDomain = MARKETPLACE_DOMAINS[0]!
  const testAgent = testDomain.agents[0]!

  it('produces the same output for the same input (deterministic)', () => {
    const persona1 = generateMarketplacePersona(testDomain, testAgent)
    const persona2 = generateMarketplacePersona(testDomain, testAgent)
    expect(persona1).toEqual(persona2)
  })

  it('produces different output for different agents', () => {
    const agent0 = testDomain.agents[0]!
    const agent1 = testDomain.agents[1]!
    const persona1 = generateMarketplacePersona(testDomain, agent0)
    const persona2 = generateMarketplacePersona(testDomain, agent1)
    expect(persona1.identity.codename).not.toEqual(persona2.identity.codename)
  })

  it('generates valid personas for every marketplace domain', () => {
    for (const domain of MARKETPLACE_DOMAINS) {
      const agent = domain.agents[0]!
      const persona = generateMarketplacePersona(domain, agent)

      // Roles
      expect(persona.roles.title).toBeTruthy()
      expect(persona.roles.department).toBe(domain.name)
      expect(persona.roles.missionStatement).toBeTruthy()
      expect(persona.roles.responsibilities.length).toBeGreaterThan(0)
      expect(persona.roles.authorities.length).toBeGreaterThan(0)
      expect(persona.roles.boundaries.length).toBeGreaterThan(0)

      // Skills
      expect(persona.skills.technical.length).toBeGreaterThan(0)
      expect(persona.skills.soft.length).toBeGreaterThan(0)
      expect(persona.skills.domain.length).toBeGreaterThan(0)
      expect(persona.skills.certifications.length).toBeGreaterThan(0)

      // Memory
      expect(persona.memory.contextWindow).toBeTruthy()
      expect(persona.memory.knowledgeDomains.length).toBeGreaterThan(0)
      expect(persona.memory.formativeExperiences.length).toBeGreaterThan(0)
      expect(persona.memory.corePrinciples.length).toBeGreaterThan(0)

      // User
      expect(persona.user.interactionStyle).toBeTruthy()
      expect(persona.user.communicationTone).toBeTruthy()
      expect(persona.user.deliverables.length).toBeGreaterThan(0)

      // Soul
      expect(persona.soul.purpose).toBeTruthy()
      expect(persona.soul.values.length).toBeGreaterThan(0)
      expect(persona.soul.personality).toBeTruthy()
      expect(persona.soul.ethicalBoundaries.length).toBeGreaterThan(0)

      // Identity
      expect(persona.identity.codename).toMatch(/^[A-Z]+-[A-Z]+$/)
      expect(persona.identity.version).toBe('1.0.0')
      expect(persona.identity.archetype).toBeTruthy()
      expect(persona.identity.visualIdentity.primaryColor).toBe(domain.color)
    }
  })

  it('maps autonomy levels to correct interaction styles', () => {
    const domain = MARKETPLACE_DOMAINS[0]!
    const fullAutoAgent = domain.agents.find(a => a.autonomy === 'Full Auto')
    const suggestAgent = domain.agents.find(a => a.autonomy === 'Suggest')
    const askFirstAgent = domain.agents.find(a => a.autonomy === 'Ask First')

    expect(fullAutoAgent).toBeDefined()
    expect(suggestAgent).toBeDefined()
    expect(askFirstAgent).toBeDefined()

    expect(generateMarketplacePersona(domain, fullAutoAgent!).user.interactionStyle).toBe('autonomous')
    expect(generateMarketplacePersona(domain, suggestAgent!).user.interactionStyle).toBe('collaborative')
    expect(generateMarketplacePersona(domain, askFirstAgent!).user.interactionStyle).toBe('consultative')
  })

  it('sets context window based on autonomy', () => {
    const domain = MARKETPLACE_DOMAINS[0]!
    const fullAutoAgent = domain.agents.find(a => a.autonomy === 'Full Auto')
    const suggestAgent = domain.agents.find(a => a.autonomy === 'Suggest')

    expect(fullAutoAgent).toBeDefined()
    expect(suggestAgent).toBeDefined()

    expect(generateMarketplacePersona(domain, fullAutoAgent!).memory.contextWindow).toBe('200K tokens')
    expect(generateMarketplacePersona(domain, suggestAgent!).memory.contextWindow).toBe('128K tokens')
  })

  it('generates technical skills from integrations string', () => {
    const persona = generateMarketplacePersona(testDomain, testAgent)
    const integrationNames = testAgent.integrations.split(',').map(s => s.trim())
    const skillNames = persona.skills.technical.map(s => s.name)

    for (const integration of integrationNames) {
      expect(skillNames).toContain(integration)
    }
  })
})

describe('getMarketplaceAgentDetail', () => {
  it('returns undefined for invalid domain', () => {
    expect(getMarketplaceAgentDetail('nonexistent', 1)).toBeUndefined()
  })

  it('returns undefined for invalid agent id', () => {
    expect(getMarketplaceAgentDetail('work', 99999)).toBeUndefined()
  })

  it('returns valid AgentDetailInfo for known agent', () => {
    const detail = getMarketplaceAgentDetail('work', 1)
    expect(detail).toBeDefined()
    expect(detail!.id).toBe('work-1')
    expect(detail!.name).toBeTruthy()
    expect(detail!.description).toBeTruthy()
    expect(detail!.color).toBeTruthy()
    expect(detail!.persona).toBeDefined()
    expect(detail!.persona.roles.title).toBeTruthy()
    expect(detail!.integrations).toBeTruthy()
    expect(detail!.price).toBeTruthy()
    expect(detail!.domainId).toBe('work')
  })

  it('returns correct data for different domains', () => {
    const workDetail = getMarketplaceAgentDetail('work', 1)
    const financeDetail = getMarketplaceAgentDetail('finance', 1)

    expect(workDetail).toBeDefined()
    expect(financeDetail).toBeDefined()
    expect(workDetail!.color).not.toBe(financeDetail!.color)
    expect(workDetail!.category).not.toBe(financeDetail!.category)
  })
})

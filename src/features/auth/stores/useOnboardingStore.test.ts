import { useOnboardingStore } from './useOnboardingStore'

describe('useOnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset()
  })

  it('initializes with default state', () => {
    const state = useOnboardingStore.getState()
    expect(state.workspaceName).toBe('')
    expect(state.workspaceIcon).toBe('\u{1F680}')
    expect(state.role).toBe('')
    expect(state.teamSize).toBe('')
    expect(state.useCases).toEqual([])
    expect(state.invitedEmails).toEqual([])
    expect(state.theme).toBe('system')
    expect(state.accentColor).toBe('#4F46E5')
    expect(state.completed).toBe(false)
    expect(state.currentStep).toBe(0)
  })

  it('sets workspace name and icon', () => {
    useOnboardingStore.getState().setWorkspace('Acme Inc', '\u{2B50}')
    const state = useOnboardingStore.getState()
    expect(state.workspaceName).toBe('Acme Inc')
    expect(state.workspaceIcon).toBe('\u{2B50}')
  })

  it('sets role', () => {
    useOnboardingStore.getState().setRole('Engineering')
    expect(useOnboardingStore.getState().role).toBe('Engineering')
  })

  it('sets team size', () => {
    useOnboardingStore.getState().setTeamSize('2-5')
    expect(useOnboardingStore.getState().teamSize).toBe('2-5')
  })

  it('toggles use cases on and off', () => {
    const { toggleUseCase } = useOnboardingStore.getState()
    toggleUseCase('Scheduling')
    expect(useOnboardingStore.getState().useCases).toEqual(['Scheduling'])
    toggleUseCase('Databases')
    expect(useOnboardingStore.getState().useCases).toEqual(['Scheduling', 'Databases'])
    toggleUseCase('Scheduling')
    expect(useOnboardingStore.getState().useCases).toEqual(['Databases'])
  })

  it('adds and removes invite emails without duplicates', () => {
    const store = useOnboardingStore.getState()
    store.addInviteEmail('a@test.com')
    store.addInviteEmail('b@test.com')
    store.addInviteEmail('a@test.com') // duplicate
    expect(useOnboardingStore.getState().invitedEmails).toEqual(['a@test.com', 'b@test.com'])

    useOnboardingStore.getState().removeInviteEmail('a@test.com')
    expect(useOnboardingStore.getState().invitedEmails).toEqual(['b@test.com'])
  })

  it('sets theme and accent color', () => {
    useOnboardingStore.getState().setTheme('dark')
    useOnboardingStore.getState().setAccentColor('#E11D48')
    const state = useOnboardingStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.accentColor).toBe('#E11D48')
  })

  it('completes onboarding and resets', () => {
    const store = useOnboardingStore.getState()
    store.setWorkspace('Test', '\u{1F525}')
    store.setRole('Design')
    store.completeOnboarding()
    expect(useOnboardingStore.getState().completed).toBe(true)
    expect(useOnboardingStore.getState().workspaceName).toBe('Test')

    useOnboardingStore.getState().reset()
    const resetState = useOnboardingStore.getState()
    expect(resetState.completed).toBe(false)
    expect(resetState.workspaceName).toBe('')
    expect(resetState.role).toBe('')
  })
})

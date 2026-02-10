import { useAuthStore } from './useAuthStore'
import { AuthStatus } from '../types'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useAuthStore.setState({
      status: AuthStatus.Unauthenticated,
      user: null,
      onboardingComplete: false,
    })
  })

  it('starts with unauthenticated status and no user', () => {
    const state = useAuthStore.getState()
    expect(state.status).toBe(AuthStatus.Unauthenticated)
    expect(state.user).toBeNull()
    expect(state.onboardingComplete).toBe(false)
  })

  it('login sets authenticated status and creates user', () => {
    useAuthStore.getState().login('alice@test.com', 'Alice')
    const state = useAuthStore.getState()

    expect(state.status).toBe(AuthStatus.Authenticated)
    expect(state.user).not.toBeNull()
    expect(state.user?.email).toBe('alice@test.com')
    expect(state.user?.name).toBe('Alice')
    expect(state.user?.id).toBeTruthy()
    expect(state.user?.createdAt).toBeTruthy()
    expect(state.user?.avatarUrl).toBeNull()
  })

  it('signup sets authenticated status and resets onboardingComplete', () => {
    // First complete onboarding
    useAuthStore.setState({ onboardingComplete: true })

    useAuthStore.getState().signup('bob@test.com', 'Bob')
    const state = useAuthStore.getState()

    expect(state.status).toBe(AuthStatus.Authenticated)
    expect(state.user?.email).toBe('bob@test.com')
    expect(state.user?.name).toBe('Bob')
    expect(state.onboardingComplete).toBe(false)
  })

  it('logout resets status and user', () => {
    useAuthStore.getState().login('alice@test.com', 'Alice')
    expect(useAuthStore.getState().user).not.toBeNull()

    useAuthStore.getState().logout()
    const state = useAuthStore.getState()

    expect(state.status).toBe(AuthStatus.Unauthenticated)
    expect(state.user).toBeNull()
  })

  it('completeOnboarding sets onboardingComplete to true', () => {
    useAuthStore.getState().login('alice@test.com', 'Alice')
    expect(useAuthStore.getState().onboardingComplete).toBe(false)

    useAuthStore.getState().completeOnboarding({
      displayName: 'Alice',
      workspaceName: 'Test Workspace',
      workspaceSlug: 'test-workspace',
      workspaceIcon: '\u{1F680}',
      role: 'Engineering',
      teamSize: '2-10',
      useCases: ['Document Signing'],
      inviteEmails: [],
      theme: 'system',
    })

    expect(useAuthStore.getState().onboardingComplete).toBe(true)
  })

  it('generates unique IDs for different users', () => {
    useAuthStore.getState().login('user1@test.com', 'User 1')
    const id1 = useAuthStore.getState().user?.id

    useAuthStore.getState().signup('user2@test.com', 'User 2')
    const id2 = useAuthStore.getState().user?.id

    expect(id1).toBeTruthy()
    expect(id2).toBeTruthy()
    expect(id1).not.toBe(id2)
  })
})

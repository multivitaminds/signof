import useConnectorStore from './useConnectorStore'

// Save initial state so we can reset
const initialConnectors = useConnectorStore.getState().connectors.map((c) => ({ ...c }))

describe('useConnectorStore', () => {
  beforeEach(() => {
    useConnectorStore.setState({
      connectors: initialConnectors.map((c) => ({ ...c, status: 'disconnected' as const })),
    })
  })

  describe('initial connectors', () => {
    it('has 10 mock connectors', () => {
      expect(useConnectorStore.getState().connectors).toHaveLength(10)
    })

    it('includes expected connectors', () => {
      const names = useConnectorStore.getState().connectors.map((c) => c.name)
      expect(names).toContain('Gmail')
      expect(names).toContain('Slack')
      expect(names).toContain('Stripe')
      expect(names).toContain('GitHub')
      expect(names).toContain('Salesforce')
    })

    it('all connectors start disconnected', () => {
      const allDisconnected = useConnectorStore.getState().connectors.every((c) => c.status === 'disconnected')
      expect(allDisconnected).toBe(true)
    })
  })

  describe('getConnector', () => {
    it('finds a connector by ID', () => {
      const gmail = useConnectorStore.getState().getConnector('gmail')
      expect(gmail).toBeDefined()
      expect(gmail!.name).toBe('Gmail')
    })

    it('returns undefined for non-existent connector', () => {
      expect(useConnectorStore.getState().getConnector('nonexistent')).toBeUndefined()
    })
  })

  describe('getConnectorsByCategory', () => {
    it('filters connectors by category', () => {
      const communication = useConnectorStore.getState().getConnectorsByCategory('communication')
      expect(communication.length).toBeGreaterThanOrEqual(3) // Gmail, Slack, MS Teams
      expect(communication.every((c) => c.category === 'communication')).toBe(true)
    })

    it('returns empty for non-existent category', () => {
      expect(useConnectorStore.getState().getConnectorsByCategory('imaginary')).toEqual([])
    })
  })

  describe('getCategories', () => {
    it('returns unique categories', () => {
      const categories = useConnectorStore.getState().getCategories()
      expect(categories).toContain('communication')
      expect(categories).toContain('finance')
      expect(categories).toContain('development')
      // Verify uniqueness
      expect(new Set(categories).size).toBe(categories.length)
    })
  })

  describe('setConnectorStatus', () => {
    it('changes connector status to connected', () => {
      useConnectorStore.getState().setConnectorStatus('gmail', 'connected')
      expect(useConnectorStore.getState().getConnector('gmail')!.status).toBe('connected')
    })

    it('changes connector status to error', () => {
      useConnectorStore.getState().setConnectorStatus('slack', 'error')
      expect(useConnectorStore.getState().getConnector('slack')!.status).toBe('error')
    })
  })

  describe('getConnectedConnectors', () => {
    it('returns empty when none connected', () => {
      expect(useConnectorStore.getState().getConnectedConnectors()).toHaveLength(0)
    })

    it('returns only connected connectors', () => {
      useConnectorStore.getState().setConnectorStatus('gmail', 'connected')
      useConnectorStore.getState().setConnectorStatus('slack', 'connected')
      const connected = useConnectorStore.getState().getConnectedConnectors()
      expect(connected).toHaveLength(2)
      expect(connected.map((c) => c.id)).toContain('gmail')
      expect(connected.map((c) => c.id)).toContain('slack')
    })
  })

  describe('mockExecute', () => {
    it('returns error for non-existent connector', () => {
      const result = JSON.parse(useConnectorStore.getState().mockExecute('fake', 'action', {}))
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('returns error for non-existent action', () => {
      useConnectorStore.getState().setConnectorStatus('gmail', 'connected')
      const result = JSON.parse(useConnectorStore.getState().mockExecute('gmail', 'fake-action', {}))
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('returns error when connector is disconnected', () => {
      const result = JSON.parse(useConnectorStore.getState().mockExecute('gmail', 'gmail-send', { to: 'test@test.com' }))
      expect(result.success).toBe(false)
      expect(result.error).toContain('not connected')
    })

    it('returns mock result when connector is connected', () => {
      useConnectorStore.getState().setConnectorStatus('gmail', 'connected')
      const result = JSON.parse(useConnectorStore.getState().mockExecute('gmail', 'gmail-send', { to: 'test@test.com', subject: 'Hi', body: 'Hello' }))
      expect(result.success).toBe(true)
      expect(result.connector).toBe('Gmail')
      expect(result.action).toBe('Send Email')
      expect(result.timestamp).toBeTruthy()
    })
  })
})

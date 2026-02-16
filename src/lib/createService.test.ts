import { createService } from './createService'
import { api } from './api'

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  },
}))

interface TestItem {
  id: string
  name: string
}

describe('createService', () => {
  const service = createService<TestItem>({ basePath: '/items' })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('list calls GET with base path', async () => {
    const mockData = { data: [], total: 0, page: 1, pageSize: 20, hasMore: false }
    vi.mocked(api.get).mockResolvedValue({ data: mockData, ok: true })

    const result = await service.list()

    expect(api.get).toHaveBeenCalledWith('/items')
    expect(result.ok).toBe(true)
  })

  it('list appends query params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], total: 0, page: 1, pageSize: 20, hasMore: false }, ok: true })

    await service.list({ page: 2, limit: 10 })

    const calledUrl = vi.mocked(api.get).mock.calls[0]?.[0] ?? ''
    expect(calledUrl).toContain('page=2')
    expect(calledUrl).toContain('limit=10')
  })

  it('getById calls GET with id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { id: '1', name: 'Test' }, ok: true })

    const result = await service.getById('1')

    expect(api.get).toHaveBeenCalledWith('/items/1')
    expect(result.ok).toBe(true)
  })

  it('create calls POST', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: '1', name: 'New' }, ok: true })

    const result = await service.create({ name: 'New' })

    expect(api.post).toHaveBeenCalledWith('/items', { name: 'New' })
    expect(result.ok).toBe(true)
  })

  it('update calls PUT with id', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { id: '1', name: 'Updated' }, ok: true })

    const result = await service.update('1', { name: 'Updated' })

    expect(api.put).toHaveBeenCalledWith('/items/1', { name: 'Updated' })
    expect(result.ok).toBe(true)
  })

  it('delete calls DEL with id', async () => {
    vi.mocked(api.del).mockResolvedValue({ data: undefined as never, ok: true })

    const result = await service.delete('1')

    expect(api.del).toHaveBeenCalledWith('/items/1')
    expect(result.ok).toBe(true)
  })

  it('returns error result on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

    const result = await service.getById('1')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toBe('Network error')
    }
  })
})

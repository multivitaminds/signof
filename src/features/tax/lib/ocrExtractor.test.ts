import { extractTextFromImage } from './ocrExtractor'

const mockRecognize = vi.fn()
const mockTerminate = vi.fn()

vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(() =>
    Promise.resolve({
      recognize: mockRecognize,
      terminate: mockTerminate,
    })
  ),
}))

function createMockImageFile(name: string): File {
  return new File(['fake-image-data'], name, { type: 'image/png' })
}

describe('ocrExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTerminate.mockResolvedValue(undefined)
  })

  it('extracts text from an image file', async () => {
    mockRecognize.mockResolvedValue({
      data: { text: 'Employer Name: Acme Corp\nWages: 85,000.00' },
    })

    const result = await extractTextFromImage(createMockImageFile('w2.png'))
    expect(result).toBe('Employer Name: Acme Corp\nWages: 85,000.00')
    expect(mockRecognize).toHaveBeenCalledTimes(1)
  })

  it('terminates worker after extraction', async () => {
    mockRecognize.mockResolvedValue({
      data: { text: 'Some text' },
    })

    await extractTextFromImage(createMockImageFile('test.jpg'))
    expect(mockTerminate).toHaveBeenCalledTimes(1)
  })

  it('terminates worker even on error', async () => {
    mockRecognize.mockRejectedValue(new Error('OCR failed'))

    const result = await extractTextFromImage(createMockImageFile('broken.png'))
    expect(result).toBe('')
    expect(mockTerminate).toHaveBeenCalledTimes(1)
  })

  it('returns empty string on worker creation failure', async () => {
    const { createWorker } = await import('tesseract.js')
    vi.mocked(createWorker).mockRejectedValueOnce(new Error('Worker init failed'))

    const result = await extractTextFromImage(createMockImageFile('fail.png'))
    expect(result).toBe('')
  })
})

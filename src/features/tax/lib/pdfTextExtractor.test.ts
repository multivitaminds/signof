import { extractTextFromPDF } from './pdfTextExtractor'

// Mock pdfjs-dist — use vi.hoisted() so mocks are available in the hoisted vi.mock factory
const { mockGetTextContent, mockGetPage, mockPromise } = vi.hoisted(() => ({
  mockGetTextContent: vi.fn(),
  mockGetPage: vi.fn(),
  mockPromise: vi.fn(),
}))

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: mockPromise(),
  }),
}))

function createMockFile(name: string): File {
  const file = new File(['fake-pdf-content'], name, { type: 'application/pdf' })
  // jsdom File does not implement arrayBuffer(), so polyfill it for tests
  file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0))
  return file
}

describe('pdfTextExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extracts text from all pages of a PDF', async () => {
    mockGetTextContent
      .mockResolvedValueOnce({
        items: [{ str: 'Hello' }, { str: 'World' }],
      })
      .mockResolvedValueOnce({
        items: [{ str: 'Page' }, { str: 'Two' }],
      })

    mockGetPage.mockImplementation(() =>
      Promise.resolve({ getTextContent: mockGetTextContent })
    )

    mockPromise.mockResolvedValue({
      numPages: 2,
      getPage: mockGetPage,
    })

    const result = await extractTextFromPDF(createMockFile('test.pdf'))
    expect(result).toBe('Hello World\nPage Two')
  })

  it('returns empty string for a PDF with no pages', async () => {
    mockPromise.mockResolvedValue({
      numPages: 0,
      getPage: mockGetPage,
    })

    const result = await extractTextFromPDF(createMockFile('empty.pdf'))
    expect(result).toBe('')
  })

  it('returns empty string on error', async () => {
    mockPromise.mockRejectedValue(new Error('Failed to load PDF'))

    const result = await extractTextFromPDF(createMockFile('broken.pdf'))
    expect(result).toBe('')
  })

  it('filters out non-text items', async () => {
    mockGetTextContent.mockResolvedValue({
      items: [
        { str: 'Text item' },
        { width: 100, height: 50 }, // non-text item (no str property)
        { str: 'Another text' },
      ],
    })

    mockGetPage.mockResolvedValue({ getTextContent: mockGetTextContent })
    mockPromise.mockResolvedValue({
      numPages: 1,
      getPage: mockGetPage,
    })

    const result = await extractTextFromPDF(createMockFile('mixed.pdf'))
    expect(result).toBe('Text item Another text')
  })
})

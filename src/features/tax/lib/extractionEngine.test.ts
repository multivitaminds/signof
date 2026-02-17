import { extractDocument, getSupportedExtractionTypes, EXTRACTION_STEPS } from './extractionEngine'
import { TaxFormType as TaxFormTypeValues, ExtractionConfidence } from '../types'

// Mock the extraction utilities
vi.mock('./pdfTextExtractor', () => ({
  extractTextFromPDF: vi.fn(),
}))

vi.mock('./ocrExtractor', () => ({
  extractTextFromImage: vi.fn(),
}))

vi.mock('./fieldParser', () => ({
  parseFieldsFromText: vi.fn(),
}))

import { extractTextFromPDF } from './pdfTextExtractor'
import { extractTextFromImage } from './ocrExtractor'
import { parseFieldsFromText } from './fieldParser'

function createMockFile(name: string, type: string): File {
  return new File(['fake-content'], name, { type })
}

const mockFields = [
  { key: 'Employer Name', value: 'Acme Corp', confidence: ExtractionConfidence.High, confirmed: false },
  { key: 'Wages (Box 1)', value: '85000.00', confidence: ExtractionConfidence.High, confirmed: false },
]

describe('extractionEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('EXTRACTION_STEPS', () => {
    it('has 4 steps with labels', () => {
      expect(EXTRACTION_STEPS).toHaveLength(4)
      for (const step of EXTRACTION_STEPS) {
        expect(step.label).toBeTruthy()
      }
    })
  })

  describe('extractDocument with real file', () => {
    it('extracts text from a PDF file', async () => {
      vi.mocked(extractTextFromPDF).mockResolvedValue(
        'Employer Name: Acme Corp\nWages, tips, other compensation 85,000.00'
      )
      vi.mocked(parseFieldsFromText).mockReturnValue(mockFields)

      const file = createMockFile('w2.pdf', 'application/pdf')
      const result = await extractDocument(TaxFormTypeValues.W2, file)

      expect(extractTextFromPDF).toHaveBeenCalledWith(file)
      expect(extractTextFromImage).not.toHaveBeenCalled()
      expect(parseFieldsFromText).toHaveBeenCalled()
      expect(result.fields).toEqual(mockFields)
      expect(result.formType).toBe(TaxFormTypeValues.W2)
      expect(result.extractedAt).toBeTruthy()
    })

    it('extracts text from an image file using OCR', async () => {
      vi.mocked(extractTextFromImage).mockResolvedValue(
        'Employer Name: Acme Corp\nWages 85,000.00'
      )
      vi.mocked(parseFieldsFromText).mockReturnValue(mockFields)

      const file = createMockFile('w2.png', 'image/png')
      const result = await extractDocument(TaxFormTypeValues.W2, file)

      expect(extractTextFromImage).toHaveBeenCalledWith(file)
      expect(extractTextFromPDF).not.toHaveBeenCalled()
      expect(result.fields).toEqual(mockFields)
    })

    it('falls back to OCR when PDF has less than 50 chars of text', async () => {
      vi.mocked(extractTextFromPDF).mockResolvedValue('Short')
      vi.mocked(extractTextFromImage).mockResolvedValue(
        'Employer Name: Acme Corp\nWages 85,000.00'
      )
      vi.mocked(parseFieldsFromText).mockReturnValue(mockFields)

      const file = createMockFile('scanned.pdf', 'application/pdf')
      const result = await extractDocument(TaxFormTypeValues.W2, file)

      expect(extractTextFromPDF).toHaveBeenCalledWith(file)
      expect(extractTextFromImage).toHaveBeenCalledWith(file)
      expect(result.fields).toEqual(mockFields)
    })

    it('calls onStep callback 4 times during real extraction', async () => {
      vi.mocked(extractTextFromPDF).mockResolvedValue('Some long enough text for extraction to work properly')
      vi.mocked(parseFieldsFromText).mockReturnValue(mockFields)

      const onStep = vi.fn()
      const file = createMockFile('w2.pdf', 'application/pdf')
      await extractDocument(TaxFormTypeValues.W2, file, onStep)

      expect(onStep).toHaveBeenCalledTimes(4)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[0], 0)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[1], 1)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[2], 2)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[3], 3)
    })

    it('calculates overall confidence from extracted fields', async () => {
      vi.mocked(extractTextFromPDF).mockResolvedValue('Some long enough text for extraction to work properly')
      vi.mocked(parseFieldsFromText).mockReturnValue([
        { key: 'Field 1', value: '100', confidence: ExtractionConfidence.High, confirmed: false },
        { key: 'Field 2', value: '200', confidence: ExtractionConfidence.Low, confirmed: false },
      ])

      const file = createMockFile('test.pdf', 'application/pdf')
      const result = await extractDocument(TaxFormTypeValues.W2, file)

      // High = 1.0, Low = 0.3 → average = 0.65 → 65%
      expect(result.overallConfidence).toBe(65)
    })

    it('generates warnings for low confidence and empty fields', async () => {
      vi.mocked(extractTextFromPDF).mockResolvedValue('Some long enough text for extraction to work properly')
      vi.mocked(parseFieldsFromText).mockReturnValue([
        { key: 'Field 1', value: '', confidence: ExtractionConfidence.Low, confirmed: false },
        { key: 'Field 2', value: '0.00', confidence: ExtractionConfidence.High, confirmed: false },
      ])

      const file = createMockFile('test.pdf', 'application/pdf')
      const result = await extractDocument(TaxFormTypeValues.W2, file)

      const lowConfWarning = result.warnings.find((w) => w.includes('low confidence'))
      expect(lowConfWarning).toBeDefined()
      const emptyWarning = result.warnings.find((w) => w.includes('not detected'))
      expect(emptyWarning).toBeDefined()
    })

    it('detects JPG files as images', async () => {
      vi.mocked(extractTextFromImage).mockResolvedValue('Some text')
      vi.mocked(parseFieldsFromText).mockReturnValue([])

      const file = createMockFile('receipt.jpg', 'image/jpeg')
      await extractDocument(TaxFormTypeValues.W2, file)

      expect(extractTextFromImage).toHaveBeenCalledWith(file)
      expect(extractTextFromPDF).not.toHaveBeenCalled()
    })
  })

  describe('extractDocument simulated fallback (no file)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('resolves with extraction result for W2', async () => {
      const promise = extractDocument(TaxFormTypeValues.W2)

      // Total simulated duration: 500 + 400 + 800 + 300 = 2000ms
      await vi.advanceTimersByTimeAsync(2000)

      const result = await promise
      expect(result.formType).toBe(TaxFormTypeValues.W2)
      expect(result.fields.length).toBeGreaterThan(0)
      expect(result.extractedAt).toBeTruthy()
      expect(typeof result.overallConfidence).toBe('number')
    })

    it('calls onStep callback for each simulated step', async () => {
      const onStep = vi.fn()
      const promise = extractDocument(TaxFormTypeValues.W2, undefined, onStep)

      await vi.advanceTimersByTimeAsync(2000)
      await promise

      expect(onStep).toHaveBeenCalledTimes(4)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[0], 0)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[1], 1)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[2], 2)
      expect(onStep).toHaveBeenCalledWith(EXTRACTION_STEPS[3], 3)
    })

    it('generates fields from W2 template with correct keys', async () => {
      const promise = extractDocument(TaxFormTypeValues.W2)
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise

      const keys = result.fields.map((f) => f.key)
      expect(keys).toContain('Employer Name')
      expect(keys).toContain('Wages (Box 1)')
    })

    it('generates fields from 1099-NEC template', async () => {
      const promise = extractDocument(TaxFormTypeValues.NEC1099)
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise

      const keys = result.fields.map((f) => f.key)
      expect(keys).toContain('Payer Name')
      expect(keys).toContain('Nonemployee Compensation (Box 1)')
    })

    it('returns empty fields for unsupported form type', async () => {
      const promise = extractDocument(TaxFormTypeValues.W2C)
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result.fields).toHaveLength(0)
      expect(result.overallConfidence).toBe(0)
    })

    it('each field has a valid confidence value', async () => {
      const promise = extractDocument(TaxFormTypeValues.W2)
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise

      const validConfidences = [ExtractionConfidence.High, ExtractionConfidence.Medium, ExtractionConfidence.Low]
      for (const field of result.fields) {
        expect(validConfidences).toContain(field.confidence)
        expect(field.confirmed).toBe(false)
      }
    })

    it('generates warnings for fields with default or empty values', async () => {
      const promise = extractDocument(TaxFormTypeValues.W2)
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise

      const emptyWarning = result.warnings.find((w) => w.includes('not detected'))
      expect(emptyWarning).toBeDefined()
    })

    it('overallConfidence is between 0 and 100 for non-empty results', async () => {
      const promise = extractDocument(TaxFormTypeValues.INT1099)
      await vi.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result.overallConfidence).toBeGreaterThanOrEqual(0)
      expect(result.overallConfidence).toBeLessThanOrEqual(100)
    })
  })

  describe('getSupportedExtractionTypes', () => {
    it('returns an array of supported form types', () => {
      const types = getSupportedExtractionTypes()
      expect(types.length).toBeGreaterThan(0)
      expect(types).toContain(TaxFormTypeValues.W2)
      expect(types).toContain(TaxFormTypeValues.NEC1099)
      expect(types).toContain(TaxFormTypeValues.INT1099)
      expect(types).toContain(TaxFormTypeValues.Mortgage1098)
    })

    it('does not include unsupported types', () => {
      const types = getSupportedExtractionTypes()
      expect(types).not.toContain(TaxFormTypeValues.W2C)
    })
  })
})

import { extractDocument, getSupportedExtractionTypes, EXTRACTION_STEPS } from './extractionEngine'
import { TaxFormType as TaxFormTypeValues, ExtractionConfidence } from '../types'

describe('extractionEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('EXTRACTION_STEPS', () => {
    it('has 4 steps with labels and durations', () => {
      expect(EXTRACTION_STEPS).toHaveLength(4)
      for (const step of EXTRACTION_STEPS) {
        expect(step.label).toBeTruthy()
        expect(step.duration).toBeGreaterThan(0)
      }
    })
  })

  describe('extractDocument', () => {
    it('resolves with extraction result for W2', async () => {
      const promise = extractDocument(TaxFormTypeValues.W2)

      // Total step duration: 500 + 400 + 800 + 300 = 2000ms
      await vi.advanceTimersByTimeAsync(2000)

      const result = await promise
      expect(result.formType).toBe(TaxFormTypeValues.W2)
      expect(result.fields.length).toBeGreaterThan(0)
      expect(result.extractedAt).toBeTruthy()
      expect(typeof result.overallConfidence).toBe('number')
    })

    it('calls onStep callback for each extraction step', async () => {
      const onStep = vi.fn()
      const promise = extractDocument(TaxFormTypeValues.W2, onStep)

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
      // Use a type that is not in FIELD_TEMPLATES
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

      // W2 template has fields with defaultValue '' and '0.00', so warnings should exist
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
      // W2C is not in FIELD_TEMPLATES
      expect(types).not.toContain(TaxFormTypeValues.W2C)
    })
  })
})

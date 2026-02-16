import { reportPerformance, reportError } from './performanceReporter'

describe('performanceReporter', () => {
  describe('reportPerformance', () => {
    it('logs metrics to console in dev mode', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const report = {
        vitals: { lcp: 1200, fid: 50, cls: 0.05, ttfb: 200 },
        timestamp: Date.now(),
        url: 'http://localhost/',
        userAgent: 'test',
      }

      reportPerformance(report)

      expect(spy).toHaveBeenCalledWith('[Perf]', report)
      spy.mockRestore()
    })
  })

  describe('reportError', () => {
    it('logs error to console in dev mode', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      const context = { component: 'TestComponent' }

      reportError(error, context)

      expect(spy).toHaveBeenCalledWith('[ErrorReport]', error, context)
      spy.mockRestore()
    })

    it('works without context', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('No context')

      reportError(error)

      expect(spy).toHaveBeenCalledWith('[ErrorReport]', error, undefined)
      spy.mockRestore()
    })
  })
})

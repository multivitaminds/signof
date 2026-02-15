import { useTaxStore } from './useTaxStore'
import type { TaxYear } from '../types'

function resetStore() {
  useTaxStore.setState({
    activeTaxYear: '2025' as TaxYear,
    environment: 'sandbox',
    deadlines: [],
  })
}

describe('useTaxStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Initial state', () => {
    it('has activeTaxYear set to 2025', () => {
      expect(useTaxStore.getState().activeTaxYear).toBe('2025')
    })

    it('starts in sandbox environment', () => {
      expect(useTaxStore.getState().environment).toBe('sandbox')
    })
  })

  describe('setActiveTaxYear', () => {
    it('changes the active tax year', () => {
      useTaxStore.getState().setActiveTaxYear('2024' as TaxYear)
      expect(useTaxStore.getState().activeTaxYear).toBe('2024')
    })

    it('can be set to any valid tax year', () => {
      useTaxStore.getState().setActiveTaxYear('2023' as TaxYear)
      expect(useTaxStore.getState().activeTaxYear).toBe('2023')
    })
  })

  describe('setEnvironment', () => {
    it('switches to production', () => {
      useTaxStore.getState().setEnvironment('production')
      expect(useTaxStore.getState().environment).toBe('production')
    })

    it('switches back to sandbox', () => {
      useTaxStore.getState().setEnvironment('production')
      useTaxStore.getState().setEnvironment('sandbox')
      expect(useTaxStore.getState().environment).toBe('sandbox')
    })
  })

  describe('toggleDeadline', () => {
    it('toggles a deadline completed status from false to true', () => {
      useTaxStore.setState({
        deadlines: [
          {
            id: 'dl-1',
            title: 'Test Deadline',
            description: 'A test',
            date: '2026-04-15',
            completed: false,
            taxYear: '2025' as TaxYear,
          },
        ],
      })

      useTaxStore.getState().toggleDeadline('dl-1')

      const deadline = useTaxStore.getState().deadlines.find((d) => d.id === 'dl-1')
      expect(deadline!.completed).toBe(true)
    })

    it('toggles a deadline completed status from true to false', () => {
      useTaxStore.setState({
        deadlines: [
          {
            id: 'dl-1',
            title: 'Test Deadline',
            description: 'A test',
            date: '2026-04-15',
            completed: true,
            taxYear: '2025' as TaxYear,
          },
        ],
      })

      useTaxStore.getState().toggleDeadline('dl-1')

      const deadline = useTaxStore.getState().deadlines.find((d) => d.id === 'dl-1')
      expect(deadline!.completed).toBe(false)
    })

    it('does not affect other deadlines', () => {
      useTaxStore.setState({
        deadlines: [
          { id: 'dl-1', title: 'Deadline 1', description: '', date: '2026-01-31', completed: false, taxYear: '2025' as TaxYear },
          { id: 'dl-2', title: 'Deadline 2', description: '', date: '2026-04-15', completed: false, taxYear: '2025' as TaxYear },
        ],
      })

      useTaxStore.getState().toggleDeadline('dl-1')

      const dl1 = useTaxStore.getState().deadlines.find((d) => d.id === 'dl-1')
      const dl2 = useTaxStore.getState().deadlines.find((d) => d.id === 'dl-2')
      expect(dl1!.completed).toBe(true)
      expect(dl2!.completed).toBe(false)
    })
  })

  describe('clearData', () => {
    it('clears deadlines and resets tax year and environment', () => {
      useTaxStore.setState({
        deadlines: [
          { id: 'dl-1', title: 'Test', description: '', date: '2026-04-15', completed: false, taxYear: '2025' as TaxYear },
        ],
        activeTaxYear: '2024' as TaxYear,
        environment: 'production',
      })

      useTaxStore.getState().clearData()

      const state = useTaxStore.getState()
      expect(state.deadlines).toHaveLength(0)
      expect(state.activeTaxYear).toBe('2025')
      expect(state.environment).toBe('sandbox')
    })
  })
})

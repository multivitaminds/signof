import { render, screen, waitFor } from '@testing-library/react'
import AIMemoryPage from './AIMemoryPage'

describe('AIMemoryPage', () => {
  it('renders loading state initially', () => {
    render(<AIMemoryPage />)
    expect(screen.getByLabelText('Loading memory')).toBeInTheDocument()
    expect(screen.getByText('Loading context memory...')).toBeInTheDocument()
  })

  it('renders placeholder content after hydration', async () => {
    render(<AIMemoryPage />)
    await waitFor(() => {
      expect(screen.getByTestId('memory-explorer-placeholder')).toBeInTheDocument()
    })
    expect(screen.getByText('Memory Explorer')).toBeInTheDocument()
  })
})

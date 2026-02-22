import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders the "OriginA" brand', () => {
    render(<Header />)
    expect(screen.getByText('OriginA')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Header />)
    expect(
      screen.getByText('Digital Signatures, Simplified')
    ).toBeInTheDocument()
  })

  it('shows the document count when provided', () => {
    render(<Header documentCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
  })

  it('hides the document count when not provided', () => {
    render(<Header />)
    expect(screen.queryByText('Documents')).not.toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import BarChart from './BarChart'

describe('BarChart', () => {
  const sampleData = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 25 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 30 },
    { label: 'Fri', value: 20 },
  ]

  it('renders an SVG element', () => {
    render(<BarChart data={sampleData} />)
    const svg = screen.getByRole('img', { name: /bar chart/i })
    expect(svg).toBeInTheDocument()
  })

  it('renders correct number of bars', () => {
    const { container } = render(<BarChart data={sampleData} />)
    const bars = container.querySelectorAll('.bar-chart__bar')
    expect(bars).toHaveLength(5)
  })

  it('renders x-axis labels', () => {
    render(<BarChart data={sampleData} />)
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<BarChart data={[]} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('applies custom height', () => {
    const { container } = render(<BarChart data={sampleData} height={400} />)
    const svg = container.querySelector('.bar-chart__svg')
    expect(svg).toHaveAttribute('height', '400')
  })
})

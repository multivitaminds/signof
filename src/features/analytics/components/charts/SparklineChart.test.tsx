import { render, screen } from '@testing-library/react'
import SparklineChart from './SparklineChart'

describe('SparklineChart', () => {
  it('renders an SVG element', () => {
    render(<SparklineChart data={[1, 2, 3, 4, 5]} />)
    const svg = screen.getByRole('img', { name: /sparkline chart/i })
    expect(svg).toBeInTheDocument()
  })

  it('renders a polyline when data has 2+ points', () => {
    const { container } = render(<SparklineChart data={[10, 20, 15, 30]} />)
    const polyline = container.querySelector('.sparkline__line')
    expect(polyline).toBeInTheDocument()
    expect(polyline?.getAttribute('points')).toBeTruthy()
  })

  it('renders a fill polygon', () => {
    const { container } = render(<SparklineChart data={[5, 10, 8]} />)
    const fill = container.querySelector('.sparkline__fill')
    expect(fill).toBeInTheDocument()
  })

  it('renders empty SVG for single data point', () => {
    const { container } = render(<SparklineChart data={[5]} />)
    const polyline = container.querySelector('.sparkline__line')
    expect(polyline).toBeNull()
  })

  it('applies custom dimensions', () => {
    const { container } = render(<SparklineChart data={[1, 2, 3]} width={200} height={48} />)
    const svg = container.querySelector('.sparkline')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '48')
  })
})

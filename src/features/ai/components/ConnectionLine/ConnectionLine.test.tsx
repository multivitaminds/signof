import { render } from '@testing-library/react'
import { NodeStatus } from '../../types'
import ConnectionLine from './ConnectionLine'

function renderLine(status: NodeStatus = NodeStatus.Idle) {
  return render(
    <svg>
      <ConnectionLine x1={0} y1={50} x2={200} y2={50} status={status} />
    </svg>
  )
}

describe('ConnectionLine', () => {
  it('renders an SVG path', () => {
    const { container } = renderLine()
    const path = container.querySelector('path')
    expect(path).toBeInTheDocument()
  })

  it('has connection-line class', () => {
    const { container } = renderLine()
    const path = container.querySelector('path')
    expect(path).toHaveClass('connection-line')
  })

  it('adds running class when status is running', () => {
    const { container } = renderLine(NodeStatus.Running)
    const path = container.querySelector('path')
    expect(path).toHaveClass('connection-line--running')
  })

  it('adds completed class when status is completed', () => {
    const { container } = renderLine(NodeStatus.Completed)
    const path = container.querySelector('path')
    expect(path).toHaveClass('connection-line--completed')
  })

  it('adds error class when status is error', () => {
    const { container } = renderLine(NodeStatus.Error)
    const path = container.querySelector('path')
    expect(path).toHaveClass('connection-line--error')
  })

  it('generates a bezier curve path', () => {
    const { container } = renderLine()
    const path = container.querySelector('path')
    const d = path?.getAttribute('d') ?? ''
    expect(d).toContain('M 0 50')
    expect(d).toContain('C')
    expect(d).toContain('200 50')
  })
})

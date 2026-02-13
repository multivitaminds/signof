import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useCanvasStore from '../../stores/useCanvasStore'
import CanvasControls from './CanvasControls'

describe('CanvasControls', () => {
  beforeEach(() => {
    useCanvasStore.setState({ viewport: { x: 0, y: 0, zoom: 1 } })
  })

  it('renders zoom level', () => {
    render(<CanvasControls />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('renders zoom in, zoom out, and fit buttons', () => {
    render(<CanvasControls />)
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
    expect(screen.getByLabelText('Fit to screen')).toBeInTheDocument()
  })

  it('increases zoom when zoom in is clicked', async () => {
    const user = userEvent.setup()
    render(<CanvasControls />)
    await user.click(screen.getByLabelText('Zoom in'))
    expect(screen.getByText('110%')).toBeInTheDocument()
  })

  it('decreases zoom when zoom out is clicked', async () => {
    const user = userEvent.setup()
    render(<CanvasControls />)
    await user.click(screen.getByLabelText('Zoom out'))
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('resets zoom when fit to screen is clicked', async () => {
    const user = userEvent.setup()
    useCanvasStore.setState({ viewport: { x: 50, y: 50, zoom: 1.5 } })
    render(<CanvasControls />)

    await user.click(screen.getByLabelText('Fit to screen'))
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('disables zoom out at minimum zoom', () => {
    useCanvasStore.setState({ viewport: { x: 0, y: 0, zoom: 0.25 } })
    render(<CanvasControls />)
    expect(screen.getByLabelText('Zoom out')).toBeDisabled()
  })

  it('disables zoom in at maximum zoom', () => {
    useCanvasStore.setState({ viewport: { x: 0, y: 0, zoom: 2 } })
    render(<CanvasControls />)
    expect(screen.getByLabelText('Zoom in')).toBeDisabled()
  })
})

import { render, screen } from '@testing-library/react'
import ModuleHeader from './ModuleHeader'

describe('ModuleHeader', () => {
  it('renders title', () => {
    render(<ModuleHeader title="Documents" />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<ModuleHeader title="Documents" subtitle="Manage contracts" />)
    expect(screen.getByText('Manage contracts')).toBeInTheDocument()
  })

  it('renders actions when provided', () => {
    render(<ModuleHeader title="Documents" actions={<button>New</button>} />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const { container } = render(<ModuleHeader title="Documents" />)
    expect(container.querySelector('.module-header__subtitle')).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RolePermissions from './RolePermissions'

describe('RolePermissions', () => {
  it('renders the toggle button', () => {
    render(<RolePermissions />)
    expect(screen.getByText('Role Permissions')).toBeInTheDocument()
  })

  it('starts collapsed and expands on click', async () => {
    const user = userEvent.setup()
    render(<RolePermissions />)

    // Panel should not be visible initially
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    // Click to expand
    await user.click(screen.getByText('Role Permissions'))
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('shows all permission rows when expanded', async () => {
    const user = userEvent.setup()
    render(<RolePermissions />)

    await user.click(screen.getByText('Role Permissions'))

    expect(screen.getByText('Manage team')).toBeInTheDocument()
    expect(screen.getByText('Manage billing')).toBeInTheDocument()
    expect(screen.getByText('Create content')).toBeInTheDocument()
    expect(screen.getByText('Edit content')).toBeInTheDocument()
    expect(screen.getByText('View content')).toBeInTheDocument()
    expect(screen.getByText('Delete content')).toBeInTheDocument()
    expect(screen.getByText('Manage integrations')).toBeInTheDocument()
    expect(screen.getByText('Manage settings')).toBeInTheDocument()
  })

  it('shows all role column headers when expanded', async () => {
    const user = userEvent.setup()
    render(<RolePermissions />)

    await user.click(screen.getByText('Role Permissions'))

    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Member')).toBeInTheDocument()
    expect(screen.getByText('Guest')).toBeInTheDocument()
  })
})

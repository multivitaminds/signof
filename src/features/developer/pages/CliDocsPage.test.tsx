import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CliDocsPage from './CliDocsPage'

describe('CliDocsPage', () => {
  it('renders the page title and subtitle', () => {
    render(<CliDocsPage />)

    expect(screen.getByText('CLI Reference')).toBeInTheDocument()
    expect(
      screen.getByText(/The SignOf CLI lets you manage documents/)
    ).toBeInTheDocument()
  })

  it('renders installation section with method tabs', () => {
    render(<CliDocsPage />)

    expect(screen.getByText('Installation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'npm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Homebrew' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pip' })).toBeInTheDocument()
  })

  it('switches install method when clicking tabs', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    // Default is npm
    expect(screen.getByText(/Requires Node.js 18/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Homebrew' }))
    expect(screen.getByText(/macOS and Linux/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'pip' }))
    expect(screen.getByText(/Requires Python 3.9/)).toBeInTheDocument()
  })

  it('renders verify installation section', () => {
    render(<CliDocsPage />)

    expect(screen.getByText('Verify Installation')).toBeInTheDocument()
  })

  it('renders the commands section with search bar', () => {
    render(<CliDocsPage />)

    expect(screen.getByRole('heading', { name: 'Commands' })).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Search commands, flags, descriptions...')
    ).toBeInTheDocument()
  })

  it('displays command count', () => {
    render(<CliDocsPage />)

    expect(screen.getByText(/\d+ commands/)).toBeInTheDocument()
  })

  it('renders command groups with category labels', () => {
    render(<CliDocsPage />)

    // These are the <h3> group titles
    const commandGroups = screen.getByRole('heading', { name: 'Commands' }).closest('.cli-docs-page__commands') as HTMLElement
    expect(within(commandGroups).getByText('Authentication')).toBeInTheDocument()
    expect(within(commandGroups).getByText('Documents')).toBeInTheDocument()
    expect(within(commandGroups).getByText('Tax Filings')).toBeInTheDocument()
    expect(within(commandGroups).getByText('Webhooks')).toBeInTheDocument()
    expect(within(commandGroups).getByText('Deployment')).toBeInTheDocument()
    expect(within(commandGroups).getByText('Configuration')).toBeInTheDocument()
    expect(within(commandGroups).getByText('Project')).toBeInTheDocument()
  })

  it('renders deploy commands', () => {
    render(<CliDocsPage />)

    // These are <code> elements inside buttons
    const deployBtns = screen.getAllByRole('button', { expanded: false })
    const deployNames = deployBtns
      .map(btn => {
        const code = btn.querySelector('.cli-docs-page__command-name')
        return code?.textContent
      })
      .filter(Boolean)

    expect(deployNames).toContain('signof deploy')
    expect(deployNames).toContain('signof deploy status')
  })

  it('expands a command when clicked', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    // Find the button for "signof init" (simple, unique name)
    const initButtons = screen.getAllByRole('button', { expanded: false })
    const initBtn = initButtons.find(btn => {
      const code = btn.querySelector('.cli-docs-page__command-name')
      return code?.textContent === 'signof init'
    })!

    await user.click(initBtn)

    // The description appears twice (short in header + full in details), so use getAllByText
    const matches = screen.getAllByText(/Initialize a new SignOf project/)
    expect(matches.length).toBeGreaterThanOrEqual(2) // header desc + full desc
    // Use heading role to distinguish from code block tokens
    expect(screen.getByRole('heading', { name: 'Usage' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Flags' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Examples' })).toBeInTheDocument()
  })

  it('collapses a command when clicked again', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    const initButtons = screen.getAllByRole('button', { expanded: false })
    const initBtn = initButtons.find(btn => {
      const code = btn.querySelector('.cli-docs-page__command-name')
      return code?.textContent === 'signof init'
    })!

    await user.click(initBtn)
    expect(screen.getByRole('heading', { name: 'Usage' })).toBeInTheDocument()

    // Now click the expanded button (it will have aria-expanded=true)
    const expandedBtn = screen.getByRole('button', { expanded: true })
    await user.click(expandedBtn)
    expect(screen.queryByRole('heading', { name: 'Usage' })).not.toBeInTheDocument()
  })

  it('filters commands based on search query', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    const searchInput = screen.getByPlaceholderText(
      'Search commands, flags, descriptions...'
    )
    await user.type(searchInput, 'deploy')

    // Wait for debounce
    await waitFor(() => {
      const commandSection = screen.getByRole('heading', { name: 'Commands' }).closest('.cli-docs-page__commands') as HTMLElement
      expect(within(commandSection).getByText('Deployment')).toBeInTheDocument()
      expect(within(commandSection).queryByText('Authentication')).not.toBeInTheDocument()
    })
  })

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    const searchInput = screen.getByPlaceholderText(
      'Search commands, flags, descriptions...'
    )
    await user.type(searchInput, 'zzzznonexistent')

    await waitFor(() => {
      expect(screen.getByText(/No commands match/)).toBeInTheDocument()
    })
  })

  it('clears search and shows all commands', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    const searchInput = screen.getByPlaceholderText(
      'Search commands, flags, descriptions...'
    )
    await user.type(searchInput, 'deploy')

    // Click clear button
    const clearBtn = screen.getByRole('button', { name: 'Clear search' })
    await user.click(clearBtn)

    // All command groups should be back
    const commandSection = screen.getByRole('heading', { name: 'Commands' }).closest('.cli-docs-page__commands') as HTMLElement
    expect(within(commandSection).getByText('Authentication')).toBeInTheDocument()
    expect(within(commandSection).getByText('Deployment')).toBeInTheDocument()
  })

  it('searches across flag names and descriptions', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    const searchInput = screen.getByPlaceholderText(
      'Search commands, flags, descriptions...'
    )
    // Search for a flag that exists in the deploy command
    await user.type(searchInput, 'rollback')

    // Deploy category should be visible since deploy has --rollback flag
    const commandSection = screen.getByRole('heading', { name: 'Commands' }).closest('.cli-docs-page__commands') as HTMLElement
    expect(within(commandSection).getByText('Deployment')).toBeInTheDocument()
  })

  it('shows updated count when filtering', async () => {
    const user = userEvent.setup()
    render(<CliDocsPage />)

    const searchInput = screen.getByPlaceholderText(
      'Search commands, flags, descriptions...'
    )
    await user.type(searchInput, 'webhook')

    // Wait for debounce, then check filtered count
    await waitFor(() => {
      expect(screen.getByText(/of \d+ commands/)).toBeInTheDocument()
    })
  })
})

import { render, screen } from '@testing-library/react'
import { CalendarPage, DatabasesPage, InboxPage, SettingsPage } from './PlaceholderPages'

describe('PlaceholderPages', () => {
  describe('CalendarPage', () => {
    it('renders calendar title', () => {
      render(<CalendarPage />)
      expect(screen.getByText('Calendar')).toBeInTheDocument()
    })

    it('renders calendar description', () => {
      render(<CalendarPage />)
      expect(screen.getByText(/Schedule meetings effortlessly/)).toBeInTheDocument()
    })

    it('renders Coming Soon badge', () => {
      render(<CalendarPage />)
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })

  describe('DatabasesPage', () => {
    it('renders databases title', () => {
      render(<DatabasesPage />)
      expect(screen.getByText('Databases')).toBeInTheDocument()
    })

    it('renders databases description', () => {
      render(<DatabasesPage />)
      expect(screen.getByText(/Build relational databases/)).toBeInTheDocument()
    })

    it('renders Coming Soon badge', () => {
      render(<DatabasesPage />)
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })

  describe('InboxPage', () => {
    it('renders inbox title', () => {
      render(<InboxPage />)
      expect(screen.getByText('Inbox')).toBeInTheDocument()
    })

    it('renders inbox description', () => {
      render(<InboxPage />)
      expect(screen.getByText(/unified notification center/)).toBeInTheDocument()
    })

    it('renders Coming Soon badge', () => {
      render(<InboxPage />)
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })

  describe('SettingsPage', () => {
    it('renders settings title', () => {
      render(<SettingsPage />)
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders settings description', () => {
      render(<SettingsPage />)
      expect(screen.getByText(/Manage your workspace/)).toBeInTheDocument()
    })

    it('renders Coming Soon badge', () => {
      render(<SettingsPage />)
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })

  it('each placeholder page has icon, title, description, and badge structure', () => {
    const { container } = render(<CalendarPage />)
    expect(container.querySelector('.placeholder-page')).toBeInTheDocument()
    expect(container.querySelector('.placeholder-page__icon')).toBeInTheDocument()
    expect(container.querySelector('.placeholder-page__title')).toBeInTheDocument()
    expect(container.querySelector('.placeholder-page__description')).toBeInTheDocument()
    expect(container.querySelector('.placeholder-page__badge')).toBeInTheDocument()
  })
})

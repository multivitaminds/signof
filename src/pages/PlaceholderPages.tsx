import { FolderKanban, Calendar, Database, Inbox, Settings } from 'lucide-react'
import './PlaceholderPages.css'

interface PlaceholderProps {
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

function PlaceholderPage({ title, description, icon: Icon }: PlaceholderProps) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__icon">
        <Icon size={48} />
      </div>
      <h1 className="placeholder-page__title">{title}</h1>
      <p className="placeholder-page__description">{description}</p>
      <div className="placeholder-page__badge">Coming Soon</div>
    </div>
  )
}

export function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Projects"
      description="Track issues and projects with Linear-speed performance. Kanban boards, list views, and timeline visualization."
      icon={FolderKanban}
    />
  )
}

export function CalendarPage() {
  return (
    <PlaceholderPage
      title="Calendar"
      description="Schedule meetings effortlessly. Create event types, share booking pages, and manage availability."
      icon={Calendar}
    />
  )
}

export function DatabasesPage() {
  return (
    <PlaceholderPage
      title="Databases"
      description="Build relational databases with multiple views. Grid, Kanban, Calendar, Gallery, and Form views on the same data."
      icon={Database}
    />
  )
}

export function InboxPage() {
  return (
    <PlaceholderPage
      title="Inbox"
      description="Your unified notification center. Stay on top of signatures, comments, mentions, and assignments."
      icon={Inbox}
    />
  )
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Manage your workspace, team members, integrations, and preferences."
      icon={Settings}
    />
  )
}

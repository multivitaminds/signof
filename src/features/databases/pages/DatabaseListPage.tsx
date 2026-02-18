import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Plus, MoreHorizontal, Trash2, Pencil, Search, Users, ClipboardList, Calendar, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useDatabaseStore } from '../stores/useDatabaseStore'
import { getIconComponent, isEmojiIcon } from '../../../lib/iconMap'
import { DbFieldType } from '../types'
import './DatabaseListPage.css'

interface TemplateDefinition {
  key: string
  name: string
  icon: string
  iconComponent: LucideIcon
  iconColor: string
  description: string
  fields: Array<{ name: string; type: DbFieldType }>
}

const TEMPLATES: TemplateDefinition[] = [
  {
    key: 'crm',
    name: 'CRM',
    icon: 'users',
    iconComponent: Users,
    iconColor: '#3B82F6',
    description: 'Contacts, deals, and activities',
    fields: [
      { name: 'Email', type: DbFieldType.Email },
      { name: 'Phone', type: DbFieldType.Phone },
      { name: 'Company', type: DbFieldType.Text },
      { name: 'Deal Value', type: DbFieldType.Number },
      { name: 'Stage', type: DbFieldType.Select },
      { name: 'Last Contact', type: DbFieldType.Date },
    ],
  },
  {
    key: 'project',
    name: 'Project Tracker',
    icon: 'list',
    iconComponent: ClipboardList,
    iconColor: '#10B981',
    description: 'Tasks, status, and priority',
    fields: [
      { name: 'Status', type: DbFieldType.Select },
      { name: 'Priority', type: DbFieldType.Select },
      { name: 'Assignee', type: DbFieldType.Text },
      { name: 'Due Date', type: DbFieldType.Date },
      { name: 'Done', type: DbFieldType.Checkbox },
    ],
  },
  {
    key: 'content',
    name: 'Content Calendar',
    icon: 'calendar',
    iconComponent: Calendar,
    iconColor: '#F59E0B',
    description: 'Posts, platforms, and dates',
    fields: [
      { name: 'Platform', type: DbFieldType.Select },
      { name: 'Publish Date', type: DbFieldType.Date },
      { name: 'Status', type: DbFieldType.Select },
      { name: 'URL', type: DbFieldType.Url },
      { name: 'Tags', type: DbFieldType.MultiSelect },
    ],
  },
  {
    key: 'inventory',
    name: 'Inventory',
    icon: 'package',
    iconComponent: Package,
    iconColor: '#64748B',
    description: 'Products, quantities, and prices',
    fields: [
      { name: 'SKU', type: DbFieldType.Text },
      { name: 'Quantity', type: DbFieldType.Number },
      { name: 'Price', type: DbFieldType.Number },
      { name: 'Category', type: DbFieldType.Select },
      { name: 'In Stock', type: DbFieldType.Checkbox },
    ],
  },
]

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function DatabaseListPage() {
  const navigate = useNavigate()
  const databasesMap = useDatabaseStore((s) => s.databases)
  const tablesMap = useDatabaseStore((s) => s.tables)
  const addDatabase = useDatabaseStore((s) => s.addDatabase)
  const addField = useDatabaseStore((s) => s.addField)
  const deleteDatabase = useDatabaseStore((s) => s.deleteDatabase)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const databases = useMemo(
    () => Object.values(databasesMap).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [databasesMap]
  )

  const filteredDatabases = useMemo(() => {
    if (!searchQuery.trim()) return databases
    const q = searchQuery.toLowerCase()
    return databases.filter(
      (db) =>
        db.name.toLowerCase().includes(q) ||
        db.description.toLowerCase().includes(q)
    )
  }, [databases, searchQuery])

  const handleNew = useCallback(() => {
    const id = addDatabase('Untitled Database', '\uD83D\uDCCA', '')
    navigate(`/data/${id}`)
  }, [addDatabase, navigate])

  const handleDelete = useCallback((id: string) => {
    deleteDatabase(id)
    setMenuOpen(null)
  }, [deleteDatabase])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, dbId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(`/data/${dbId}`)
    }
  }, [navigate])

  const handleTemplateClick = useCallback((template: TemplateDefinition) => {
    const dbId = addDatabase(template.name, template.icon, template.description)
    const db = useDatabaseStore.getState().databases[dbId]
    const tableId = db?.tables[0]
    if (tableId) {
      for (const field of template.fields) {
        addField(tableId, field.name, field.type)
      }
    }
    navigate(`/data/${dbId}`)
  }, [addDatabase, addField, navigate])

  return (
    <div className="db-list-page">
      {/* Compact Header */}
      <div className="db-list-page__header">
        <div className="db-list-page__header-left">
          <div className="db-list-page__header-icon">
            <Database size={20} />
          </div>
          <div>
            <h1 className="db-list-page__header-title">Databases</h1>
            <p className="db-list-page__header-subtitle">Organize anything with powerful relational databases</p>
          </div>
        </div>
        <div className="db-list-page__header-right">
          <span className="db-list-page__header-count">
            {databases.length} database{databases.length !== 1 ? 's' : ''}
          </span>
          <button className="db-list-page__new-btn" onClick={handleNew}>
            <Plus size={16} /> New Database
          </button>
        </div>
      </div>

      {/* Template Gallery */}
      <div className="db-list-page__templates">
        <div className="db-list-page__section-header">
          <h2 className="db-list-page__section-title">Start from template</h2>
        </div>
        <div className="db-list-page__templates-grid">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              className="db-list-page__template-card"
              onClick={() => handleTemplateClick(tpl)}
              aria-label={`Create database from ${tpl.name} template`}
              style={{ '--tpl-icon-color': tpl.iconColor } as React.CSSProperties}
            >
              <div className="db-list-page__template-icon">
                <tpl.iconComponent size={20} />
              </div>
              <div className="db-list-page__template-body">
                <h3 className="db-list-page__template-name">{tpl.name}</h3>
                <p className="db-list-page__template-desc">{tpl.description}</p>
                <div className="db-list-page__template-fields">
                  {tpl.fields.slice(0, 3).map((f) => (
                    <span key={f.name} className="db-list-page__template-field-tag">{f.name}</span>
                  ))}
                  {tpl.fields.length > 3 && (
                    <span className="db-list-page__template-field-tag">+{tpl.fields.length - 3}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search / Filter Bar */}
      {databases.length > 0 && (
        <div className="db-list-page__toolbar">
          <div className="db-list-page__section-header" style={{ marginBottom: 0 }}>
            <h2 className="db-list-page__section-title">Recent</h2>
          </div>
          <div className="db-list-page__toolbar-right">
            <div className="db-list-page__search">
              <Search size={14} className="db-list-page__search-icon" />
              <input
                className="db-list-page__search-input"
                type="text"
                placeholder="Search databases..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search databases"
              />
            </div>
            <span className="db-list-page__count">
              {filteredDatabases.length} of {databases.length}
            </span>
          </div>
        </div>
      )}

      {/* Database Grid or Empty State */}
      {databases.length === 0 ? (
        <div className="db-list-page__empty">
          <div className="db-list-page__empty-icon">
            <Database size={36} />
          </div>
          <h2>No databases yet</h2>
          <p>
            Create your first database to organize data with grid, kanban, calendar, and gallery views. Or pick a template above to get started quickly.
          </p>
          <button className="db-list-page__new-btn" onClick={handleNew}>
            <Plus size={16} /> Create Database
          </button>
        </div>
      ) : filteredDatabases.length === 0 ? (
        <div className="db-list-page__no-results">
          <Search size={32} />
          <p>No databases match &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <div className="db-list-page__grid">
          {filteredDatabases.map((db) => {
            const tableCount = db.tables.length
            const rowCount = db.tables.reduce((sum, tid) => sum + (tablesMap[tid]?.rows.length ?? 0), 0)
            return (
              <div
                key={db.id}
                className="db-list-page__card"
                onClick={() => navigate(`/data/${db.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleCardKeyDown(e, db.id)}
              >
                <div className="db-list-page__card-top">
                  <div className="db-list-page__card-icon">
                    {(() => {
                      if (isEmojiIcon(db.icon)) return db.icon
                      const IC = getIconComponent(db.icon)
                      return IC ? <IC size={20} /> : db.icon
                    })()}
                  </div>
                  <div className="db-list-page__card-body">
                    <h3 className="db-list-page__card-name">{db.name}</h3>
                    {db.description && <p className="db-list-page__card-desc">{db.description}</p>}
                  </div>
                  <div className="db-list-page__card-actions">
                    <button
                      className="db-list-page__menu-btn"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === db.id ? null : db.id) }}
                      aria-label="Database options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {menuOpen === db.id && (
                      <div className="db-list-page__menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { navigate(`/data/${db.id}`); setMenuOpen(null) }}>
                          <Pencil size={14} /> Edit
                        </button>
                        <button className="db-list-page__menu-danger" onClick={() => handleDelete(db.id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="db-list-page__card-badges">
                  <span className="db-list-page__badge">
                    <span className="db-list-page__badge-dot" />
                    {tableCount} table{tableCount !== 1 ? 's' : ''}
                  </span>
                  <span className="db-list-page__badge">
                    <span className="db-list-page__badge-dot db-list-page__badge-dot--rows" />
                    {rowCount} row{rowCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="db-list-page__card-footer">
                  <span className="db-list-page__card-updated">
                    Updated {formatRelativeTime(db.updatedAt)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

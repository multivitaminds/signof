import { useCallback, useState } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import './GeneralSettings.css'

export default function GeneralSettings() {
  const workspace = useSettingsStore((s) => s.workspace)
  const updateWorkspace = useSettingsStore((s) => s.updateWorkspace)
  const [name, setName] = useState(workspace.name)
  const [slug, setSlug] = useState(workspace.slug)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleSaveName = useCallback(() => {
    updateWorkspace({ name: name.trim() || workspace.name })
  }, [name, workspace.name, updateWorkspace])

  const handleSaveSlug = useCallback(() => {
    const sanitized = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const finalSlug = sanitized || workspace.slug
    setSlug(finalSlug)
    updateWorkspace({ slug: finalSlug })
  }, [slug, workspace.slug, updateWorkspace])

  const handleOpenDeleteModal = useCallback(() => {
    setShowDeleteModal(true)
    setDeleteConfirmText('')
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false)
    setDeleteConfirmText('')
  }, [])

  const handleDeleteWorkspace = useCallback(() => {
    if (deleteConfirmText === workspace.name) {
      // In a real app, this would call an API and redirect
      setShowDeleteModal(false)
    }
  }, [deleteConfirmText, workspace.name])

  return (
    <div className="general-settings">
      <h1 className="general-settings__title">General</h1>
      <p className="general-settings__subtitle">Manage your workspace settings</p>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Workspace Name</h3>
        <div className="general-settings__field">
          <input
            className="general-settings__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
            aria-label="Workspace name"
          />
          <button className="btn-primary general-settings__save-btn" onClick={handleSaveName}>
            Save
          </button>
        </div>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Workspace URL</h3>
        <p className="general-settings__field-hint">
          This is your workspace&apos;s unique URL slug.
        </p>
        <div className="general-settings__field">
          <div className="general-settings__url-field">
            <span className="general-settings__url-prefix">signof.com/</span>
            <input
              className="general-settings__input general-settings__input--slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={handleSaveSlug}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSlug() }}
              aria-label="Workspace URL slug"
            />
          </div>
        </div>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Timezone</h3>
        <select
          className="general-settings__select"
          value={workspace.timezone}
          onChange={(e) => updateWorkspace({ timezone: e.target.value })}
          aria-label="Timezone"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="America/Anchorage">Alaska Time (AKT)</option>
          <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Paris">Paris (CET)</option>
          <option value="Europe/Berlin">Berlin (CET)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="Asia/Shanghai">Shanghai (CST)</option>
          <option value="Asia/Kolkata">Mumbai (IST)</option>
          <option value="Australia/Sydney">Sydney (AEST)</option>
        </select>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Date Format</h3>
        <select
          className="general-settings__select"
          value={workspace.dateFormat}
          onChange={(e) => updateWorkspace({ dateFormat: e.target.value })}
          aria-label="Date format"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div className="general-settings__section">
        <h3 className="general-settings__section-title">Language</h3>
        <select
          className="general-settings__select"
          value={workspace.language}
          onChange={(e) => updateWorkspace({ language: e.target.value })}
          aria-label="Language"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>
      </div>

      <div className="general-settings__section general-settings__danger">
        <h3 className="general-settings__section-title">Danger Zone</h3>
        <p className="general-settings__danger-text">
          Permanently delete this workspace and all its data. This action cannot be undone.
        </p>
        <button className="btn-danger" onClick={handleOpenDeleteModal}>Delete Workspace</button>
      </div>

      {showDeleteModal && (
        <div
          className="general-settings__modal-overlay"
          onClick={handleCloseDeleteModal}
          role="dialog"
          aria-modal="true"
          aria-label="Delete workspace confirmation"
        >
          <div
            className="general-settings__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="general-settings__modal-title">Delete Workspace</h3>
            <p className="general-settings__modal-text">
              This will permanently delete <strong>{workspace.name}</strong> and all of its data,
              including documents, pages, projects, and team members. This action cannot be undone.
            </p>
            <p className="general-settings__modal-text">
              Type <strong>{workspace.name}</strong> to confirm:
            </p>
            <input
              className="general-settings__input general-settings__modal-input"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={workspace.name}
              aria-label="Type workspace name to confirm deletion"
            />
            <div className="general-settings__modal-actions">
              <button
                className="btn-secondary"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteWorkspace}
                disabled={deleteConfirmText !== workspace.name}
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

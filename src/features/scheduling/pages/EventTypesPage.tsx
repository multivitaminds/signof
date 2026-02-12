import { useState, useCallback } from 'react'
import { Plus, Copy, Trash2, MoreVertical, CalendarDays, Share2 } from 'lucide-react'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import type { EventType } from '../types'
import EventTypeCard from '../components/EventTypeCard/EventTypeCard'
import EventTypeEditor from '../components/EventTypeEditor/EventTypeEditor'
import { useSchedulingShortcuts } from '../hooks/useSchedulingShortcuts'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ShareBooking from '../components/ShareBooking/ShareBooking'
import './EventTypesPage.css'

export default function EventTypesPage() {
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const bookings = useSchedulingStore((s) => s.bookings)
  const addEventType = useSchedulingStore((s) => s.addEventType)
  const updateEventType = useSchedulingStore((s) => s.updateEventType)
  const deleteEventType = useSchedulingStore((s) => s.deleteEventType)
  const duplicateEventType = useSchedulingStore((s) => s.duplicateEventType)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingEventType, setEditingEventType] = useState<EventType | undefined>(undefined)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [sharingEventType, setSharingEventType] = useState<EventType | null>(null)

  useSchedulingShortcuts({
    onNewEventType: () => {
      setEditingEventType(undefined)
      setEditorOpen(true)
    },
  })

  const handleToggleActive = useCallback(
    (id: string, active: boolean) => {
      updateEventType(id, { isActive: active })
    },
    [updateEventType]
  )

  const handleCreateNew = useCallback(() => {
    setEditingEventType(undefined)
    setEditorOpen(true)
  }, [])

  const handleEdit = useCallback(
    (et: EventType) => {
      setEditingEventType(et)
      setEditorOpen(true)
      setMenuOpenId(null)
    },
    []
  )

  const handleSave = useCallback(
    (data: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingEventType) {
        updateEventType(editingEventType.id, data)
      } else {
        addEventType(data)
      }
      setEditorOpen(false)
      setEditingEventType(undefined)
    },
    [editingEventType, updateEventType, addEventType]
  )

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateEventType(id)
      setMenuOpenId(null)
    },
    [duplicateEventType]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteEventType(id)
      setDeleteConfirmId(null)
      setMenuOpenId(null)
    },
    [deleteEventType]
  )

  const handleCloseEditor = useCallback(() => {
    setEditorOpen(false)
    setEditingEventType(undefined)
  }, [])

  const toggleMenu = useCallback(
    (id: string) => {
      setMenuOpenId((prev) => (prev === id ? null : id))
      setDeleteConfirmId(null)
    },
    []
  )

  return (
    <div className="event-types-page">
      <div className="event-types-page__header">
        <p className="event-types-page__subtitle">
          Create and manage your event types for booking
        </p>
        <button className="btn-primary" onClick={handleCreateNew}>
          <Plus size={16} /> New Event Type
        </button>
      </div>

      {eventTypes.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={36} />}
          title="Create your first event type"
          description="Set up booking links for meetings, calls, and appointments. Share your availability and let others schedule time with you."
          action={{ label: 'Create Event Type', onClick: handleCreateNew }}
        />
      ) : (
        <div className="event-types-page__grid">
          {eventTypes.map((et) => {
            const count = bookings.filter((b) => b.eventTypeId === et.id).length
            return (
              <div key={et.id} className="event-types-page__card-wrapper">
                <EventTypeCard
                  eventType={et}
                  bookingCount={count}
                  onClick={() => handleEdit(et)}
                  onToggleActive={(active) => handleToggleActive(et.id, active)}
                />

                {/* Context menu trigger */}
                <div className="event-types-page__menu-container">
                  <button
                    className="event-types-page__menu-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMenu(et.id)
                    }}
                    aria-label={`Actions for ${et.name}`}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {menuOpenId === et.id && (
                    <div
                      className="event-types-page__menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="event-types-page__menu-item"
                        onClick={() => handleEdit(et)}
                      >
                        Edit
                      </button>
                      <button
                        className="event-types-page__menu-item"
                        onClick={() => handleDuplicate(et.id)}
                      >
                        <Copy size={13} />
                        Duplicate
                      </button>
                      <button
                        className="event-types-page__menu-item"
                        onClick={() => {
                          setSharingEventType(et)
                          setMenuOpenId(null)
                        }}
                      >
                        <Share2 size={13} />
                        Share
                      </button>
                      {deleteConfirmId === et.id ? (
                        <button
                          className="event-types-page__menu-item event-types-page__menu-item--danger"
                          onClick={() => handleDelete(et.id)}
                        >
                          <Trash2 size={13} />
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          className="event-types-page__menu-item event-types-page__menu-item--danger"
                          onClick={() => setDeleteConfirmId(et.id)}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Click-away handler for menus */}
      {menuOpenId && (
        <div
          className="event-types-page__backdrop"
          onClick={() => {
            setMenuOpenId(null)
            setDeleteConfirmId(null)
          }}
        />
      )}

      {/* EventTypeEditor Modal */}
      {editorOpen && (
        <EventTypeEditor
          eventType={editingEventType}
          onSave={handleSave}
          onClose={handleCloseEditor}
        />
      )}

      {/* ShareBooking Modal */}
      {sharingEventType && (
        <ShareBooking
          eventType={sharingEventType}
          isOpen={true}
          onClose={() => setSharingEventType(null)}
        />
      )}
    </div>
  )
}

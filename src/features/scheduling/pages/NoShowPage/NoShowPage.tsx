import { useCallback } from 'react'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import NoShowManager from '../../components/NoShowManager/NoShowManager'
import './NoShowPage.css'

export default function NoShowPage() {
  const bookings = useSchedulingStore((s) => s.bookings)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const markNoShow = useSchedulingStore((s) => s.markNoShow)
  const undoNoShow = useSchedulingStore((s) => s.undoNoShow)

  const handleMarkNoShow = useCallback(
    (bookingId: string) => {
      markNoShow(bookingId)
    },
    [markNoShow]
  )

  const handleUndoNoShow = useCallback(
    (bookingId: string) => {
      undoNoShow(bookingId)
    },
    [undoNoShow]
  )

  return (
    <div className="no-show-page">
      <div className="no-show-page__header">
        <h2 className="no-show-page__title">No-Show Tracking</h2>
        <p className="no-show-page__subtitle">
          Track and manage attendee no-shows across your event types
        </p>
      </div>
      <NoShowManager
        bookings={bookings}
        eventTypes={eventTypes}
        onMarkNoShow={handleMarkNoShow}
        onUndoNoShow={handleUndoNoShow}
      />
    </div>
  )
}

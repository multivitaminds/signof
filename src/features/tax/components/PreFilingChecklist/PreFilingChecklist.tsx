import type { ChecklistItem, ChecklistItemId } from '../../stores/useTaxFilingStore'

interface PreFilingChecklistProps {
  checklist: ChecklistItem[]
  progress: number
  showChecklist: boolean
  onToggle: () => void
  onToggleItem: (id: ChecklistItemId) => void
}

export default function PreFilingChecklist({
  checklist,
  progress,
  showChecklist,
  onToggle,
  onToggleItem,
}: PreFilingChecklistProps) {
  return (
    <div className="tax-filing__checklist">
      <button
        className="tax-filing__checklist-toggle"
        onClick={onToggle}
        type="button"
        aria-expanded={showChecklist}
      >
        <div className="tax-filing__checklist-toggle-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {showChecklist ? (
              <polyline points="6 9 12 15 18 9" />
            ) : (
              <polyline points="9 18 15 12 9 6" />
            )}
          </svg>
          <span className="tax-filing__checklist-title">Pre-Filing Checklist</span>
        </div>
        <div className="tax-filing__checklist-progress-mini">
          <span className="tax-filing__checklist-progress-text">
            {progress}%
          </span>
          <div className="tax-filing__checklist-progress-bar-mini">
            <div
              className="tax-filing__checklist-progress-fill-mini"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      {showChecklist && (
        <div className="tax-filing__checklist-items">
          {checklist.map((item) => (
            <label
              key={item.id}
              className={`tax-filing__checklist-item ${
                item.completed ? 'tax-filing__checklist-item--completed' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleItem(item.id)}
                className="tax-filing__checklist-checkbox"
              />
              <div className="tax-filing__checklist-item-info">
                <span className="tax-filing__checklist-item-label">{item.label}</span>
                <span className="tax-filing__checklist-item-desc">{item.description}</span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

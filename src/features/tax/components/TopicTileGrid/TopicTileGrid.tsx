import { useCallback } from 'react'
import {
  FileText,
  DollarSign,
  TrendingUp,
  Home,
  Briefcase,
  Clock,
  Heart,
  GraduationCap,
  Building,
  Check,
} from 'lucide-react'
import './TopicTileGrid.css'

interface TaxTopic {
  id: string
  label: string
  description: string
  icon: string
}

interface TopicTileGridProps {
  topics: TaxTopic[]
  selectedTopics: string[]
  onToggle: (topicId: string) => void
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'file-text': <FileText size={24} />,
  'dollar-sign': <DollarSign size={24} />,
  'trending-up': <TrendingUp size={24} />,
  'home': <Home size={24} />,
  'briefcase': <Briefcase size={24} />,
  'clock': <Clock size={24} />,
  'heart': <Heart size={24} />,
  'graduation-cap': <GraduationCap size={24} />,
  'building': <Building size={24} />,
}

function TopicTileGrid({ topics, selectedTopics, onToggle }: TopicTileGridProps) {
  const handleToggle = useCallback(
    (topicId: string) => {
      onToggle(topicId)
    },
    [onToggle]
  )

  return (
    <div className="topic-tile-grid" role="group" aria-label="Tax topics">
      {topics.map((topic) => {
        const isSelected = selectedTopics.includes(topic.id)
        return (
          <button
            key={topic.id}
            type="button"
            className={`topic-tile-grid__tile${isSelected ? ' topic-tile-grid__tile--selected' : ''}`}
            onClick={() => handleToggle(topic.id)}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <span className="topic-tile-grid__check">
                <Check size={16} />
              </span>
            )}
            <span className="topic-tile-grid__icon">
              {ICON_MAP[topic.icon] ?? <FileText size={24} />}
            </span>
            <span className="topic-tile-grid__label">{topic.label}</span>
            <span className="topic-tile-grid__desc">{topic.description}</span>
          </button>
        )
      })}
    </div>
  )
}

export default TopicTileGrid

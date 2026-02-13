import { useState, useCallback } from 'react'
import { Play, ChevronDown, ChevronUp } from 'lucide-react'
import './DemoVideo.css'

interface DemoVideoProps {
  title: string
  description: string
  duration: string
  thumbnail?: string
}

function DemoVideo({ title, description, duration }: DemoVideoProps) {
  return (
    <div className="demo-video" role="article" aria-label={`Demo video: ${title}`}>
      <div className="demo-video__thumbnail">
        <div className="demo-video__play-overlay">
          <Play size={24} fill="currentColor" />
        </div>
        <span className="demo-video__duration">{duration}</span>
      </div>
      <div className="demo-video__info">
        <h4 className="demo-video__title">{title}</h4>
        <p className="demo-video__description">{description}</p>
      </div>
    </div>
  )
}

export interface DemoVideoData {
  title: string
  description: string
  duration: string
}

interface DemoVideoSectionProps {
  videos: DemoVideoData[]
}

export function DemoVideoSection({ videos }: DemoVideoSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen(v => !v), [])

  return (
    <section className="demo-video-section">
      <button
        className="demo-video-section__header"
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <Play size={16} />
        <span className="demo-video-section__label">Demo Videos</span>
        <span className="demo-video-section__count">{videos.length}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="demo-video-section__grid">
          {videos.map(v => (
            <DemoVideo key={v.title} title={v.title} description={v.description} duration={v.duration} />
          ))}
        </div>
      )}
    </section>
  )
}

export default DemoVideo

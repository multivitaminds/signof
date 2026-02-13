import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, X, ChevronDown, ChevronUp } from 'lucide-react'
import './DemoVideo.css'

interface DemoVideoProps {
  title: string
  description: string
  duration: string
  thumbnail?: string
}

/* ─── Video Player Modal ─────────────────────────────── */

interface VideoPlayerModalProps {
  title: string
  description: string
  duration: string
  onClose: () => void
}

function VideoPlayerModal({ title, description, duration, onClose }: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const parseDuration = useCallback((dur: string): number => {
    const parts = dur.split(':').map(Number)
    if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0)
    if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
    return 120
  }, [])

  const totalSeconds = parseDuration(duration)

  const formatTime = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  const currentSeconds = Math.floor((progress / 100) * totalSeconds)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  useEffect(() => {
    if (isPlaying) {
      const interval = 100
      const increment = (interval / (totalSeconds * 1000)) * 100
      progressRef.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + increment
        })
      }, interval)
    } else if (progressRef.current !== null) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
    return () => {
      if (progressRef.current !== null) {
        clearInterval(progressRef.current)
      }
    }
  }, [isPlaying, totalSeconds])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && progress >= 100) {
        setProgress(0)
      }
      return !prev
    })
  }, [progress])

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setProgress(pct)
  }, [])

  return (
    <div
      className="vpm-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Video player: ${title}`}
    >
      <div className="vpm-container" ref={modalRef} tabIndex={-1}>
        <button
          className="vpm-close"
          onClick={onClose}
          aria-label="Close video player"
        >
          <X size={20} />
        </button>

        <div className="vpm-screen" onClick={togglePlay}>
          <div className="vpm-screen__gradient" />

          <div className={`vpm-screen__center ${isPlaying ? 'vpm-screen__center--playing' : ''}`}>
            {isPlaying ? (
              <div className="vpm-equalizer" aria-label="Now playing">
                <span className="vpm-equalizer__bar vpm-equalizer__bar--1" />
                <span className="vpm-equalizer__bar vpm-equalizer__bar--2" />
                <span className="vpm-equalizer__bar vpm-equalizer__bar--3" />
                <span className="vpm-equalizer__bar vpm-equalizer__bar--4" />
                <span className="vpm-equalizer__bar vpm-equalizer__bar--5" />
              </div>
            ) : (
              <div className="vpm-play-btn">
                <Play size={32} fill="currentColor" />
              </div>
            )}
          </div>

          {isPlaying && (
            <span className="vpm-screen__now-playing">Now playing</span>
          )}
        </div>

        <div className="vpm-controls">
          <button
            className="vpm-controls__play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>

          <span className="vpm-controls__time">
            {formatTime(currentSeconds)}
          </span>

          <div
            className="vpm-controls__progress"
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Video progress"
          >
            <div className="vpm-controls__progress-track">
              <div
                className={`vpm-controls__progress-fill ${isPlaying ? 'vpm-controls__progress-fill--animated' : ''}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <span className="vpm-controls__time vpm-controls__time--total">
            {duration}
          </span>
        </div>

        <div className="vpm-info">
          <h3 className="vpm-info__title">{title}</h3>
          <p className="vpm-info__description">{description}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Demo Video Card ────────────────────────────────── */

function DemoVideo({ title, description, duration }: DemoVideoProps) {
  const [showModal, setShowModal] = useState(false)

  const openModal = useCallback(() => setShowModal(true), [])
  const closeModal = useCallback(() => setShowModal(false), [])

  return (
    <>
      <button
        className="demo-video"
        onClick={openModal}
        aria-label={`Play demo video: ${title}`}
      >
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
      </button>

      {showModal && (
        <VideoPlayerModal
          title={title}
          description={description}
          duration={duration}
          onClose={closeModal}
        />
      )}
    </>
  )
}

/* ─── Demo Video Section ─────────────────────────────── */

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

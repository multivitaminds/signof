import { Brain, Zap, Shield } from 'lucide-react'
import { formatTokenCount, TOKEN_BUDGET } from '../../lib/tokenCount'
import { CATEGORY_META } from '../../lib/memoryTemplates'
import type { MemoryCategory } from '../../types'
import './MemoryHero.css'

interface MemoryHeroProps {
  totalTokens: number
  entryCount: number
  categoryStats: Array<{ category: MemoryCategory; count: number; tokenCount: number }>
}

const VALUE_PROPS = [
  { Icon: Brain, text: 'Stores decisions, workflows, and team knowledge' },
  { Icon: Zap, text: 'Copilot agents read memory to give contextual answers' },
  { Icon: Shield, text: '1M tokens of persistent, encrypted context' },
] as const

const RING_SIZE = 120
const RING_STROKE = 10
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function MemoryHero({ totalTokens, entryCount, categoryStats }: MemoryHeroProps) {
  const usagePercent = Math.min(totalTokens / TOKEN_BUDGET, 1)

  // Build category segments
  const segments: Array<{ color: string; offset: number; length: number }> = []
  let cumulativeOffset = 0

  for (const stat of categoryStats) {
    if (stat.tokenCount === 0) continue
    const meta = CATEGORY_META.find((m) => m.key === stat.category)
    if (!meta) continue

    const segmentFraction = stat.tokenCount / TOKEN_BUDGET
    const segmentLength = segmentFraction * RING_CIRCUMFERENCE

    segments.push({
      color: meta.color,
      offset: cumulativeOffset,
      length: segmentLength,
    })

    cumulativeOffset += segmentLength
  }

  return (
    <section className="memory-hero" aria-label="Context Memory overview">
      <div className="memory-hero__left">
        <h2 className="memory-hero__title">Context Memory</h2>
        <p className="memory-hero__headline">
          Your organization&apos;s living knowledge base
        </p>
        <ul className="memory-hero__values">
          {VALUE_PROPS.map(({ Icon, text }) => (
            <li key={text} className="memory-hero__value-item">
              <Icon className="memory-hero__value-icon" size={18} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="memory-hero__right">
        <svg
          className="memory-hero__ring"
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          aria-label={`Memory usage: ${Math.round(usagePercent * 100)}% of ${formatTokenCount(TOKEN_BUDGET)} tokens`}
          role="img"
        >
          {/* Background ring */}
          <circle
            className="memory-hero__ring-bg"
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
          />

          {/* Category segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              className="memory-hero__ring-segment"
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={RING_STROKE}
              strokeDasharray={`${seg.length} ${RING_CIRCUMFERENCE - seg.length}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          ))}

          {/* Center text */}
          <text
            className="memory-hero__ring-text"
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {formatTokenCount(totalTokens)}
          </text>
        </svg>

        <span className="memory-hero__entry-count">
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>
    </section>
  )
}

export default MemoryHero

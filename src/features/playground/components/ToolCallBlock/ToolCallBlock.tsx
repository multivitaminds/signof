import { useState, useCallback } from 'react'
import { ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react'
import type { ToolCall } from '../../types'
import { ToolCallStatus } from '../../types'
import CodeBlock from '../../../../features/developer/components/CodeBlock/CodeBlock'
import './ToolCallBlock.css'

interface ToolCallBlockProps {
  toolCall: ToolCall
}

const STATUS_ICONS = {
  [ToolCallStatus.Running]: Loader2,
  [ToolCallStatus.Completed]: Check,
  [ToolCallStatus.Error]: AlertCircle,
}

function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false)

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const StatusIcon = STATUS_ICONS[toolCall.status]

  return (
    <div className="tool-call-block">
      <button className="tool-call-block__header" onClick={handleToggle} type="button">
        <StatusIcon
          size={14}
          className={`tool-call-block__status-icon tool-call-block__status-icon--${toolCall.status}`}
        />
        <span className="tool-call-block__name">{toolCall.name}</span>
        <span className="tool-call-block__duration">{toolCall.durationMs}ms</span>
        <ChevronRight
          size={14}
          className={`tool-call-block__chevron${expanded ? ' tool-call-block__chevron--expanded' : ''}`}
        />
      </button>

      {expanded && (
        <div className="tool-call-block__body">
          <div className="tool-call-block__section-label">Input</div>
          <CodeBlock code={toolCall.input} language="json" />
          <div className="tool-call-block__section-label">Output</div>
          {toolCall.output ? (
            <CodeBlock code={toolCall.output} language="json" />
          ) : (
            <p className="tool-call-block__running">Running...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ToolCallBlock

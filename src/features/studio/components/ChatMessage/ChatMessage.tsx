import { useCallback, useMemo } from 'react'
import type { StudioMessage, ToolCall } from '../../types'
import CodeBlock from '../../../../features/developer/components/CodeBlock/CodeBlock'
import './ChatMessage.css'

interface ChatMessageProps {
  message: StudioMessage
}

interface ParsedSegment {
  type: 'text' | 'code-block'
  content: string
  language?: string
}

function parseSegments(content: string): ParsedSegment[] {
  const segments: ParsedSegment[] = []
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    }
    segments.push({
      type: 'code-block',
      content: match[2] ?? '',
      language: match[1] || 'text',
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) })
  }

  return segments
}

function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={`b-${match.index}`}>{match[2]}</strong>)
    } else if (match[4]) {
      parts.push(<em key={`i-${match.index}`}>{match[4]}</em>)
    } else if (match[6]) {
      parts.push(
        <code key={`c-${match.index}`} className="chat-message__inline-code">
          {match[6]}
        </code>
      )
    }
    lastIdx = match.index + match[0].length
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx))
  }
  return parts
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!
    const ulMatch = line.match(/^[\s]*[-*]\s+(.+)/)
    const olMatch = line.match(/^[\s]*(\d+)\.\s+(.+)/)

    if (ulMatch) {
      const items: string[] = []
      while (i < lines.length && lines[i]!.match(/^[\s]*[-*]\s+(.+)/)) {
        items.push(lines[i]!.match(/^[\s]*[-*]\s+(.+)/)![1]!)
        i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="chat-message__list">
          {items.map((item, idx) => <li key={idx}>{formatInline(item)}</li>)}
        </ul>
      )
      continue
    }

    if (olMatch) {
      const items: string[] = []
      while (i < lines.length && lines[i]!.match(/^[\s]*\d+\.\s+(.+)/)) {
        items.push(lines[i]!.match(/^[\s]*\d+\.\s+(.+)/)![1]!)
        i++
      }
      nodes.push(
        <ol key={`ol-${i}`} className="chat-message__list">
          {items.map((item, idx) => <li key={idx}>{formatInline(item)}</li>)}
        </ol>
      )
      continue
    }

    if (line.trim() !== '') {
      nodes.push(<span key={`line-${i}`}>{formatInline(line)}</span>)
    }
    if (i < lines.length - 1) {
      nodes.push(<br key={`br-${i}`} />)
    }
    i++
  }
  return nodes
}

function renderToolCalls(toolCalls: ToolCall[]) {
  return (
    <div className="chat-message__tool-calls">
      {toolCalls.map((tc) => (
        <div key={tc.id} className="chat-message__tool-call">
          <span className="chat-message__tool-name">{tc.name}</span>
          <span className={`chat-message__tool-status chat-message__tool-status--${tc.status}`}>
            {tc.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const roleClass = isUser ? 'chat-message--user' : 'chat-message--assistant'

  const segments = useMemo(() => parseSegments(message.content), [message.content])

  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [message.timestamp])

  const renderContent = useCallback(() => {
    return segments.map((segment, idx) => {
      if (segment.type === 'code-block') {
        return (
          <CodeBlock
            key={`code-${idx}`}
            code={segment.content}
            language={segment.language ?? 'text'}
          />
        )
      }
      return <span key={`text-${idx}`}>{renderInlineMarkdown(segment.content)}</span>
    })
  }, [segments])

  return (
    <div className={`chat-message ${roleClass}`} data-testid="chat-message">
      <div className="chat-message__content">
        {renderContent()}
      </div>
      {message.toolCalls.length > 0 && renderToolCalls(message.toolCalls)}
      <span className="chat-message__timestamp">{formattedTime}</span>
    </div>
  )
}

export default ChatMessage

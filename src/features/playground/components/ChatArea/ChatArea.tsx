import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import type { PlaygroundMessage } from '../../types'
import ChatMessage from '../ChatMessage/ChatMessage'
import './ChatArea.css'

interface ChatAreaProps {
  messages: PlaygroundMessage[]
  isTyping: boolean
}

function ChatArea({ messages, isTyping }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, isTyping])

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="chat-area">
        <div className="chat-area__empty">
          <MessageSquare size={64} className="chat-area__empty-icon" />
          <h3 className="chat-area__empty-title">Start a conversation</h3>
          <p className="chat-area__empty-subtitle">Send a message to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-area" ref={scrollRef}>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isTyping && (
        <div className="chat-area__typing" data-testid="typing-indicator">
          <span className="chat-area__typing-dot" />
          <span className="chat-area__typing-dot" />
          <span className="chat-area__typing-dot" />
        </div>
      )}
    </div>
  )
}

export default ChatArea

import { useCallback } from 'react'
import { Wand2 } from 'lucide-react'
import { FEATURE_CONTEXTS, type FeatureKey } from '../../lib/featureContexts'
import useAIFeatureChatStore from '../../stores/useAIFeatureChatStore'
import AIFeatureChatModal from '../AIFeatureChatModal/AIFeatureChatModal'
import './AIFeatureWidget.css'

interface AIFeatureWidgetProps {
  featureKey: FeatureKey
}

export default function AIFeatureWidget({ featureKey }: AIFeatureWidgetProps) {
  const context = FEATURE_CONTEXTS[featureKey]
  const isOpen = useAIFeatureChatStore((s) => s.sessions[featureKey].isOpen)
  const openChat = useAIFeatureChatStore((s) => s.openChat)
  const closeChat = useAIFeatureChatStore((s) => s.closeChat)

  const handleOpen = useCallback(() => {
    openChat(featureKey)
  }, [openChat, featureKey])

  const handleClose = useCallback(() => {
    closeChat(featureKey)
  }, [closeChat, featureKey])

  return (
    <div className="ai-feature-widget">
      <button
        className="ai-feature-widget__btn"
        onClick={handleOpen}
        aria-label={`Ask AI about ${context.label}`}
        title={`Ask AI about ${context.label}`}
        type="button"
      >
        <Wand2 size={22} />
      </button>
      <div className="ai-feature-widget__tooltip">
        Ask AI about {context.label}
      </div>
      <AIFeatureChatModal
        featureKey={featureKey}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </div>
  )
}

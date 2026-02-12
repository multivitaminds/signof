import { useState, useCallback, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import './VoiceInputButton.css'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [hasError, setHasError] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const SpeechRecognitionApi =
    typeof SpeechRecognition !== 'undefined'
      ? SpeechRecognition
      : typeof webkitSpeechRecognition !== 'undefined'
        ? webkitSpeechRecognition
        : undefined

  const handleToggle = useCallback(() => {
    if (!SpeechRecognitionApi) return

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognitionApi()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0]
      if (result?.[0]) {
        onTranscript(result[0].transcript)
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
      setHasError(true)
      setTimeout(() => setHasError(false), 2000)
    }

    recognition.onend = () => {
      setIsRecording(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setIsRecording(true)
    recognition.start()
  }, [SpeechRecognitionApi, isRecording, onTranscript])

  // Hide if Speech API not supported
  if (!SpeechRecognitionApi) return null

  const btnClass = [
    'voice-input__btn',
    isRecording ? 'voice-input__btn--recording' : '',
    hasError ? 'voice-input__btn--error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={btnClass}
      onClick={handleToggle}
      disabled={disabled}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      title={isRecording ? 'Stop recording' : 'Voice input'}
      type="button"
    >
      {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  )
}

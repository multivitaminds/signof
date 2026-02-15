import { useCallback, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import './MilestoneCelebration.css'

interface MilestoneCelebrationProps {
  sectionTitle: string
  onContinue: () => void
}

function MilestoneCelebration({ sectionTitle, onContinue }: MilestoneCelebrationProps) {
  const handleContinue = useCallback(() => {
    onContinue()
  }, [onContinue])

  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <div className="milestone-celebration" role="alert">
      <div className="milestone-celebration__content">
        <span className="milestone-celebration__icon">
          <CheckCircle size={64} />
        </span>
        <h2 className="milestone-celebration__title">{sectionTitle} Complete!</h2>
        <button
          type="button"
          className="btn-primary milestone-celebration__btn"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default MilestoneCelebration

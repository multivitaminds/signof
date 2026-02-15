import { useCallback } from 'react'
import {
  FileText,
  Receipt,
  Landmark,
  TrendingUp,
  FileQuestion,
  Home,
  HeartPulse,
  UserCheck,
} from 'lucide-react'
import type { TaxFormType } from '../../types'
import { TAX_FORM_LABELS, TAX_FORM_DESCRIPTIONS } from '../../types'
import './TaxFormCard.css'

interface TaxFormCardProps {
  formType: TaxFormType
  documentCount: number
  onClick: (formType: TaxFormType) => void
}

const FORM_ICONS: Partial<Record<TaxFormType, React.ReactNode>> = {
  w2: <FileText size={24} />,
  '1099_nec': <Receipt size={24} />,
  '1099_int': <Landmark size={24} />,
  '1099_div': <TrendingUp size={24} />,
  '1099_misc': <FileQuestion size={24} />,
  '1098': <Home size={24} />,
  '1095_a': <HeartPulse size={24} />,
  w9: <UserCheck size={24} />,
}

function TaxFormCard({ formType, documentCount, onClick }: TaxFormCardProps) {
  const handleClick = useCallback(() => {
    onClick(formType)
  }, [formType, onClick])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(formType)
      }
    },
    [formType, onClick]
  )

  return (
    <div
      className="tax-form-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${TAX_FORM_LABELS[formType]} - ${documentCount} document${documentCount !== 1 ? 's' : ''}`}
    >
      <div className="tax-form-card__icon">{FORM_ICONS[formType]}</div>
      <div className="tax-form-card__body">
        <div className="tax-form-card__title-row">
          <h3 className="tax-form-card__title">{TAX_FORM_LABELS[formType]}</h3>
          {documentCount > 0 && (
            <span className="tax-form-card__badge">{documentCount}</span>
          )}
        </div>
        <p className="tax-form-card__description">
          {TAX_FORM_DESCRIPTIONS[formType]}
        </p>
      </div>
    </div>
  )
}

export default TaxFormCard

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Lock } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import { PLANS, getPrice } from '../../settings/lib/planData'
import './PaymentPage.css'

export default function PaymentPage() {
  const navigate = useNavigate()
  const setRegistrationStep = useAuthStore((s) => s.setRegistrationStep)
  const currentPlan = useBillingStore((s) => s.currentPlan)
  const billingCycle = useBillingStore((s) => s.billingCycle)
  const setPaymentMethod = useBillingStore((s) => s.setPaymentMethod)

  const planData = PLANS.find((p) => p.id === currentPlan)

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [error, setError] = useState('')

  const formatCardNumber = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    const groups = digits.match(/.{1,4}/g)
    return groups ? groups.join(' ') : digits
  }, [])

  const formatExpiry = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }, [])

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value))
    setError('')
  }, [formatCardNumber])

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value))
    setError('')
  }, [formatExpiry])

  const handleCvcChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
    setCvc(digits)
    setError('')
  }, [])

  const handleCardholderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCardholderName(e.target.value)
    setError('')
  }, [])

  const handleBack = useCallback(() => {
    navigate('/signup/plan')
  }, [navigate])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    const digits = cardNumber.replace(/\s/g, '')

    if (!cardholderName.trim()) {
      setError('Cardholder name is required')
      return
    }
    if (digits.length !== 16) {
      setError('Card number must be 16 digits')
      return
    }
    if (expiry.length !== 5) {
      setError('Expiry must be in MM/YY format')
      return
    }
    if (cvc.length !== 3) {
      setError('CVC must be 3 digits')
      return
    }

    const last4 = digits.slice(-4)

    setPaymentMethod({
      brand: 'Visa',
      last4,
      expiry,
    })
    setRegistrationStep('onboarding')
    navigate('/onboarding')
  }, [cardNumber, expiry, cvc, cardholderName, setPaymentMethod, setRegistrationStep, navigate])

  const priceLabel = planData ? getPrice(planData, billingCycle) : '$0'
  const planName = planData?.name ?? 'Starter'

  return (
    <div className="payment-page">
      <div className="payment-page__card">
        <button
          className="payment-page__back"
          onClick={handleBack}
          type="button"
          aria-label="Back to plan selection"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="payment-page__logo">
          <span className="payment-page__logo-text">OriginA</span>
        </div>
        <h1 className="payment-page__title">Payment Details</h1>
        <p className="payment-page__subtitle">
          Complete your subscription setup
        </p>

        {/* Plan Summary */}
        <div className="payment-page__summary">
          <div className="payment-page__summary-row">
            <span className="payment-page__summary-label">Plan</span>
            <span className="payment-page__summary-value">{planName}</span>
          </div>
          <div className="payment-page__summary-row">
            <span className="payment-page__summary-label">Price</span>
            <span className="payment-page__summary-value">
              {priceLabel}
              {planData && planData.monthlyPrice !== null && planData.monthlyPrice > 0 && '/mo'}
            </span>
          </div>
          <div className="payment-page__summary-row">
            <span className="payment-page__summary-label">Billing</span>
            <span className="payment-page__summary-value">
              {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <form className="payment-page__form" onSubmit={handleSubmit}>
          {error && <div className="payment-page__error">{error}</div>}

          <div className="payment-page__field">
            <label className="payment-page__label" htmlFor="cardholder-name">
              Cardholder Name
            </label>
            <input
              id="cardholder-name"
              className="payment-page__input"
              type="text"
              value={cardholderName}
              onChange={handleCardholderChange}
              placeholder="John Doe"
              autoComplete="cc-name"
            />
          </div>

          <div className="payment-page__field">
            <label className="payment-page__label" htmlFor="card-number">
              Card Number
            </label>
            <div className="payment-page__input-wrapper">
              <CreditCard size={16} className="payment-page__input-icon" />
              <input
                id="card-number"
                className="payment-page__input payment-page__input--with-icon"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                autoComplete="cc-number"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="payment-page__row">
            <div className="payment-page__field">
              <label className="payment-page__label" htmlFor="expiry">
                Expiry Date
              </label>
              <input
                id="expiry"
                className="payment-page__input"
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
              />
            </div>
            <div className="payment-page__field">
              <label className="payment-page__label" htmlFor="cvc">
                CVC
              </label>
              <input
                id="cvc"
                className="payment-page__input"
                type="text"
                value={cvc}
                onChange={handleCvcChange}
                placeholder="123"
                autoComplete="cc-csc"
                inputMode="numeric"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary payment-page__submit">
            <Lock size={14} />
            <span>Start Subscription</span>
          </button>

          <p className="payment-page__secure-note">
            <Lock size={12} />
            <span>Your payment information is encrypted and secure.</span>
          </p>
        </form>
      </div>
    </div>
  )
}

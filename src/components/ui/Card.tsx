import type { ReactNode, HTMLAttributes } from 'react'
import './Card.css'

type CardVariant = 'flat' | 'elevated' | 'interactive' | 'glass'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  children: ReactNode
}

function Card({ variant = 'elevated', className = '', children, ...props }: CardProps) {
  const classes = ['card', `card--${variant}`, className].filter(Boolean).join(' ')
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card__header ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`card__title ${className}`} {...props}>
      {children}
    </h3>
  )
}

interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

function CardBadge({ variant = 'default', className = '', children, ...props }: CardBadgeProps) {
  return (
    <span className={`card__badge card__badge--${variant} ${className}`} {...props}>
      {children}
    </span>
  )
}

function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card__body ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card__footer ${className}`} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Badge = CardBadge
Card.Body = CardBody
Card.Footer = CardFooter

export default Card

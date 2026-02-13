import type { ReactNode } from 'react'
import './ModuleHeader.css'

interface ModuleHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export default function ModuleHeader({ title, subtitle, actions, className = '' }: ModuleHeaderProps) {
  return (
    <div className={`module-header ${className}`}>
      <div className="module-header__text">
        <h1 className="module-header__title">{title}</h1>
        {subtitle && <p className="module-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="module-header__actions">{actions}</div>}
    </div>
  )
}

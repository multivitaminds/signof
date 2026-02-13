import { useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, FolderOpen, Send, ChevronDown, CreditCard } from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { useTaxStore } from '../stores/useTaxStore'
import { TAX_YEARS } from '../types'
import type { TaxYear } from '../types'
import './TaxLayout.css'

function TaxLayout() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const setActiveTaxYear = useTaxStore((s) => s.setActiveTaxYear)

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setActiveTaxYear(e.target.value as TaxYear)
    },
    [setActiveTaxYear]
  )

  return (
    <div className="tax-layout">
      <ModuleHeader title="Tax" subtitle="E-file tax forms and track submissions" />
      <header className="tax-layout__header">
        <div className="tax-layout__header-left">
          <div className="tax-layout__year-select">
            <select
              value={activeTaxYear}
              onChange={handleYearChange}
              aria-label="Select tax year"
              className="tax-layout__year-dropdown"
            >
              {TAX_YEARS.map((year) => (
                <option key={year} value={year}>
                  Tax Year {year}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="tax-layout__year-chevron" />
          </div>
        </div>

        <nav className="tax-layout__tabs" aria-label="Tax module navigation">
          <NavLink
            to="/tax"
            end
            className={({ isActive }) =>
              `tax-layout__tab ${isActive ? 'tax-layout__tab--active' : ''}`
            }
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/tax/documents"
            className={({ isActive }) =>
              `tax-layout__tab ${isActive ? 'tax-layout__tab--active' : ''}`
            }
          >
            <FileText size={16} />
            <span>Documents</span>
          </NavLink>
          <NavLink
            to="/tax/forms"
            className={({ isActive }) =>
              `tax-layout__tab ${isActive ? 'tax-layout__tab--active' : ''}`
            }
          >
            <FolderOpen size={16} />
            <span>Forms</span>
          </NavLink>
          <NavLink
            to="/tax/filing"
            className={({ isActive }) =>
              `tax-layout__tab ${isActive ? 'tax-layout__tab--active' : ''}`
            }
          >
            <Send size={16} />
            <span>E-File</span>
          </NavLink>
          <NavLink
            to="/tax/pricing"
            className={({ isActive }) =>
              `tax-layout__tab ${isActive ? 'tax-layout__tab--active' : ''}`
            }
          >
            <CreditCard size={16} />
            <span>Pricing</span>
          </NavLink>
        </nav>
      </header>

      <main className="tax-layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default TaxLayout

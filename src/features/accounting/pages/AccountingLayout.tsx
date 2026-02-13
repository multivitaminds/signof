import { useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Landmark,
  BarChart3,
  BookOpen,
  Users,
  UserCheck,
  CreditCard,
  ChevronDown,
} from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { useAccountingStore } from '../stores/useAccountingStore'
import { FISCAL_YEARS } from '../types'
import type { FiscalYear } from '../types'
import './AccountingLayout.css'

function AccountingLayout() {
  const activeFiscalYear = useAccountingStore((s) => s.activeFiscalYear)
  const setActiveFiscalYear = useAccountingStore((s) => s.setActiveFiscalYear)

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setActiveFiscalYear(e.target.value as FiscalYear)
    },
    [setActiveFiscalYear]
  )

  return (
    <div className="accounting-layout">
      <ModuleHeader title="Accounting" subtitle="Invoices, expenses, and financial reports" />
      <header className="accounting-layout__header">
        <div className="accounting-layout__header-left">
          <div className="accounting-layout__year-select">
            <select
              value={activeFiscalYear}
              onChange={handleYearChange}
              aria-label="Select fiscal year"
              className="accounting-layout__year-dropdown"
            >
              {FISCAL_YEARS.map((year) => (
                <option key={year} value={year}>
                  FY {year}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="accounting-layout__year-chevron" />
          </div>
        </div>

        <nav className="accounting-layout__tabs" aria-label="Accounting module navigation">
          <NavLink
            to="/accounting/dashboard"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/accounting/invoices"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <Receipt size={16} />
            <span>Invoicing</span>
          </NavLink>
          <NavLink
            to="/accounting/expenses"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <Wallet size={16} />
            <span>Expenses</span>
          </NavLink>
          <NavLink
            to="/accounting/banking"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <Landmark size={16} />
            <span>Banking</span>
          </NavLink>
          <NavLink
            to="/accounting/reports"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <BarChart3 size={16} />
            <span>Reports</span>
          </NavLink>
          <NavLink
            to="/accounting/accounts"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <BookOpen size={16} />
            <span>Accounts</span>
          </NavLink>
          <NavLink
            to="/accounting/contacts"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <Users size={16} />
            <span>Contacts</span>
          </NavLink>
          <NavLink
            to="/accounting/payroll"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <UserCheck size={16} />
            <span>Payroll</span>
          </NavLink>
          <NavLink
            to="/accounting/pricing"
            className={({ isActive }) =>
              `accounting-layout__tab ${isActive ? 'accounting-layout__tab--active' : ''}`
            }
          >
            <CreditCard size={16} />
            <span>Pricing</span>
          </NavLink>
        </nav>
      </header>

      <main className="accounting-layout__content">
        <Outlet />
      </main>
    </div>
  )
}

export default AccountingLayout

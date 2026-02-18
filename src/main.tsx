import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Critical path — direct imports (not lazy-loaded)
import AppLayout from './components/layout/AppLayout'
import ToastProvider from './components/Toast/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import ModuleErrorBoundary from './components/ErrorBoundary/ModuleErrorBoundary'
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './features/auth/pages/LoginPage'
import SignupPage from './features/auth/pages/SignupPage'
import OnboardingPage from './features/auth/pages/OnboardingPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
const InboxPage = lazy(() => import('./features/inbox/pages/InboxPage'))

// Skeleton fallbacks
import TableSkeleton from './components/skeletons/TableSkeleton'
import CardGridSkeleton from './components/skeletons/CardGridSkeleton'
import EditorSkeleton from './components/skeletons/EditorSkeleton'

// Lazy-loaded feature modules
const WorkspaceLayout = lazy(() => import('./features/workspace/pages/WorkspaceLayout'))
const WorkspaceAllPages = lazy(() => import('./features/workspace/pages/WorkspaceAllPages'))
const NewPagePage = lazy(() => import('./features/workspace/pages/NewPagePage'))
const PageEditorPage = lazy(() => import('./features/workspace/pages/PageEditorPage'))
const TrashPage = lazy(() => import('./features/workspace/pages/TrashPage'))

const ProjectsLayout = lazy(() => import('./features/projects/pages/ProjectsLayout'))
const ProjectListPage = lazy(() => import('./features/projects/pages/ProjectListPage'))
const NewProjectPage = lazy(() => import('./features/projects/pages/NewProjectPage'))
const ProjectDetailPage = lazy(() => import('./features/projects/pages/ProjectDetailPage'))

const SchedulingLayout = lazy(() => import('./features/scheduling/pages/SchedulingLayout'))
const EventTypesPage = lazy(() => import('./features/scheduling/pages/EventTypesPage'))
const SchedulingCalendarPage = lazy(() => import('./features/scheduling/pages/SchedulingCalendarPage'))
const BookingsPage = lazy(() => import('./features/scheduling/pages/BookingsPage'))
const CalendarSyncPage = lazy(() => import('./features/scheduling/pages/CalendarSyncPage'))
const BookingAnalyticsPage = lazy(() => import('./features/scheduling/pages/BookingAnalyticsPage'))
const NoShowPage = lazy(() => import('./features/scheduling/pages/NoShowPage/NoShowPage'))
const PublicBookingPage = lazy(() => import('./features/scheduling/pages/PublicBookingPage'))

const DatabasesLayout = lazy(() => import('./features/databases/pages/DatabasesLayout'))
const DatabaseListPage = lazy(() => import('./features/databases/pages/DatabaseListPage'))
const DatabaseDetailPage = lazy(() => import('./features/databases/pages/DatabaseDetailPage'))

const SettingsLayout = lazy(() => import('./features/settings/pages/SettingsLayout'))
const GeneralSettings = lazy(() => import('./features/settings/pages/GeneralSettings'))
const MembersSettings = lazy(() => import('./features/settings/pages/MembersSettings'))
const NotificationsSettings = lazy(() => import('./features/settings/pages/NotificationsSettings'))
const AppearanceSettings = lazy(() => import('./features/settings/pages/AppearanceSettings'))
const IntegrationsSettings = lazy(() => import('./features/settings/pages/IntegrationsSettings'))
const BillingSettings = lazy(() => import('./features/settings/pages/BillingSettings'))
const AISettings = lazy(() => import('./features/settings/pages/AISettings'))

const AILayout = lazy(() => import('./features/ai/pages/AILayout'))
const AIMemoryPage = lazy(() => import('./features/ai/pages/AIMemoryPage'))
const AIAgentsPage = lazy(() => import('./features/ai/pages/AIAgentsPage'))
const WorkflowListPage = lazy(() => import('./features/ai/pages/WorkflowListPage'))
const WorkflowEditorPage = lazy(() => import('./features/ai/pages/WorkflowEditorPage'))
const AgentOpsPage = lazy(() => import('./features/ai/pages/AgentOpsPage'))
const ConnectorHubPage = lazy(() => import('./features/ai/pages/ConnectorHubPage'))
const AgentDetailPage = lazy(() => import('./features/ai/pages/AgentDetailPage/AgentDetailPage'))

const PlanSelectionPage = lazy(() => import('./features/auth/pages/PlanSelectionPage'))
const PaymentPage = lazy(() => import('./features/auth/pages/PaymentPage'))

const TaxLayout = lazy(() => import('./features/tax/pages/TaxLayout'))
const TaxDashboard = lazy(() => import('./features/tax/pages/TaxDashboard'))
const TaxDocumentsPage = lazy(() => import('./features/tax/pages/TaxDocumentsPage'))
const TaxFormsPage = lazy(() => import('./features/tax/pages/TaxFormsPage'))
const TaxFilingPage = lazy(() => import('./features/tax/pages/TaxFilingPage'))
const TaxPricingPage = lazy(() => import('./features/tax/pages/TaxPricingPage'))
const TaxInterviewPage = lazy(() => import('./features/tax/pages/TaxInterviewPage'))
const TaxSubmissionsPage = lazy(() => import('./features/tax/pages/TaxSubmissionsPage'))

const AccountingLayout = lazy(() => import('./features/accounting/pages/AccountingLayout'))
const AccountingDashboard = lazy(() => import('./features/accounting/pages/AccountingDashboard'))
const InvoiceListPage = lazy(() => import('./features/accounting/pages/InvoiceListPage'))
const ExpenseListPage = lazy(() => import('./features/accounting/pages/ExpenseListPage'))
const BankingPage = lazy(() => import('./features/accounting/pages/BankingPage'))
const ReportsPage = lazy(() => import('./features/accounting/pages/ReportsPage'))
const ChartOfAccountsPage = lazy(() => import('./features/accounting/pages/ChartOfAccountsPage'))
const ContactsPage = lazy(() => import('./features/accounting/pages/ContactsPage'))
const PayrollPage = lazy(() => import('./features/accounting/pages/PayrollPage'))
const AccountingPricingPage = lazy(() => import('./features/accounting/pages/AccountingPricingPage'))

const DocumentAnalyticsPage = lazy(() => import('./features/documents/components/DocumentAnalytics/DocumentAnalytics'))
const DocumentBuilderPage = lazy(() => import('./features/documents/pages/DocumentBuilderPage'))

const ActivityPage = lazy(() => import('./features/activity/pages/ActivityPage'))

const PlaygroundLayout = lazy(() => import('./features/playground/pages/PlaygroundLayout'))

const BrainTreeLayout = lazy(() => import('./features/clawgpt/pages/BrainTreeLayout'))
const BrainDashboardPage = lazy(() => import('./features/clawgpt/pages/BrainDashboardPage'))
const ChannelsPage = lazy(() => import('./features/clawgpt/pages/ChannelsPage'))
const UnifiedInboxPage = lazy(() => import('./features/clawgpt/pages/UnifiedInboxPage'))
const SkillsPage = lazy(() => import('./features/clawgpt/pages/SkillsPage'))
const SoulPage = lazy(() => import('./features/clawgpt/pages/SoulPage'))
const DevicesPage = lazy(() => import('./features/clawgpt/pages/DevicesPage'))
const FleetPage = lazy(() => import('./features/clawgpt/pages/FleetPage'))
const RegistryPage = lazy(() => import('./features/clawgpt/pages/RegistryPage'))

const AnalyticsDashboardPage = lazy(() => import('./features/analytics/pages/AnalyticsDashboardPage'))

const DeveloperLayout = lazy(() => import('./features/developer/pages/DeveloperLayout'))
const ApiDocsPage = lazy(() => import('./features/developer/pages/ApiDocsPage'))
const CliDocsPage = lazy(() => import('./features/developer/pages/CliDocsPage'))
const WebhooksPage = lazy(() => import('./features/developer/pages/WebhooksPage'))
const SdkPage = lazy(() => import('./features/developer/pages/SdkPage'))
const SandboxPage = lazy(() => import('./features/developer/pages/SandboxPage'))
const ApiKeysPage = lazy(() => import('./features/developer/pages/ApiKeysPage'))

import { initCrossModuleListeners } from './lib/crossModuleListeners'
import { useAuthStore } from './features/auth/stores/useAuthStore'
import { api } from './lib/api'

import './index.css'

// Wire up cross-module event listeners (document signed → activity feed, etc.)
initCrossModuleListeners()

// Restore access token from persisted store on app load
const storedAccessToken = useAuthStore.getState().accessToken
if (storedAccessToken) {
  api.setToken(storedAccessToken)
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>')
}

// Module-specific skeleton fallbacks
const EditorFallback = <EditorSkeleton />
const TableFallback = <TableSkeleton />
const CardFallback = <CardGridSkeleton />

// Register service worker for offline/PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed — app works fine without it
    })
  })
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Auth routes (outside main layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/plan" element={<Suspense fallback={CardFallback}><PlanSelectionPage /></Suspense>} />
        <Route path="/signup/payment" element={<Suspense fallback={CardFallback}><PaymentPage /></Suspense>} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Public booking page (outside main layout, standalone) */}
        <Route path="/book/:slug" element={
          <ModuleErrorBoundary moduleName="Scheduling">
            <Suspense fallback={CardFallback}><PublicBookingPage /></Suspense>
          </ModuleErrorBoundary>
        } />

        {/* Main app */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />

          {/* Workspace (Notion) */}
          <Route path="pages" element={
            <ModuleErrorBoundary moduleName="Workspace">
              <Suspense fallback={EditorFallback}><WorkspaceLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Suspense fallback={CardFallback}><WorkspaceAllPages /></Suspense>} />
            <Route path="new" element={<Suspense fallback={EditorFallback}><NewPagePage /></Suspense>} />
            <Route path="trash" element={<Suspense fallback={TableFallback}><TrashPage /></Suspense>} />
            <Route path=":pageId" element={<Suspense fallback={EditorFallback}><PageEditorPage /></Suspense>} />
          </Route>

          {/* Projects (Linear) */}
          <Route path="projects" element={
            <ModuleErrorBoundary moduleName="Projects">
              <Suspense fallback={CardFallback}><ProjectsLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Suspense fallback={CardFallback}><ProjectListPage /></Suspense>} />
            <Route path="new" element={<Suspense fallback={EditorFallback}><NewProjectPage /></Suspense>} />
            <Route path=":projectId" element={<Suspense fallback={CardFallback}><ProjectDetailPage /></Suspense>} />
          </Route>

          {/* Documents (DocuSign / PandaDoc) */}
          <Route path="documents/builder" element={
            <ModuleErrorBoundary moduleName="Documents">
              <Suspense fallback={EditorFallback}><DocumentBuilderPage /></Suspense>
            </ModuleErrorBoundary>
          } />
          <Route path="documents/analytics" element={
            <ModuleErrorBoundary moduleName="Documents">
              <Suspense fallback={TableFallback}><DocumentAnalyticsPage /></Suspense>
            </ModuleErrorBoundary>
          } />
          <Route path="documents/*" element={
            <ModuleErrorBoundary moduleName="Documents">
              <DocumentsPage />
            </ModuleErrorBoundary>
          } />

          {/* Scheduling (Calendly) */}
          <Route path="calendar" element={
            <ModuleErrorBoundary moduleName="Scheduling">
              <Suspense fallback={CardFallback}><SchedulingLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/calendar/events" replace />} />
            <Route path="events" element={<Suspense fallback={CardFallback}><EventTypesPage /></Suspense>} />
            <Route path="schedule" element={<Suspense fallback={TableFallback}><SchedulingCalendarPage /></Suspense>} />
            <Route path="bookings" element={<Suspense fallback={TableFallback}><BookingsPage /></Suspense>} />
            <Route path="sync" element={<Suspense fallback={CardFallback}><CalendarSyncPage /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={CardFallback}><BookingAnalyticsPage /></Suspense>} />
            <Route path="no-shows" element={<Suspense fallback={TableFallback}><NoShowPage /></Suspense>} />
          </Route>

          {/* Databases (Airtable) */}
          <Route path="data" element={
            <ModuleErrorBoundary moduleName="Databases">
              <Suspense fallback={TableFallback}><DatabasesLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Suspense fallback={CardFallback}><DatabaseListPage /></Suspense>} />
            <Route path=":databaseId" element={<Suspense fallback={TableFallback}><DatabaseDetailPage /></Suspense>} />
          </Route>

          {/* Inbox */}
          <Route path="inbox" element={
            <ModuleErrorBoundary moduleName="Inbox">
              <Suspense fallback={TableFallback}><InboxPage /></Suspense>
            </ModuleErrorBoundary>
          } />

          {/* Activity */}
          <Route path="activity" element={
            <ModuleErrorBoundary moduleName="Activity">
              <Suspense fallback={TableFallback}><ActivityPage /></Suspense>
            </ModuleErrorBoundary>
          } />

          {/* Copilot */}
          <Route path="copilot" element={
            <ModuleErrorBoundary moduleName="Copilot">
              <Suspense fallback={CardFallback}><AILayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/copilot/memory" replace />} />
            <Route path="memory" element={<Suspense fallback={TableFallback}><AIMemoryPage /></Suspense>} />
            <Route path="agents" element={<Suspense fallback={CardFallback}><AIAgentsPage /></Suspense>} />
            <Route path="agents/:agentId" element={<Suspense fallback={CardFallback}><AgentDetailPage /></Suspense>} />
            <Route path="workflows" element={<Suspense fallback={CardFallback}><WorkflowListPage /></Suspense>} />
            <Route path="workflows/:workflowId" element={<Suspense fallback={CardFallback}><WorkflowEditorPage /></Suspense>} />
            <Route path="operations" element={<Suspense fallback={CardFallback}><AgentOpsPage /></Suspense>} />
            <Route path="connectors" element={<Suspense fallback={CardFallback}><ConnectorHubPage /></Suspense>} />
          </Route>

          {/* Command Center */}
          <Route path="brain" element={
            <ModuleErrorBoundary moduleName="Command Center">
              <Suspense fallback={CardFallback}><BrainTreeLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/brain/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={CardFallback}><BrainDashboardPage /></Suspense>} />
            <Route path="channels" element={<Suspense fallback={CardFallback}><ChannelsPage /></Suspense>} />
            <Route path="inbox" element={<Suspense fallback={TableFallback}><UnifiedInboxPage /></Suspense>} />
            <Route path="inbox/:sessionId" element={<Suspense fallback={TableFallback}><UnifiedInboxPage /></Suspense>} />
            <Route path="skills" element={<Suspense fallback={CardFallback}><SkillsPage /></Suspense>} />
            <Route path="soul" element={<Suspense fallback={EditorFallback}><SoulPage /></Suspense>} />
            <Route path="devices" element={<Suspense fallback={CardFallback}><DevicesPage /></Suspense>} />
            <Route path="fleet" element={<Suspense fallback={CardFallback}><FleetPage /></Suspense>} />
            <Route path="registry" element={<Suspense fallback={CardFallback}><RegistryPage /></Suspense>} />
          </Route>

          {/* Tax E-Filing */}
          <Route path="tax" element={
            <ModuleErrorBoundary moduleName="Tax">
              <Suspense fallback={TableFallback}><TaxLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/tax/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={CardFallback}><TaxDashboard /></Suspense>} />
            <Route path="documents" element={<Suspense fallback={TableFallback}><TaxDocumentsPage /></Suspense>} />
            <Route path="forms" element={<Suspense fallback={TableFallback}><TaxFormsPage /></Suspense>} />
            <Route path="filing" element={<Suspense fallback={TableFallback}><TaxFilingPage /></Suspense>} />
            <Route path="interview" element={<Suspense fallback={CardFallback}><TaxInterviewPage /></Suspense>} />
            <Route path="submissions" element={<Suspense fallback={TableFallback}><TaxSubmissionsPage /></Suspense>} />
            <Route path="pricing" element={<Suspense fallback={CardFallback}><TaxPricingPage /></Suspense>} />
          </Route>

          {/* Accounting (QuickBooks) */}
          <Route path="accounting" element={
            <ModuleErrorBoundary moduleName="Accounting">
              <Suspense fallback={TableFallback}><AccountingLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/accounting/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={CardFallback}><AccountingDashboard /></Suspense>} />
            <Route path="invoices" element={<Suspense fallback={TableFallback}><InvoiceListPage /></Suspense>} />
            <Route path="expenses" element={<Suspense fallback={TableFallback}><ExpenseListPage /></Suspense>} />
            <Route path="banking" element={<Suspense fallback={TableFallback}><BankingPage /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={TableFallback}><ReportsPage /></Suspense>} />
            <Route path="accounts" element={<Suspense fallback={TableFallback}><ChartOfAccountsPage /></Suspense>} />
            <Route path="contacts" element={<Suspense fallback={CardFallback}><ContactsPage /></Suspense>} />
            <Route path="payroll" element={<Suspense fallback={TableFallback}><PayrollPage /></Suspense>} />
            <Route path="pricing" element={<Suspense fallback={CardFallback}><AccountingPricingPage /></Suspense>} />
          </Route>

          {/* Analytics */}
          <Route path="analytics" element={
            <ModuleErrorBoundary moduleName="Analytics">
              <Suspense fallback={CardFallback}><AnalyticsDashboardPage /></Suspense>
            </ModuleErrorBoundary>
          } />

          {/* Playground (OpenClaw) */}
          <Route path="playground" element={
            <ModuleErrorBoundary moduleName="Playground">
              <Suspense fallback={EditorFallback}><PlaygroundLayout /></Suspense>
            </ModuleErrorBoundary>
          } />

          {/* Developer Platform */}
          <Route path="developer" element={
            <ModuleErrorBoundary moduleName="Developer">
              <Suspense fallback={EditorFallback}><DeveloperLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/developer/api" replace />} />
            <Route path="api" element={<Suspense fallback={EditorFallback}><ApiDocsPage /></Suspense>} />
            <Route path="cli" element={<Suspense fallback={EditorFallback}><CliDocsPage /></Suspense>} />
            <Route path="webhooks" element={<Suspense fallback={TableFallback}><WebhooksPage /></Suspense>} />
            <Route path="sdks" element={<Suspense fallback={CardFallback}><SdkPage /></Suspense>} />
            <Route path="sandbox" element={<Suspense fallback={EditorFallback}><SandboxPage /></Suspense>} />
            <Route path="keys" element={<Suspense fallback={TableFallback}><ApiKeysPage /></Suspense>} />
          </Route>

          {/* Settings */}
          <Route path="settings" element={
            <ModuleErrorBoundary moduleName="Settings">
              <Suspense fallback={EditorFallback}><SettingsLayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/settings/general" replace />} />
            <Route path="general" element={<Suspense fallback={EditorFallback}><GeneralSettings /></Suspense>} />
            <Route path="members" element={<Suspense fallback={TableFallback}><MembersSettings /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={EditorFallback}><NotificationsSettings /></Suspense>} />
            <Route path="appearance" element={<Suspense fallback={EditorFallback}><AppearanceSettings /></Suspense>} />
            <Route path="integrations" element={<Suspense fallback={CardFallback}><IntegrationsSettings /></Suspense>} />
            <Route path="billing" element={<Suspense fallback={EditorFallback}><BillingSettings /></Suspense>} />
            <Route path="ai" element={<Suspense fallback={CardFallback}><AISettings /></Suspense>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)

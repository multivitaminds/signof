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
import InboxPage from './features/inbox/pages/InboxPage'

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

const AILayout = lazy(() => import('./features/ai/pages/AILayout'))
const AIMemoryPage = lazy(() => import('./features/ai/pages/AIMemoryPage'))
const AIAgentsPage = lazy(() => import('./features/ai/pages/AIAgentsPage'))

const TaxLayout = lazy(() => import('./features/tax/pages/TaxLayout'))
const TaxDashboard = lazy(() => import('./features/tax/pages/TaxDashboard'))
const TaxDocumentsPage = lazy(() => import('./features/tax/pages/TaxDocumentsPage'))
const TaxFormsPage = lazy(() => import('./features/tax/pages/TaxFormsPage'))
const TaxFilingPage = lazy(() => import('./features/tax/pages/TaxFilingPage'))

const DocumentAnalyticsPage = lazy(() => import('./features/documents/components/DocumentAnalytics/DocumentAnalytics'))

const DeveloperLayout = lazy(() => import('./features/developer/pages/DeveloperLayout'))
const ApiDocsPage = lazy(() => import('./features/developer/pages/ApiDocsPage'))
const CliDocsPage = lazy(() => import('./features/developer/pages/CliDocsPage'))
const WebhooksPage = lazy(() => import('./features/developer/pages/WebhooksPage'))
const SdkPage = lazy(() => import('./features/developer/pages/SdkPage'))
const SandboxPage = lazy(() => import('./features/developer/pages/SandboxPage'))
const ApiKeysPage = lazy(() => import('./features/developer/pages/ApiKeysPage'))

import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>')
}

// Module-specific skeleton fallbacks
const EditorFallback = <EditorSkeleton />
const TableFallback = <TableSkeleton />
const CardFallback = <CardGridSkeleton />

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Auth routes (outside main layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Public booking page (outside main layout, standalone) */}
        <Route path="/book/:slug" element={
          <ModuleErrorBoundary moduleName="Scheduling">
            <Suspense fallback={CardFallback}><PublicBookingPage /></Suspense>
          </ModuleErrorBoundary>
        } />

        {/* Main app */}
        <Route path="/" element={<AppLayout />}>
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
              <InboxPage />
            </ModuleErrorBoundary>
          } />

          {/* AI */}
          <Route path="ai" element={
            <ModuleErrorBoundary moduleName="AI">
              <Suspense fallback={CardFallback}><AILayout /></Suspense>
            </ModuleErrorBoundary>
          }>
            <Route index element={<Navigate to="/ai/memory" replace />} />
            <Route path="memory" element={<Suspense fallback={TableFallback}><AIMemoryPage /></Suspense>} />
            <Route path="agents" element={<Suspense fallback={CardFallback}><AIAgentsPage /></Suspense>} />
          </Route>

          {/* Tax E-Filing (TaxBandit) */}
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
          </Route>

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
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)

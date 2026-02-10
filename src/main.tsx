import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Critical path — direct imports (not lazy-loaded)
import AppLayout from './components/layout/AppLayout'
import LoadingSpinner from './components/layout/LoadingSpinner/LoadingSpinner'
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './features/auth/pages/LoginPage'
import SignupPage from './features/auth/pages/SignupPage'
import OnboardingPage from './features/auth/pages/OnboardingPage'
import InboxPage from './features/inbox/pages/InboxPage'

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

const LazyFallback = <LoadingSpinner />

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Auth routes (outside main layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Main app */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />

          {/* Workspace (Notion) */}
          <Route path="pages" element={<Suspense fallback={LazyFallback}><WorkspaceLayout /></Suspense>}>
            <Route index element={<Suspense fallback={LazyFallback}><WorkspaceAllPages /></Suspense>} />
            <Route path="new" element={<Suspense fallback={LazyFallback}><NewPagePage /></Suspense>} />
            <Route path="trash" element={<Suspense fallback={LazyFallback}><TrashPage /></Suspense>} />
            <Route path=":pageId" element={<Suspense fallback={LazyFallback}><PageEditorPage /></Suspense>} />
          </Route>

          {/* Projects (Linear) */}
          <Route path="projects" element={<Suspense fallback={LazyFallback}><ProjectsLayout /></Suspense>}>
            <Route index element={<Suspense fallback={LazyFallback}><ProjectListPage /></Suspense>} />
            <Route path="new" element={<Suspense fallback={LazyFallback}><NewProjectPage /></Suspense>} />
            <Route path=":projectId" element={<Suspense fallback={LazyFallback}><ProjectDetailPage /></Suspense>} />
          </Route>

          {/* Documents (DocuSign / PandaDoc) */}
          <Route path="documents/*" element={<DocumentsPage />} />

          {/* Scheduling (Calendly) */}
          <Route path="calendar" element={<Suspense fallback={LazyFallback}><SchedulingLayout /></Suspense>}>
            <Route index element={<Navigate to="/calendar/events" replace />} />
            <Route path="events" element={<Suspense fallback={LazyFallback}><EventTypesPage /></Suspense>} />
            <Route path="schedule" element={<Suspense fallback={LazyFallback}><SchedulingCalendarPage /></Suspense>} />
            <Route path="bookings" element={<Suspense fallback={LazyFallback}><BookingsPage /></Suspense>} />
          </Route>

          {/* Databases (Airtable) */}
          <Route path="data" element={<Suspense fallback={LazyFallback}><DatabasesLayout /></Suspense>}>
            <Route index element={<Suspense fallback={LazyFallback}><DatabaseListPage /></Suspense>} />
            <Route path=":databaseId" element={<Suspense fallback={LazyFallback}><DatabaseDetailPage /></Suspense>} />
          </Route>

          {/* Inbox */}
          <Route path="inbox" element={<InboxPage />} />

          {/* AI */}
          <Route path="ai" element={<Suspense fallback={LazyFallback}><AILayout /></Suspense>}>
            <Route index element={<Navigate to="/ai/memory" replace />} />
            <Route path="memory" element={<Suspense fallback={LazyFallback}><AIMemoryPage /></Suspense>} />
            <Route path="agents" element={<Suspense fallback={LazyFallback}><AIAgentsPage /></Suspense>} />
          </Route>

          {/* Tax E-Filing (TaxBandit) */}
          <Route path="tax" element={<Suspense fallback={LazyFallback}><TaxLayout /></Suspense>}>
            <Route index element={<Navigate to="/tax/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={LazyFallback}><TaxDashboard /></Suspense>} />
            <Route path="documents" element={<Suspense fallback={LazyFallback}><TaxDocumentsPage /></Suspense>} />
            <Route path="forms" element={<Suspense fallback={LazyFallback}><TaxFormsPage /></Suspense>} />
            <Route path="filing" element={<Suspense fallback={LazyFallback}><TaxFilingPage /></Suspense>} />
          </Route>

          {/* Developer Platform */}
          <Route path="developer" element={<Suspense fallback={LazyFallback}><DeveloperLayout /></Suspense>}>
            <Route index element={<Navigate to="/developer/api" replace />} />
            <Route path="api" element={<Suspense fallback={LazyFallback}><ApiDocsPage /></Suspense>} />
            <Route path="cli" element={<Suspense fallback={LazyFallback}><CliDocsPage /></Suspense>} />
            <Route path="webhooks" element={<Suspense fallback={LazyFallback}><WebhooksPage /></Suspense>} />
            <Route path="sdks" element={<Suspense fallback={LazyFallback}><SdkPage /></Suspense>} />
            <Route path="sandbox" element={<Suspense fallback={LazyFallback}><SandboxPage /></Suspense>} />
            <Route path="keys" element={<Suspense fallback={LazyFallback}><ApiKeysPage /></Suspense>} />
          </Route>

          {/* Settings */}
          <Route path="settings" element={<Suspense fallback={LazyFallback}><SettingsLayout /></Suspense>}>
            <Route index element={<Navigate to="/settings/general" replace />} />
            <Route path="general" element={<Suspense fallback={LazyFallback}><GeneralSettings /></Suspense>} />
            <Route path="members" element={<Suspense fallback={LazyFallback}><MembersSettings /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={LazyFallback}><NotificationsSettings /></Suspense>} />
            <Route path="appearance" element={<Suspense fallback={LazyFallback}><AppearanceSettings /></Suspense>} />
            <Route path="integrations" element={<Suspense fallback={LazyFallback}><IntegrationsSettings /></Suspense>} />
            <Route path="billing" element={<Suspense fallback={LazyFallback}><BillingSettings /></Suspense>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

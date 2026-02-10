import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import NotFoundPage from './pages/NotFoundPage'
import {
  CalendarPage,
  DatabasesPage,
  InboxPage,
  SettingsPage,
} from './pages/PlaceholderPages'
import ProjectsLayout from './features/projects/pages/ProjectsLayout'
import ProjectListPage from './features/projects/pages/ProjectListPage'
import NewProjectPage from './features/projects/pages/NewProjectPage'
import ProjectDetailPage from './features/projects/pages/ProjectDetailPage'
import WorkspaceLayout from './features/workspace/pages/WorkspaceLayout'
import WorkspaceAllPages from './features/workspace/pages/WorkspaceAllPages'
import NewPagePage from './features/workspace/pages/NewPagePage'
import PageEditorPage from './features/workspace/pages/PageEditorPage'
import AILayout from './features/ai/pages/AILayout'
import AIMemoryPage from './features/ai/pages/AIMemoryPage'
import AIAgentsPage from './features/ai/pages/AIAgentsPage'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>')
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="pages" element={<WorkspaceLayout />}>
            <Route index element={<WorkspaceAllPages />} />
            <Route path="new" element={<NewPagePage />} />
            <Route path=":pageId" element={<PageEditorPage />} />
          </Route>
          <Route path="projects" element={<ProjectsLayout />}>
            <Route index element={<ProjectListPage />} />
            <Route path="new" element={<NewProjectPage />} />
            <Route path=":projectId" element={<ProjectDetailPage />} />
          </Route>
          <Route path="documents/*" element={<DocumentsPage />} />
          <Route path="calendar/*" element={<CalendarPage />} />
          <Route path="data/*" element={<DatabasesPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="ai" element={<AILayout />}>
            <Route index element={<Navigate to="/ai/memory" replace />} />
            <Route path="memory" element={<AIMemoryPage />} />
            <Route path="agents" element={<AIAgentsPage />} />
          </Route>
          <Route path="settings/*" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

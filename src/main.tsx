import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import DocumentsPage from './pages/DocumentsPage'
import NotFoundPage from './pages/NotFoundPage'
import {
  PagesPage,
  ProjectsPage,
  CalendarPage,
  DatabasesPage,
  InboxPage,
  SettingsPage,
} from './pages/PlaceholderPages'
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
          <Route path="pages/*" element={<PagesPage />} />
          <Route path="projects/*" element={<ProjectsPage />} />
          <Route path="documents/*" element={<DocumentsPage />} />
          <Route path="calendar/*" element={<CalendarPage />} />
          <Route path="data/*" element={<DatabasesPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="settings/*" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

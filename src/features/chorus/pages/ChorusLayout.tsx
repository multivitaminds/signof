import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import ChorusSidebar from '../components/ChorusSidebar/ChorusSidebar'
import ThreadPanel from '../components/ThreadPanel/ThreadPanel'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { MOCK_CHANNELS, MOCK_DMS, MOCK_USERS, MOCK_MESSAGES } from '../data/mockData'
import './ChorusLayout.css'

export default function ChorusLayout() {
  const navigate = useNavigate()
  const { channelId, dmId } = useParams()
  const threadPanelOpen = useChorusStore((s) => s.threadPanelOpen)
  const initializeData = useChorusStore((s) => s.initializeData)
  const loadMessages = useChorusMessageStore((s) => s.loadMessages)
  const channels = useChorusStore((s) => s.channels)

  // Initialize mock data on first mount
  useEffect(() => {
    if (channels.length === 0) {
      initializeData(MOCK_CHANNELS, MOCK_DMS, MOCK_USERS)
      for (const [convId, msgs] of Object.entries(MOCK_MESSAGES)) {
        loadMessages(convId, msgs)
      }
    }
  }, [channels.length, initializeData, loadMessages])

  // Redirect to #general if no channel selected
  useEffect(() => {
    if (!channelId && !dmId) {
      navigate('/chorus/channels/general', { replace: true })
    }
  }, [channelId, dmId, navigate])

  return (
    <div className={`chorus-layout${threadPanelOpen ? ' chorus-layout--thread-open' : ''}`}>
      <ChorusSidebar />
      <div className="chorus-layout__main">
        <Outlet />
      </div>
      {threadPanelOpen && (
        <div className="chorus-layout__thread">
          <ThreadPanel />
        </div>
      )}
    </div>
  )
}

import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useChorusStore } from '../stores/useChorusStore'
import { ChorusChannelType } from '../types'
import ChannelCard from '../components/ChannelCard/ChannelCard'
import './ChannelBrowserPage.css'

export default function ChannelBrowserPage() {
  const navigate = useNavigate()
  const [filterText, setFilterText] = useState('')

  const channels = useChorusStore((s) => s.channels)
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const joinChannel = useChorusStore((s) => s.joinChannel)

  const browsableChannels = useMemo(
    () => channels.filter((ch) => ch.type !== ChorusChannelType.Archived),
    [channels]
  )

  const filteredChannels = useMemo(() => {
    if (!filterText) return browsableChannels
    const lower = filterText.toLowerCase()
    return browsableChannels.filter(
      (ch) =>
        ch.name.toLowerCase().includes(lower) ||
        ch.displayName.toLowerCase().includes(lower) ||
        ch.description.toLowerCase().includes(lower)
    )
  }, [browsableChannels, filterText])

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value)
  }, [])

  const handleJoin = useCallback((channelId: string) => {
    joinChannel(channelId, currentUserId)
  }, [joinChannel, currentUserId])

  const handleOpen = useCallback((channelId: string) => {
    const channel = channels.find((ch) => ch.id === channelId)
    if (channel) {
      navigate(`/chorus/channels/${channel.name}`)
    }
  }, [channels, navigate])

  return (
    <div className="chorus-channel-browser">
      <div className="chorus-channel-browser__header">
        <h2 className="chorus-channel-browser__title">Browse Channels</h2>
        <p className="chorus-channel-browser__subtitle">
          {browsableChannels.length} {browsableChannels.length === 1 ? 'channel' : 'channels'} available
        </p>
      </div>

      <div className="chorus-channel-browser__filter">
        <Search size={16} className="chorus-channel-browser__filter-icon" aria-hidden="true" />
        <input
          type="text"
          className="chorus-channel-browser__filter-input"
          placeholder="Search channels..."
          value={filterText}
          onChange={handleFilterChange}
          aria-label="Filter channels"
        />
      </div>

      <div className="chorus-channel-browser__content">
        {filteredChannels.length === 0 ? (
          <div className="chorus-channel-browser__empty">
            <p>No channels match your filter</p>
          </div>
        ) : (
          <div className="chorus-channel-browser__grid">
            {filteredChannels.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                isMember={ch.memberIds.includes(currentUserId)}
                onJoin={handleJoin}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

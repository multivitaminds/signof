import { useState, useCallback, useMemo } from 'react'
import { useChannelStore } from '../stores/useChannelStore'
import { CHANNEL_DEFINITIONS } from '../lib/channelDefinitions'
import ChannelCard from '../components/ChannelCard/ChannelCard'
import ChannelConfigModal from '../components/ChannelConfigModal/ChannelConfigModal'
import type { ChannelConfig } from '../types'
import './ChannelsPage.css'

type ChannelFilter = 'all' | 'connected' | 'disconnected'

export default function ChannelsPage() {
  const { channels, connectChannel, disconnectChannel, updateChannelConfig, addCustomChannel } = useChannelStore()
  const [filter, setFilter] = useState<ChannelFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)

  const filteredChannels = useMemo(() => {
    let result = channels

    if (filter === 'connected') {
      result = result.filter((ch) => ch.status === 'connected')
    } else if (filter === 'disconnected') {
      result = result.filter((ch) => ch.status === 'disconnected')
    }

    if (search.trim()) {
      const lower = search.toLowerCase()
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(lower) ||
          ch.description.toLowerCase().includes(lower)
      )
    }

    return result
  }, [channels, filter, search])

  const selectedChannel = useMemo(
    () => channels.find((ch) => ch.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  )

  const selectedConfigFields = useMemo(() => {
    if (!selectedChannel) return []
    const def = CHANNEL_DEFINITIONS.find((d) => d.type === selectedChannel.type)
    return def?.configFields ?? []
  }, [selectedChannel])

  const handleConfigure = useCallback((channelId: string) => {
    setSelectedChannelId(channelId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedChannelId(null)
  }, [])

  const handleSaveConfig = useCallback(
    (config: ChannelConfig) => {
      if (selectedChannelId) {
        updateChannelConfig(selectedChannelId, config)
      }
      setSelectedChannelId(null)
    },
    [selectedChannelId, updateChannelConfig]
  )

  const handleAddCustomChannel = useCallback(() => {
    addCustomChannel('New Custom Channel', {
      authType: 'webhook',
    })
  }, [addCustomChannel])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  return (
    <div className="channels-page">
      <div className="channels-page__toolbar">
        <div className="channels-page__filters" role="group" aria-label="Channel filters">
          <button
            className={`channels-page__filter${filter === 'all' ? ' channels-page__filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`channels-page__filter${filter === 'connected' ? ' channels-page__filter--active' : ''}`}
            onClick={() => setFilter('connected')}
          >
            Connected
          </button>
          <button
            className={`channels-page__filter${filter === 'disconnected' ? ' channels-page__filter--active' : ''}`}
            onClick={() => setFilter('disconnected')}
          >
            Disconnected
          </button>
        </div>

        <input
          type="text"
          className="channels-page__search"
          placeholder="Search channels..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search channels"
        />
      </div>

      <div className="channels-page__grid">
        {filteredChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onConnect={connectChannel}
            onDisconnect={disconnectChannel}
            onConfigure={handleConfigure}
          />
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <p className="channels-page__empty">No channels match your filters.</p>
      )}

      <button
        className="btn--secondary channels-page__add-btn"
        onClick={handleAddCustomChannel}
      >
        Add Custom Channel
      </button>

      {selectedChannel && (
        <ChannelConfigModal
          channel={selectedChannel}
          configFields={selectedConfigFields}
          onSave={handleSaveConfig}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  )
}

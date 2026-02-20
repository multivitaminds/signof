import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Hash, Search } from 'lucide-react'
import SearchBar from '../components/SearchBar/SearchBar'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { parseSearchQuery, searchMessages } from '../lib/chorusSearch'
import type { ChorusSearchResult } from '../types'
import './SearchResultsPage.css'

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerText.indexOf(lowerQuery)
  if (idx < 0) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark className="chorus-search-results__highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function groupByChannel(results: ChorusSearchResult[]): Map<string, ChorusSearchResult[]> {
  const groups = new Map<string, ChorusSearchResult[]>()
  for (const result of results) {
    const key = result.channelName
    const existing = groups.get(key)
    if (existing) {
      existing.push(result)
    } else {
      groups.set(key, [result])
    }
  }
  return groups
}

export default function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [currentQuery, setCurrentQuery] = useState(initialQuery)

  const channels = useChorusStore((s) => s.channels)
  const messagesMap = useChorusMessageStore((s) => s.messages)

  const channelNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const ch of channels) {
      map[ch.id] = ch.displayName
    }
    return map
  }, [channels])

  const results = useMemo(() => {
    if (!currentQuery) return []
    const { query, filter } = parseSearchQuery(currentQuery)
    return searchMessages(messagesMap, query, filter, channelNames)
  }, [currentQuery, messagesMap, channelNames])

  const groupedResults = useMemo(() => groupByChannel(results), [results])

  const freeTextQuery = useMemo(() => {
    if (!currentQuery) return ''
    return parseSearchQuery(currentQuery).query
  }, [currentQuery])

  const handleSearch = useCallback((query: string) => {
    setCurrentQuery(query)
    if (query) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }, [setSearchParams])

  const handleResultClick = useCallback((conversationId: string) => {
    const channel = channels.find((ch) => ch.id === conversationId)
    if (channel) {
      navigate(`/chorus/channels/${channel.name}`)
    }
  }, [channels, navigate])

  return (
    <div className="chorus-search-results">
      <div className="chorus-search-results__header">
        <SearchBar onSearch={handleSearch} initialQuery={initialQuery} />
      </div>

      <div className="chorus-search-results__body">
        {!currentQuery ? (
          <div className="chorus-search-results__empty">
            <Search size={40} />
            <p>Search messages across all channels</p>
            <span>Use from:, in:, and has: to filter results</span>
          </div>
        ) : results.length === 0 ? (
          <div className="chorus-search-results__empty">
            <Search size={40} />
            <p>No results found</p>
            <span>Try a different search term or filter</span>
          </div>
        ) : (
          <>
            <div className="chorus-search-results__count">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
            {Array.from(groupedResults.entries()).map(([channelName, channelResults]) => (
              <div key={channelName} className="chorus-search-results__group">
                <div className="chorus-search-results__group-header">
                  <Hash size={14} />
                  <span>{channelName}</span>
                </div>
                <ul className="chorus-search-results__list" role="list">
                  {channelResults.map((result) => (
                    <li key={result.message.id} role="listitem">
                      <button
                        className="chorus-search-results__item"
                        onClick={() => handleResultClick(result.message.conversationId)}
                      >
                        <div className="chorus-search-results__item-meta">
                          <span className="chorus-search-results__sender">
                            {result.message.senderName}
                          </span>
                          <time
                            className="chorus-search-results__time"
                            dateTime={result.message.timestamp}
                          >
                            {formatTimestamp(result.message.timestamp)}
                          </time>
                        </div>
                        <p className="chorus-search-results__item-content">
                          {highlightText(result.message.content, freeTextQuery)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

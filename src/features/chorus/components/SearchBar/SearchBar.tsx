import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import './SearchBar.css'

interface FilterChip {
  prefix: string
  value: string
}

interface SearchBarProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

const FILTER_PREFIXES = ['from:', 'in:', 'has:', 'before:', 'after:'] as const

function parseChips(query: string): { chips: FilterChip[]; text: string } {
  const chips: FilterChip[] = []
  let text = query

  for (const prefix of FILTER_PREFIXES) {
    const regex = new RegExp(`${prefix}(\\S+)`, 'gi')
    let match = regex.exec(text)
    while (match?.[1]) {
      chips.push({ prefix: prefix.replace(':', ''), value: match[1] })
      text = text.replace(match[0], '')
      match = regex.exec(text)
    }
  }

  return { chips, text: text.trim() }
}

export default function SearchBar({ onSearch, initialQuery = '' }: SearchBarProps) {
  const parsed = useMemo(() => parseChips(initialQuery), [initialQuery])
  const [inputValue, setInputValue] = useState(parsed.text)
  const [chips, setChips] = useState<FilterChip[]>(parsed.chips)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const buildQuery = useCallback((text: string, currentChips: FilterChip[]): string => {
    const chipParts = currentChips.map((c) => `${c.prefix}:${c.value}`)
    const parts = [...chipParts]
    if (text.trim()) {
      parts.push(text.trim())
    }
    return parts.join(' ')
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Check if user just typed a filter prefix value
    for (const prefix of FILTER_PREFIXES) {
      const regex = new RegExp(`${prefix}(\\S+)\\s`, 'i')
      const match = regex.exec(val)
      if (match?.[1]) {
        const newChip: FilterChip = { prefix: prefix.replace(':', ''), value: match[1] }
        setChips((prev) => [...prev, newChip])
        setInputValue(val.replace(match[0], ''))
        return
      }
    }
    setInputValue(val)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Parse any remaining filter prefixes from input before submitting
      const { chips: newChips, text } = parseChips(inputValue)
      const allChips = [...chips, ...newChips]
      setChips(allChips)
      setInputValue(text)
      onSearch(buildQuery(text, allChips))
    }
    if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
      // Remove last chip
      setChips((prev) => prev.slice(0, -1))
    }
  }, [inputValue, chips, onSearch, buildQuery])

  const handleRemoveChip = useCallback((index: number) => {
    setChips((prev) => {
      const next = prev.filter((_, i) => i !== index)
      onSearch(buildQuery(inputValue, next))
      return next
    })
  }, [inputValue, onSearch, buildQuery])

  const handleClear = useCallback(() => {
    setInputValue('')
    setChips([])
    onSearch('')
    inputRef.current?.focus()
  }, [onSearch])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const { chips: newChips, text } = parseChips(inputValue)
    const allChips = [...chips, ...newChips]
    setChips(allChips)
    setInputValue(text)
    onSearch(buildQuery(text, allChips))
  }, [inputValue, chips, onSearch, buildQuery])

  const hasContent = inputValue.length > 0 || chips.length > 0

  return (
    <form className="chorus-search-bar" onSubmit={handleSubmit} role="search">
      <Search size={16} className="chorus-search-bar__icon" aria-hidden="true" />
      <div className="chorus-search-bar__input-area">
        {chips.map((chip, i) => (
          <span
            key={`${chip.prefix}-${chip.value}-${i}`}
            className={`chorus-search-bar__chip chorus-search-bar__chip--${chip.prefix}`}
          >
            <span className="chorus-search-bar__chip-prefix">{chip.prefix}:</span>
            <span className="chorus-search-bar__chip-value">{chip.value}</span>
            <button
              type="button"
              className="chorus-search-bar__chip-remove"
              onClick={() => handleRemoveChip(i)}
              aria-label={`Remove ${chip.prefix}:${chip.value} filter`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="chorus-search-bar__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={chips.length > 0 ? 'Add more filters...' : 'Search messages...'}
          aria-label="Search messages"
        />
      </div>
      {hasContent && (
        <button
          type="button"
          className="chorus-search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </form>
  )
}

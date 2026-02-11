import { useState, useCallback, useRef, useEffect, useId, memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSearch, SearchResult } from '../../api/search'

// Constants outside component to prevent recreation
const TYPE_LABELS: Record<string, string> = {
  person: 'Person',
  event: 'Event',
  conflict: 'Conflict',
  book: 'Book',
  country: 'Country',
}

const TYPE_COLORS: Record<string, string> = {
  person: 'bg-blue-100 text-blue-800',
  event: 'bg-green-100 text-green-800',
  conflict: 'bg-red-100 text-red-800',
  book: 'bg-purple-100 text-purple-800',
  country: 'bg-yellow-100 text-yellow-800',
}

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 10

// Memoized search result item component
interface SearchResultItemProps {
  result: SearchResult
  index: number
  selectedIndex: number
  listboxId: string
  onClick: (result: SearchResult) => void
  onMouseEnter: (index: number) => void
}

const SearchResultItem = memo(function SearchResultItem({
  result,
  index,
  selectedIndex,
  listboxId,
  onClick,
  onMouseEnter,
}: SearchResultItemProps) {
  const handleClick = useCallback(() => {
    onClick(result)
  }, [onClick, result])

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(index)
  }, [onMouseEnter, index])

  const isSelected = index === selectedIndex

  return (
    <li
      id={listboxId + '-option-' + index}
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={'px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ' +
        (isSelected ? 'bg-blue-50' : 'hover:bg-gray-50')}
    >
      <div className="flex items-center gap-3">
        <span className="sr-only">{TYPE_LABELS[result.type]}:</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-gray-900 truncate">
              {result.title}
            </span>
            <span
              className={'text-xs px-2 py-0.5 rounded ' + TYPE_COLORS[result.type]}
              aria-hidden="true"
            >
              {result.type}
            </span>
            {result.year && (
              <span className="text-xs text-gray-500">
                <span className="sr-only">Year: </span>
                {result.year}
              </span>
            )}
          </div>
          {result.subtitle && (
            <div className="text-sm text-gray-500 text-gray-500 truncate">
              {result.subtitle}
            </div>
          )}
        </div>
      </div>
    </li>
  )
})

// Main SearchBar component
const SearchBar = memo(function SearchBar() {
  const navigate = useNavigate()
  const searchId = useId()
  const listboxId = searchId + '-listbox'
  const labelId = searchId + '-label'

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const doSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await globalSearch(searchQuery, undefined, MAX_RESULTS)
      setResults(response.results)
      setSelectedIndex(-1)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => doSearch(value), DEBOUNCE_MS)
  }, [doSearch])

  const handleResultClick = useCallback((result: SearchResult) => {
    setIsOpen(false)
    setQuery('')

    switch (result.type) {
      case 'country':
        navigate('/country/' + result.id)
        break
      case 'book':
        // Navigate to books page with search pre-filled
        navigate('/books?search=' + encodeURIComponent(result.title))
        break
      case 'person':
      case 'event':
      case 'conflict':
        // These pages don't exist yet - navigate to glossary with context
        navigate('/glossary?search=' + encodeURIComponent(result.title))
        break
    }
  }, [navigate])

  const handleMouseEnterResult = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }, [isOpen, results, selectedIndex, handleResultClick])

  const handleFocus = useCallback(() => {
    if (query.length >= MIN_QUERY_LENGTH) {
      setIsOpen(true)
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Memoize results announcement for screen readers
  const resultsAnnouncement = useMemo(() => {
    if (isLoading) return 'Searching...'
    if (results.length > 0) return results.length + ' results found'
    if (query.length >= MIN_QUERY_LENGTH) return 'No results found'
    return ''
  }, [isLoading, results.length, query.length])

  // Memoize whether dropdown should show
  const shouldShowDropdown = useMemo(() => {
    return isOpen && (query.length >= MIN_QUERY_LENGTH || results.length > 0)
  }, [isOpen, query.length, results.length])

  // Memoize active descendant
  const activeDescendant = useMemo(() => {
    return selectedIndex >= 0 ? listboxId + '-option-' + selectedIndex : undefined
  }, [selectedIndex, listboxId])

  return (
    <div ref={searchRef} className="relative w-full max-w-md" role="search">
      {/* Visually hidden label for screen readers */}
      <label id={labelId} htmlFor={searchId} className="sr-only">
        Search people, events, conflicts, books, and countries
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search people, events, conflicts, books..."
          className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          aria-busy={isLoading}
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-2.5" aria-hidden="true">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Live region for screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultsAnnouncement}
      </div>

      {shouldShowDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute z-[100] w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto"
          style={{ border: '1px solid #E8C8C8' }}
        >
          {results.length === 0 && !isLoading && (
            <li className="px-4 py-3 text-sm text-gray-500" role="status">
              No results found for "{query}"
            </li>
          )}
          {results.map((result, index) => (
            <SearchResultItem
              key={result.type + '-' + result.id}
              result={result}
              index={index}
              selectedIndex={selectedIndex}
              listboxId={listboxId}
              onClick={handleResultClick}
              onMouseEnter={handleMouseEnterResult}
            />
          ))}
        </ul>
      )}
    </div>
  )
})

export default SearchBar

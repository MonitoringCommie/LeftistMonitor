import { useState, useCallback, useRef, useEffect, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface Suggestion {
  text: string
  type: string
  id?: string
}

const TYPE_COLORS: Record<string, string> = {
  person: 'bg-blue-100 text-blue-800',
  event: 'bg-green-100 text-green-800',
  conflict: 'bg-red-100 text-red-800',
  country: 'bg-yellow-100 text-yellow-800',
  party: 'bg-purple-100 text-purple-800',
}

export default function SearchAutocomplete() {
  const navigate = useNavigate()
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      const { data } = await apiClient.get<Suggestion[]>('/search/suggestions', {
        params: { q: query, limit: 8 }
      })
      return data
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // 1 minute
  })

  const handleSelect = useCallback((suggestion: Suggestion) => {
    setIsOpen(false)
    setQuery('')
    
    if (suggestion.id) {
      switch (suggestion.type) {
        case 'country':
          navigate(`/country/${suggestion.id}`)
          break
        case 'person':
          navigate(`/person/${suggestion.id}`)
          break
        case 'event':
          navigate(`/event/${suggestion.id}`)
          break
        case 'conflict':
          navigate(`/conflict/${suggestion.id}`)
          break
        case 'party':
          navigate(`/party/${suggestion.id}`)
          break
        default:
          navigate(`/search?q=${encodeURIComponent(suggestion.text)}`)
      }
    }
  }, [navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions?.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex])
        } else if (query.length >= 2) {
          navigate(`/search?q=${encodeURIComponent(query)}`)
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  return (
    <div ref={containerRef} className="relative w-full max-w-lg" role="search">
      <label htmlFor={inputId} className="sr-only">
        Search
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search people, events, countries..."
          className="w-full px-4 py-2.5 pl-11 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `${listboxId}-${selectedIndex}` : undefined}
        />
        
        <svg
          className="absolute left-3.5 top-3 h-5 w-5 text-gray-400"
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
          <div className="absolute right-3 top-3" aria-hidden="true">
            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && query.length >= 2 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
        >
          {!suggestions?.length && !isLoading ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              No results for "{query}"
            </li>
          ) : (
            suggestions?.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.id || index}`}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                  index === selectedIndex ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-900">{suggestion.text}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[suggestion.type] || 'bg-gray-100 text-gray-600'}`}>
                  {suggestion.type}
                </span>
              </li>
            ))
          )}
          
          {query.length >= 2 && (
            <li
              className="px-4 py-3 border-t border-gray-100 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(query)}`)
                setIsOpen(false)
              }}
            >
              Search for "{query}" →
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

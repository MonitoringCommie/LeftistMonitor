import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useMapStore, useSelectedYear, useIsPlaying, usePlaybackSpeed } from '../../stores/mapStore'
import { useGlobalEventsByYear } from '../../api/events'

const MIN_YEAR = 1900
const MAX_YEAR = new Date().getFullYear()

// Key historical periods for markers
const HISTORICAL_MARKERS = [
  { year: 1914, label: 'WWI' },
  { year: 1939, label: 'WWII' },
  { year: 1945, label: 'UN' },
  { year: 1991, label: 'USSR Falls' },
] as const

const CATEGORY_COLORS: Record<string, string> = {
  political: 'bg-blue-500',
  military: 'bg-red-500',
  economic: 'bg-green-500',
  social: 'bg-purple-500',
  cultural: 'bg-pink-500',
  other: 'bg-gray-500',
}

export default function TimeSlider() {
  const intervalRef = useRef<number | null>(null)
  const debounceRef = useRef<number | null>(null)
  const [showEvents, setShowEvents] = useState(true)
  const [displayYear, setDisplayYear] = useState(MIN_YEAR)
  const [debouncedYear, setDebouncedYear] = useState(MIN_YEAR)

  // Use granular selectors for better performance
  const selectedYear = useSelectedYear()
  const isPlaying = useIsPlaying()
  const playbackSpeed = usePlaybackSpeed()
  const { setYear, incrementYear, togglePlayback, setPlaybackSpeed } = useMapStore()

  // Sync display year with store
  useEffect(() => {
    setDisplayYear(selectedYear)
    setDebouncedYear(selectedYear)
  }, [selectedYear])

  // Fetch global events for the DEBOUNCED year (not every slider tick)
  const { data: globalEvents, isLoading: eventsLoading } = useGlobalEventsByYear(debouncedYear)

  // Handle playback animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        incrementYear()
      }, 1000 / playbackSpeed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, incrementYear])

  // Stop playback when reaching max year
  useEffect(() => {
    if (selectedYear >= MAX_YEAR && isPlaying) {
      togglePlayback()
    }
  }, [selectedYear, isPlaying, togglePlayback])

  // Debounced year update for API calls
  const updateDebouncedYear = useCallback((year: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      setDebouncedYear(year)
    }, 150) // 150ms debounce for API calls
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10)
    setDisplayYear(year)
    setYear(year)
    updateDebouncedYear(year)
  }, [setYear, updateDebouncedYear])

  const handleYearInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10)
    if (!isNaN(year) && year >= MIN_YEAR && year <= MAX_YEAR) {
      setDisplayYear(year)
      setYear(year)
      updateDebouncedYear(year)
    }
  }, [setYear, updateDebouncedYear])

  const handleMarkerClick = useCallback((year: number) => {
    setDisplayYear(year)
    setYear(year)
    setDebouncedYear(year) // Immediate update for marker clicks
  }, [setYear])

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaybackSpeed(parseFloat(e.target.value))
  }, [setPlaybackSpeed])

  const toggleEventsDisplay = useCallback(() => {
    setShowEvents(prev => !prev)
  }, [])

  // Memoize marker positions
  const markerPositions = useMemo(() => {
    return HISTORICAL_MARKERS.map(marker => ({
      ...marker,
      position: ((marker.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100
    }))
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Year display and controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayback}
            className={`p-2 rounded-full transition-colors ${
              isPlaying
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title={isPlaying ? 'Pause' : 'Play through history'}
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </button>

          <select
            value={playbackSpeed}
            onChange={handleSpeedChange}
            className="text-sm border rounded px-2 py-1"
            title="Playback speed"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleEventsDisplay}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showEvents
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
            title="Toggle events display"
          >
            {showEvents ? 'Hide Events' : 'Show Events'}
          </button>
          <input
            type="number"
            value={displayYear}
            onChange={handleYearInput}
            min={MIN_YEAR}
            max={MAX_YEAR}
            className="w-20 text-center text-2xl font-bold border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={displayYear}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-red-600"
            style={{ background: '#E8C8C8' }}
        />

        {/* Historical markers */}
        <div className="relative h-6 mt-1">
          {markerPositions.map((marker) => (
            <button
              key={marker.year}
              onClick={() => handleMarkerClick(marker.year)}
              className="absolute transform -translate-x-1/2 text-xs text-gray-500 hover:text-red-600 transition-colors"
              style={{ left: `${marker.position}%` }}
              title={`Jump to ${marker.year}`}
            >
              <div className="w-1 h-2 bg-gray-400 mx-auto mb-0.5" />
              {marker.label}
            </button>
          ))}
        </div>
      </div>

      {/* Year range labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{MIN_YEAR}</span>
        <span>{MAX_YEAR}</span>
      </div>

      {/* Events display */}
      {showEvents && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">
              Events in {debouncedYear}
            </h4>
            {eventsLoading && (
              <span className="text-xs text-gray-400">Loading...</span>
            )}
          </div>

          {globalEvents && globalEvents.length > 0 ? (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {globalEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other
                    }`}
                    title={event.category}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800 line-clamp-1">{event.title}</span>
                    {event.start_date && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !eventsLoading ? (
            <p className="text-xs text-gray-400 italic">No major events recorded for this year</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

// Simple SVG icons
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
    </svg>
  )
}

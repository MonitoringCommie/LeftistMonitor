import { useState, useMemo, useCallback, memo } from 'react'
import { useEvents } from '../../api/events'

interface EventsTabProps {
  countryId: string
  year: number
}

// Move outside component - never recreated
const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  political: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  economic: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  cultural: { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
  social: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  military: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
}

const CATEGORIES = ['political', 'economic', 'cultural', 'social', 'military', 'other'] as const

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Memoized event card component
const EventCard = memo(function EventCard({ event }: { event: any }) {
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h5 className="font-medium text-gray-900">{event.title}</h5>
          {event.importance && (
            <div className="flex gap-0.5">
              {[...Array(Math.min(event.importance, 5))].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{formatDate(event.start_date)}</span>
          {event.end_date && event.end_date !== event.start_date && (
            <span className="text-xs text-gray-500">- {formatDate(event.end_date)}</span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${colors.bg} ${colors.text}`}>
            {event.category}
          </span>
          {event.event_type && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
              {event.event_type.replace('_', ' ')}
            </span>
          )}
        </div>
        {event.location_name && (
          <p className="text-xs text-gray-400 mt-1">{event.location_name}</p>
        )}
      </div>
    </div>
  )
})

const EventsTab = memo(function EventsTab({ countryId }: EventsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const { data: eventsData, isLoading } = useEvents(countryId, undefined, selectedCategory || undefined)

  const events = useMemo(() => eventsData?.items || [], [eventsData])

  // Memoize expensive grouping calculation
  const eventsByDecade = useMemo(() => {
    return events.reduce((acc, event) => {
      if (!event.start_date) return acc
      const decade = Math.floor(new Date(event.start_date).getFullYear() / 10) * 10
      if (!acc[decade]) acc[decade] = []
      acc[decade].push(event)
      return acc
    }, {} as Record<number, typeof events>)
  }, [events])

  const decades = useMemo(() => 
    Object.keys(eventsByDecade).map(Number).sort((a, b) => b - a),
    [eventsByDecade]
  )

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by category">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedCategory === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => {
          const colors = CATEGORY_COLORS[cat]
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-800 text-white'
                  : `${colors.bg} ${colors.text} hover:opacity-80`
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded skeleton w-20"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 rounded-lg skeleton"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No events data available.</div>
      ) : (
        <div className="space-y-6">
          {decades.map((decade) => (
            <div key={decade}>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">{decade}s</h4>
              <div className="space-y-2">
                {eventsByDecade[decade].map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default EventsTab

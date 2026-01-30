import { memo, useMemo, useCallback } from 'react'
import { useTimeline } from '../../api/events'
import type { Country } from '../../types'

interface OverviewTabProps {
  country: Country
  year: number
}

// Constants outside component to prevent recreation
const EVENT_TYPE_COLORS: Record<string, string> = {
  election: 'bg-blue-500',
  conflict_start: 'bg-red-500',
  conflict_end: 'bg-orange-500',
}

const CATEGORY_COLORS: Record<string, string> = {
  political: 'bg-purple-500',
  economic: 'bg-green-500',
  military: 'bg-red-400',
}

const EVENT_BADGE_COLORS: Record<string, string> = {
  election: 'bg-blue-100 text-blue-700',
  conflict_start: 'bg-red-100 text-red-700',
  conflict_end: 'bg-red-100 text-red-700',
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

// Memoized timeline event component
interface TimelineEventProps {
  event: {
    type: string
    id: string | number
    title: string
    date: string
    end_date?: string
    category?: string
  }
}

const TimelineEvent = memo(function TimelineEvent({ event }: TimelineEventProps) {
  const dotColor = useMemo(() => {
    if (EVENT_TYPE_COLORS[event.type]) return EVENT_TYPE_COLORS[event.type]
    if (event.category && CATEGORY_COLORS[event.category]) return CATEGORY_COLORS[event.category]
    return 'bg-gray-400'
  }, [event.type, event.category])

  const badgeColor = useMemo(() => {
    if (event.type.startsWith('conflict')) return 'bg-red-100 text-red-700'
    return EVENT_BADGE_COLORS[event.type] || 'bg-gray-100 text-gray-700'
  }, [event.type])

  const formattedDate = useMemo(() => {
    const start = new Date(event.date).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)
    if (!event.end_date) return start
    const end = new Date(event.end_date).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)
    return start + ' - ' + end
  }, [event.date, event.end_date])

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className={'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ' + dotColor} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
      <span className={'text-xs px-2 py-0.5 rounded-full ' + badgeColor}>
        {event.type.replace('_', ' ')}
      </span>
    </div>
  )
})

// Skeleton loader for loading state
const OverviewSkeleton = memo(function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-lg border p-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
})

const OverviewTab = memo(function OverviewTab({ country, year }: OverviewTabProps) {
  const { data: timeline, isLoading } = useTimeline(country.id, year - 10, year + 10)

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return 'Present'
    return new Date(dateStr).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)
  }, [])

  // Memoize validity period string
  const validityPeriod = useMemo(() => {
    return formatDate(country.valid_from) + ' - ' + formatDate(country.valid_to)
  }, [country.valid_from, country.valid_to, formatDate])

  // Memoize sliced timeline (only first 20 events)
  const displayedEvents = useMemo(() => {
    return timeline?.slice(0, 20) ?? []
  }, [timeline])

  // Memoize timeline range string
  const timelineRange = useMemo(() => {
    return 'Timeline (' + (year - 10) + ' - ' + (year + 10) + ')'
  }, [year])

  if (isLoading) {
    return <OverviewSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Country Info */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">{country.name_en}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 capitalize">{country.entity_type?.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-500">Valid:</span>
            <span className="ml-2">{validityPeriod}</span>
          </div>
          {country.iso_alpha2 && (
            <div>
              <span className="text-gray-500">ISO:</span>
              <span className="ml-2">{country.iso_alpha2} / {country.iso_alpha3}</span>
            </div>
          )}
          {country.gwcode && (
            <div>
              <span className="text-gray-500">GW Code:</span>
              <span className="ml-2">{country.gwcode}</span>
            </div>
          )}
        </div>
        {country.description && (
          <p className="mt-4 text-sm text-gray-600">{country.description}</p>
        )}
      </div>

      {/* Recent Timeline */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">{timelineRange}</h3>
        {displayedEvents.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {displayedEvents.map((event) => (
              <TimelineEvent key={event.type + '-' + event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No events found for this period.</p>
        )}
      </div>
    </div>
  )
})

export default OverviewTab

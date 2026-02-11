import { memo, useMemo, useCallback, useState } from 'react'
import { useTimeline } from '../../api/events'
import { useGDPHistory, useBudgetBreakdown, usePopulationHistory, useEconomicOverview } from '../../api/economic'
import { GDPLineChart, BudgetPieChart, PopulationChart } from '../charts'
import type { Country } from '../../types'

interface OverviewTabProps {
  country: Country
  year: number
}

// Constants
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}

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

// Timeline Event Component
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

// Stat Card Component
interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: string
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
}

const StatCard = memo(function StatCard({ label, value, subtext, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }

  return (
    <div className={'rounded-lg border p-4 ' + colorClasses[color]}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
    </div>
  )
})

// Loading skeleton
const OverviewSkeleton = memo(function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 rounded-lg skeleton" />
        <div className="h-80 rounded-lg skeleton" />
      </div>
    </div>
  )
})

const OverviewTab = memo(function OverviewTab({ country, year }: OverviewTabProps) {
  const [showAllEvents, setShowAllEvents] = useState(false)
  
  // Data fetching
  const { data: timeline, isLoading: timelineLoading } = useTimeline(country.id, year - 10, year + 10)
  const { data: gdpData, isLoading: gdpLoading } = useGDPHistory(country.id, 1980, 2023)
  const { data: budgetData, isLoading: budgetLoading } = useBudgetBreakdown(country.id, year)
  const { data: populationData, isLoading: popLoading } = usePopulationHistory(country.id, 1960, 2023)
  const { data: economicOverview } = useEconomicOverview(country.id)

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return 'Present'
    return new Date(dateStr).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)
  }, [])

  const validityPeriod = useMemo(() => {
    return formatDate(country.valid_from) + ' - ' + formatDate(country.valid_to)
  }, [country.valid_from, country.valid_to, formatDate])

  const displayedEvents = useMemo(() => {
    if (!timeline) return []
    return showAllEvents ? timeline.slice(0, 50) : timeline.slice(0, 10)
  }, [timeline, showAllEvents])

  const formatLargeNumber = (value?: number) => {
    if (!value) return 'N/A'
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T'
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B'
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M'
    return '$' + value.toLocaleString()
  }

  const formatPopNumber = (value?: number) => {
    if (!value) return 'N/A'
    if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B'
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M'
    return value.toLocaleString()
  }

  const isLoading = timelineLoading || gdpLoading || budgetLoading || popLoading

  if (isLoading) {
    return <OverviewSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="GDP"
          value={formatLargeNumber(economicOverview?.gdp_current)}
          subtext={economicOverview?.year ? `(${economicOverview.year})` : undefined}
          color="green"
        />
        <StatCard
          label="GDP per Capita"
          value={economicOverview?.gdp_per_capita 
            ? '$' + Math.round(economicOverview.gdp_per_capita).toLocaleString()
            : 'N/A'}
          color="blue"
        />
        <StatCard
          label="Population"
          value={formatPopNumber(populationData?.[populationData.length - 1]?.population)}
          subtext="Latest estimate"
          color="purple"
        />
        <StatCard
          label="GDP Growth"
          value={economicOverview?.gdp_growth 
            ? (economicOverview.gdp_growth > 0 ? '+' : '') + economicOverview.gdp_growth.toFixed(1) + '%'
            : 'N/A'}
          color={economicOverview?.gdp_growth && economicOverview.gdp_growth >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Country Info Card */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">Country Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDP Chart */}
        {gdpData && gdpData.length > 0 && (
          <GDPLineChart
            data={gdpData}
            title="GDP History (1980-2023)"
            showGrowthRate={true}
            highlightYear={year}
          />
        )}

        {/* Budget Breakdown */}
        {budgetData && budgetData.length > 0 && (
          <BudgetPieChart
            data={budgetData}
            title={`Government Budget Breakdown (${year})`}
          />
        )}

        {/* Population Chart */}
        {populationData && populationData.length > 0 && (
          <PopulationChart
            data={populationData}
            title="Population History"
            showUrbanRural={true}
          />
        )}

        {/* Timeline */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">
              Recent Events ({year - 10} - {year + 10})
            </h3>
            {timeline && timeline.length > 10 && (
              <button
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {showAllEvents ? 'Show Less' : `Show All (${timeline.length})`}
              </button>
            )}
          </div>
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

      {/* Additional Economic Indicators */}
      {economicOverview && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">Economic Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {economicOverview.inflation !== undefined && (
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Inflation</p>
                <p className="text-xl font-semibold">{economicOverview.inflation.toFixed(1)}%</p>
              </div>
            )}
            {economicOverview.unemployment !== undefined && (
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Unemployment</p>
                <p className="text-xl font-semibold">{economicOverview.unemployment.toFixed(1)}%</p>
              </div>
            )}
            {economicOverview.debt_to_gdp !== undefined && (
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Debt to GDP</p>
                <p className="text-xl font-semibold">{economicOverview.debt_to_gdp.toFixed(1)}%</p>
              </div>
            )}
            {economicOverview.trade_balance !== undefined && (
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Trade Balance</p>
                <p className="text-xl font-semibold">{formatLargeNumber(economicOverview.trade_balance)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default OverviewTab

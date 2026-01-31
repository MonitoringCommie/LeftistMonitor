import { useState, useMemo, useCallback, memo } from 'react'
import { useConflicts, useConflict } from '../../api/events'
import { ConflictTimelineChart, MilitarySpendingChart } from '../charts'
import { useMilitarySpending } from '../../api/economic'

interface ConflictsTabProps {
  countryId: string
  year: number
}

const CONFLICT_TYPE_COLORS: Record<string, string> = {
  interstate: 'bg-red-100 text-red-700',
  civil_war: 'bg-orange-100 text-orange-700',
  colonial: 'bg-purple-100 text-purple-700',
  ethnic: 'bg-yellow-100 text-yellow-700',
  revolutionary: 'bg-red-200 text-red-800',
  proxy: 'bg-blue-100 text-blue-700',
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Ongoing'
  return new Date(dateStr).getFullYear().toString()
}

const formatCasualties = (low?: number, high?: number) => {
  if (!low && !high) return 'Unknown'
  if (low === high || !high) return low?.toLocaleString() || 'Unknown'
  return `${low?.toLocaleString()} - ${high?.toLocaleString()}`
}

const ConflictCard = memo(function ConflictCard({
  conflict,
  isSelected,
  isActive,
  year,
  onClick,
}: {
  conflict: any
  isSelected: boolean
  isActive: boolean
  year: number
  onClick: () => void
}) {
  const typeColor = CONFLICT_TYPE_COLORS[conflict.conflict_type] || 'bg-gray-100 text-gray-700'

  return (
    <button
      onClick={onClick}
      className={`
        text-left p-3 rounded-lg border transition-colors w-full
        ${isSelected
          ? 'bg-red-50 border-red-300'
          : isActive
            ? 'bg-white border-red-200 hover:bg-red-50'
            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title={`Active in ${year}`} />
            )}
            <h5 className={`font-medium ${!isActive ? 'text-gray-500' : ''}`}>{conflict.name}</h5>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-500">
              {formatDate(conflict.start_date)} - {formatDate(conflict.end_date)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${typeColor}`}>
              {conflict.conflict_type?.replace('_', ' ') || 'conflict'}
            </span>
            {conflict.intensity && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                conflict.intensity === 'major' ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {conflict.intensity}
              </span>
            )}
          </div>
        </div>
        {(conflict.casualties_low || conflict.casualties_high) && (
          <div className="text-right">
            <span className="text-xs text-gray-500">Casualties</span>
            <p className="text-sm font-medium text-red-600">
              {formatCasualties(conflict.casualties_low, conflict.casualties_high)}
            </p>
          </div>
        )}
      </div>
    </button>
  )
})

const ConflictDetail = memo(function ConflictDetail({ conflict }: { conflict: any }) {
  if (!conflict) return null

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div>
        <h4 className="text-lg font-semibold">{conflict.name}</h4>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(conflict.start_date)} - {formatDate(conflict.end_date)}
        </p>
      </div>

      {conflict.description && (
        <p className="text-sm text-gray-700">{conflict.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>
          <span className="ml-2 capitalize">{conflict.conflict_type?.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="text-gray-500">Intensity:</span>
          <span className="ml-2 capitalize">{conflict.intensity || 'Unknown'}</span>
        </div>
        <div>
          <span className="text-gray-500">Casualties:</span>
          <span className="ml-2">{formatCasualties(conflict.casualties_low, conflict.casualties_high)}</span>
        </div>
        {conflict.displaced && (
          <div>
            <span className="text-gray-500">Displaced:</span>
            <span className="ml-2">{conflict.displaced.toLocaleString()}</span>
          </div>
        )}
      </div>

      {conflict.belligerents && conflict.belligerents.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-2">Belligerents</h5>
          <div className="flex flex-wrap gap-2">
            {conflict.belligerents.map((b: string, i: number) => (
              <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {conflict.wikidata_id && (
        <a
          href={`https://www.wikidata.org/wiki/${conflict.wikidata_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          View on Wikidata
        </a>
      )}
    </div>
  )
})

export default function ConflictsTab({ countryId, year }: ConflictsTabProps) {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  
  const { data: conflictsData, isLoading } = useConflicts(countryId)
  const { data: conflictDetail } = useConflict(selectedConflictId || '')
  const { data: militaryData } = useMilitarySpending(countryId, 1990, 2023)

  const conflicts = conflictsData?.items || []

  const isConflictActive = useCallback((conflict: any, checkYear: number) => {
    const startYear = conflict.start_date ? new Date(conflict.start_date).getFullYear() : -Infinity
    const endYear = conflict.end_date ? new Date(conflict.end_date).getFullYear() : Infinity
    return checkYear >= startYear && checkYear <= endYear
  }, [])

  const { activeConflicts, historicalConflicts } = useMemo(() => {
    const active = conflicts.filter((c: any) => isConflictActive(c, year))
    const historical = conflicts.filter((c: any) => !isConflictActive(c, year))
    return { activeConflicts: active, historicalConflicts: historical }
  }, [conflicts, year, isConflictActive])

  // Generate timeline data from conflicts
  const timelineData = useMemo(() => {
    const yearMap = new Map<number, { conflicts: number; casualties: number; intensity: 'low' | 'medium' | 'high' }>()
    
    conflicts.forEach((conflict: any) => {
      const startYear = conflict.start_date ? new Date(conflict.start_date).getFullYear() : 1900
      const endYear = conflict.end_date ? new Date(conflict.end_date).getFullYear() : new Date().getFullYear()
      
      for (let y = startYear; y <= endYear; y++) {
        const existing = yearMap.get(y) || { conflicts: 0, casualties: 0, intensity: 'low' as const }
        existing.conflicts += 1
        if (conflict.casualties_low) {
          existing.casualties += conflict.casualties_low / (endYear - startYear + 1)
        }
        if (conflict.intensity === 'major') {
          existing.intensity = 'high'
        } else if (conflict.intensity === 'minor' && existing.intensity !== 'high') {
          existing.intensity = 'medium'
        }
        yearMap.set(y, existing)
      }
    })

    return Array.from(yearMap.entries())
      .map(([yr, data]) => ({
        year: yr,
        ...data,
        casualties: Math.round(data.casualties)
      }))
      .filter(d => d.year >= 1900)
      .sort((a, b) => a.year - b.year)
  }, [conflicts])

  const totalCasualties = useMemo(() => {
    return conflicts.reduce((sum: number, c: any) => sum + (c.casualties_low || 0), 0)
  }, [conflicts])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Active Conflicts</p>
          <p className="text-2xl font-bold text-red-700">{activeConflicts.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600">Historical Conflicts</p>
          <p className="text-2xl font-bold text-orange-700">{historicalConflicts.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Conflicts</p>
          <p className="text-2xl font-bold text-gray-700">{conflicts.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600">Est. Total Casualties</p>
          <p className="text-2xl font-bold text-purple-700">{totalCasualties.toLocaleString()}</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'list' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'timeline' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Timeline View
        </button>
      </div>

      {viewMode === 'timeline' ? (
        <div className="space-y-6">
          {/* Conflict Timeline Chart */}
          {timelineData.length > 0 && (
            <ConflictTimelineChart
              data={timelineData}
              title="Conflicts Over Time"
              showCasualties={true}
              highlightYear={year}
            />
          )}

          {/* Military Spending Chart */}
          {militaryData && militaryData.length > 0 && (
            <MilitarySpendingChart
              data={militaryData}
              title="Military Spending"
              showGDPPercent={true}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conflicts List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Active Conflicts */}
            {activeConflicts.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Active Conflicts ({year})
                </h4>
                <div className="space-y-2">
                  {activeConflicts.map((conflict: any) => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      isSelected={selectedConflictId === conflict.id}
                      isActive={true}
                      year={year}
                      onClick={() => setSelectedConflictId(conflict.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Historical Conflicts */}
            {historicalConflicts.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-600">Historical Conflicts</h4>
                <div className="space-y-2">
                  {historicalConflicts.slice(0, 20).map((conflict: any) => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      isSelected={selectedConflictId === conflict.id}
                      isActive={false}
                      year={year}
                      onClick={() => setSelectedConflictId(conflict.id)}
                    />
                  ))}
                </div>
                {historicalConflicts.length > 20 && (
                  <p className="text-sm text-gray-500 mt-2">
                    And {historicalConflicts.length - 20} more historical conflicts...
                  </p>
                )}
              </div>
            )}

            {conflicts.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No conflicts recorded for this country.</p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {conflictDetail ? (
              <ConflictDetail conflict={conflictDetail} />
            ) : (
              <div className="bg-gray-50 rounded-lg border p-4 text-center text-gray-500">
                Select a conflict to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo, useCallback, memo } from 'react'
import { useConflicts, useConflict } from '../../api/events'

interface ConflictsTabProps {
  countryId: string
  year: number
}

// Move outside component
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

// Memoized conflict card
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
        <div>
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title={`Active in ${year}`} />
            )}
            <h5 className={`font-medium ${!isActive ? 'text-gray-500' : ''}`}>{conflict.name}</h5>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {formatDate(conflict.start_date)} - {formatDate(conflict.end_date)}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${typeColor}`}>
              {conflict.conflict_type.replace('_', ' ')}
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
            <p className="text-xs text-gray-500">Casualties</p>
            <p className="text-sm font-medium text-red-700">
              {formatCasualties(conflict.casualties_low, conflict.casualties_high)}
            </p>
          </div>
        )}
      </div>
    </button>
  )
})

const ConflictsTab = memo(function ConflictsTab({ countryId, year }: ConflictsTabProps) {
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null)
  const { data: conflictsData, isLoading } = useConflicts(countryId)
  const { data: conflictDetail } = useConflict(selectedConflictId || '')

  const conflicts = useMemo(() => conflictsData?.items || [], [conflictsData])

  // Memoize active check function
  const isActiveInYear = useCallback((conflict: typeof conflicts[0]) => {
    const start = conflict.start_date ? new Date(conflict.start_date).getFullYear() : 0
    const end = conflict.end_date ? new Date(conflict.end_date).getFullYear() : 9999
    return year >= start && year <= end
  }, [year])

  // Memoize sorted conflicts
  const sortedConflicts = useMemo(() => {
    return [...conflicts].sort((a, b) => {
      const aActive = isActiveInYear(a)
      const bActive = isActiveInYear(b)
      if (aActive !== bActive) return aActive ? -1 : 1
      const aYear = a.start_date ? new Date(a.start_date).getFullYear() : 0
      const bYear = b.start_date ? new Date(b.start_date).getFullYear() : 0
      return bYear - aYear
    })
  }, [conflicts, isActiveInYear])

  // Memoize active conflict IDs for quick lookup
  const activeConflictIds = useMemo(() => 
    new Set(conflicts.filter(isActiveInYear).map(c => c.id)),
    [conflicts, isActiveInYear]
  )

  const handleSelectConflict = useCallback((id: string) => {
    setSelectedConflictId(id)
  }, [])

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">
        Showing all conflicts. Active in {year} shown first with indicator
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : conflicts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No conflict data available for this country.</div>
      ) : (
        <>
          <div className="grid gap-3">
            {sortedConflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                isSelected={selectedConflictId === conflict.id}
                isActive={activeConflictIds.has(conflict.id)}
                year={year}
                onClick={() => handleSelectConflict(conflict.id)}
              />
            ))}
          </div>

          {conflictDetail && (
            <div className="bg-white rounded-lg border p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{conflictDetail.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(conflictDetail.start_date)} - {formatDate(conflictDetail.end_date)}
                </p>
              </div>

              {conflictDetail.participants && conflictDetail.participants.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {['side_a', 'side_b'].map((side) => {
                    const sideParticipants = conflictDetail.participants.filter((p: any) => p.side === side)
                    if (sideParticipants.length === 0) return null
                    return (
                      <div key={side} className={`p-3 rounded-lg ${side === 'side_a' ? 'bg-blue-50' : 'bg-red-50'}`}>
                        <h5 className="text-xs font-medium text-gray-500 mb-2">
                          {side === 'side_a' ? 'Side A' : 'Side B'}
                        </h5>
                        <div className="space-y-1">
                          {sideParticipants.map((p: any) => (
                            <div key={p.id} className="text-sm">
                              <span className="font-medium">{p.country_name || p.actor_name}</span>
                              {p.role && <span className="text-gray-500 text-xs ml-1">({p.role})</span>}
                              {p.casualties && (
                                <span className="text-red-600 text-xs ml-2">{p.casualties.toLocaleString()} casualties</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {conflictDetail.description && (
                <p className="text-sm text-gray-600">{conflictDetail.description}</p>
              )}

              {conflictDetail.progressive_analysis && (
                <div className="bg-red-50 rounded p-3">
                  <h5 className="text-xs font-medium text-red-800 mb-1">Progressive Analysis</h5>
                  <p className="text-sm text-red-700">{conflictDetail.progressive_analysis}</p>
                </div>
              )}

              {conflictDetail.outcome && (
                <div>
                  <h5 className="text-xs font-medium text-gray-500 mb-1">Outcome</h5>
                  <p className="text-sm">{conflictDetail.outcome}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
})

export default ConflictsTab

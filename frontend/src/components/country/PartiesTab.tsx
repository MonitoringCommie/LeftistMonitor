import { useState, useMemo, useCallback, memo } from 'react'
import { useParties, useParty } from '../../api/politics'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface PartiesTabProps {
  countryId: string
  year: number
}

const getSpectrumColor = (score?: number) => {
  if (score === undefined || score === null) return '#9ca3af'
  if (score <= -60) return '#dc2626'
  if (score <= -30) return '#ef4444'
  if (score <= -10) return '#f97316'
  if (score <= 10) return '#eab308'
  if (score <= 30) return '#22c55e'
  if (score <= 60) return '#3b82f6'
  return '#1e3a8a'
}

const getSpectrumLabel = (score?: number) => {
  if (score === undefined || score === null) return 'Unknown'
  if (score <= -60) return 'Far Left'
  if (score <= -30) return 'Left'
  if (score <= -10) return 'Center-Left'
  if (score <= 10) return 'Center'
  if (score <= 30) return 'Center-Right'
  if (score <= 60) return 'Right'
  return 'Far Right'
}

// Memoized party card component
const PartyCard = memo(function PartyCard({
  party,
  isSelected,
  isActive,
  onClick,
}: {
  party: any
  isSelected: boolean
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-3 rounded-lg border transition-colors w-full
        ${isSelected
          ? 'bg-blue-50 border-blue-300'
          : isActive
            ? 'bg-white hover:bg-gray-50 border-gray-200'
            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full flex-shrink-0 ${!isActive ? 'opacity-50' : ''}`}
          style={{ backgroundColor: getSpectrumColor(party.left_right_score) }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className={`font-medium truncate ${!isActive ? 'text-gray-500' : ''}`}>
              {party.name}
            </h5>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Active" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {party.party_family && <span>{party.party_family}</span>}
            {party.founded && (
              <span>
                {new Date(party.founded).getFullYear()}
                {party.dissolved && ` - ${new Date(party.dissolved).getFullYear()}`}
              </span>
            )}
          </div>
        </div>
        <span className={`
          text-xs px-2 py-1 rounded
          ${party.left_right_score !== undefined ? 'bg-gray-100' : 'bg-gray-50 text-gray-400'}
        `}>
          {getSpectrumLabel(party.left_right_score)}
        </span>
      </div>
    </button>
  )
})

const PartiesTab = memo(function PartiesTab({ countryId, year }: PartiesTabProps) {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
  const [showAllParties, setShowAllParties] = useState(false)

  const { data: allPartiesData, isLoading } = useParties(countryId)
  const { data: partyDetail } = useParty(selectedPartyId || '')

  const allParties = useMemo(() => allPartiesData?.items || [], [allPartiesData])

  // Memoized year check function
  const isActiveInYear = useCallback((party: typeof allParties[0]) => {
    const foundedYear = party.founded ? new Date(party.founded).getFullYear() : 0
    const dissolvedYear = party.dissolved ? new Date(party.dissolved).getFullYear() : 9999
    return year >= foundedYear && year <= dissolvedYear
  }, [year])

  // Memoized active parties
  const activeParties = useMemo(
    () => allParties.filter(isActiveInYear),
    [allParties, isActiveInYear]
  )

  // Memoized display parties
  const displayParties = useMemo(
    () => showAllParties ? allParties : activeParties,
    [showAllParties, allParties, activeParties]
  )

  // Memoized sorted parties
  const sortedParties = useMemo(
    () => [...displayParties].sort((a, b) => (a.left_right_score ?? 0) - (b.left_right_score ?? 0)),
    [displayParties]
  )

  // Memoized sorted active parties for spectrum
  const sortedActiveParties = useMemo(
    () => [...activeParties].sort((a, b) => (a.left_right_score ?? 0) - (b.left_right_score ?? 0)),
    [activeParties]
  )

  // Memoized family groups
  const familyGroups = useMemo(() => {
    return sortedActiveParties.reduce((acc, party) => {
      const family = party.party_family || 'Other'
      if (!acc[family]) acc[family] = []
      acc[family].push(party)
      return acc
    }, {} as Record<string, typeof activeParties>)
  }, [sortedActiveParties])

  // Memoized history data
  const historyData = useMemo(() => {
    return partyDetail?.election_history
      ?.slice()
      .reverse()
      .map(h => ({
        year: new Date(h.election_date).getFullYear(),
        votes: h.vote_share,
        seats: h.seat_share,
      })) || []
  }, [partyDetail])

  const handleToggleAllParties = useCallback(() => {
    setShowAllParties(prev => !prev)
  }, [])

  const handleSelectParty = useCallback((partyId: string) => {
    setSelectedPartyId(partyId)
  }, [])

  // Create stable lookup for active status
  const activePartyIds = useMemo(
    () => new Set(activeParties.map(p => p.id)),
    [activeParties]
  )

  return (
    <div className="space-y-4">
      {/* Year indicator and toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {showAllParties
            ? `Showing all ${allParties.length} parties`
            : `Showing ${activeParties.length} parties active in ${year}`
          }
        </div>
        <button
          onClick={handleToggleAllParties}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            showAllParties ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {showAllParties ? 'Show Active Only' : 'Show All Parties'}
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : allParties.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No political party data available for this country.</div>
      ) : (
        <>
          {/* Political Spectrum Visualization */}
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-sm font-medium mb-3">Political Spectrum ({year})</h4>
            <div className="relative h-12 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-600 rounded-lg">
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white font-medium">
                <span>Far Left</span>
                <span>Center</span>
                <span>Far Right</span>
              </div>
            </div>
            <div className="relative h-16 mt-2">
              {sortedActiveParties.map((party) => {
                const position = ((party.left_right_score ?? 0) + 100) / 200 * 100
                return (
                  <button
                    key={party.id}
                    onClick={() => handleSelectParty(party.id)}
                    className={`
                      absolute transform -translate-x-1/2 transition-all
                      ${selectedPartyId === party.id ? 'z-10 scale-110' : 'hover:scale-105'}
                    `}
                    style={{ left: `${Math.max(5, Math.min(95, position))}%` }}
                    title={`${party.name}: ${getSpectrumLabel(party.left_right_score)}`}
                    aria-label={`${party.name}, ${getSpectrumLabel(party.left_right_score)}`}
                  >
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2 border-white shadow
                        ${selectedPartyId === party.id ? 'ring-2 ring-blue-500' : ''}
                      `}
                      style={{ backgroundColor: getSpectrumColor(party.left_right_score) }}
                    />
                    {(selectedPartyId === party.id || activeParties.length <= 10) && (
                      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-gray-700 max-w-[80px] truncate">
                        {party.name_short || party.name.slice(0, 10)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Party Families Summary */}
          {Object.keys(familyGroups).length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-3">Party Families in {year}</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(familyGroups).map(([family, parties]) => (
                  <div key={family} className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm">
                    <span className="font-medium">{family}</span>
                    <span className="text-gray-500 ml-1">({parties.length})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parties List */}
          <div className="grid gap-2">
            {sortedParties.map((party) => (
              <PartyCard
                key={party.id}
                party={party}
                isSelected={selectedPartyId === party.id}
                isActive={activePartyIds.has(party.id)}
                onClick={() => handleSelectParty(party.id)}
              />
            ))}
          </div>

          {/* Party Detail */}
          {partyDetail && (
            <div className="bg-white rounded-lg border p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{partyDetail.name}</h3>
                {partyDetail.name_english && partyDetail.name_english !== partyDetail.name && (
                  <p className="text-sm text-gray-500">{partyDetail.name_english}</p>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {partyDetail.founded && (
                    <span>Founded: {new Date(partyDetail.founded).getFullYear()}</span>
                  )}
                  {partyDetail.dissolved && (
                    <span className="ml-2">Dissolved: {new Date(partyDetail.dissolved).getFullYear()}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {partyDetail.ideologies?.map((ideology) => (
                  <span
                    key={ideology.id}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: ideology.color ? `${ideology.color}20` : '#f3f4f6',
                      color: ideology.color || '#4b5563',
                    }}
                  >
                    {ideology.name}
                  </span>
                ))}
              </div>

              {partyDetail.description && (
                <p className="text-sm text-gray-600">{partyDetail.description}</p>
              )}

              {partyDetail.progressive_analysis && (
                <div className="bg-red-50 rounded p-3">
                  <h5 className="text-xs font-medium text-red-800 mb-1">Progressive Analysis</h5>
                  <p className="text-sm text-red-700">{partyDetail.progressive_analysis}</p>
                </div>
              )}

              {historyData.length > 1 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Election History</h5>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => v != null ? [`${Number(v).toFixed(1)}%`] : ['-']} />
                      <Line
                        type="monotone"
                        dataKey="votes"
                        stroke={getSpectrumColor(partyDetail.left_right_score)}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Vote Share"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
})

export default PartiesTab

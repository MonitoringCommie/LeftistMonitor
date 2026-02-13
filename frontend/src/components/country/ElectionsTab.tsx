import { useState, useMemo } from 'react'
import { useElections, useElection, useVotingTrends } from '../../api/politics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts'
import ParliamentHemicycle from './ParliamentHemicycle'

interface ElectionsTabProps {
  countryId: string
  year: number
}

const PARTY_COLORS: Record<string, string> = {
  'Communist/Socialist': '#b91c1c',
  'Social democracy': '#dc2626',
  'Green/Ecologist': '#16a34a',
  'Liberal': '#f59e0b',
  'Christian democracy': '#3b82f6',
  'Conservative': '#1e40af',
  'Right-wing': '#1e3a8a',
  'Agrarian': '#65a30d',
  'Special issue': '#8b5cf6',
  'no family': '#6b7280',
}

const FALLBACK_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'
]

function getPartyColor(family: string | undefined, index: number): string {
  if (family && PARTY_COLORS[family]) {
    return PARTY_COLORS[family]
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

export default function ElectionsTab({ countryId, year }: ElectionsTabProps) {
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null)
  const [showTrends, setShowTrends] = useState(false)
  const { data: electionsData, isLoading: loadingElections } = useElections(countryId)
  const { data: electionDetail } = useElection(selectedElectionId || '')

  const elections = useMemo(() => {
    const items = electionsData?.items || []
    return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [electionsData])

  const closestElection = elections.reduce((closest, election) => {
    const electionYear = new Date(election.date).getFullYear()
    const closestYear = closest ? new Date(closest.date).getFullYear() : Infinity
    return Math.abs(electionYear - year) < Math.abs(closestYear - year) ? election : closest
  }, elections[0])

  if (closestElection && !selectedElectionId) {
    setSelectedElectionId(closestElection.id)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const hemicycleData = electionDetail?.results
    .filter(r => (r.seats ?? 0) > 0)
    .map((result, index) => ({
      name: result.party_name,
      shortName: result.party_short || result.party_name.slice(0, 10),
      seats: result.seats || 0,
      color: getPartyColor(result.party_family, index),
      leftRight: result.left_right,
    })) || []

  const chartData = electionDetail?.results
    .filter(r => (r.vote_share ?? 0) > 2)
    .map((result, index) => ({
      name: result.party_short || result.party_name.slice(0, 15),
      fullName: result.party_name,
      votes: result.vote_share || 0,
      seats: result.seat_share || 0,
      color: getPartyColor(result.party_family, index),
    })) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
          {elections.map((election) => (
            <button
              key={election.id}
              onClick={() => { setSelectedElectionId(election.id); setShowTrends(false); }}
              className="px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors font-medium"
              style={
                selectedElectionId === election.id && !showTrends
                  ? { background: '#C41E3A', color: '#FFFFFF' }
                  : { background: 'rgba(196, 30, 58, 0.08)', color: '#5C3D2E', border: '1px solid #E8C8C8' }
              }
            >
              {new Date(election.date).getFullYear()} {election.election_type}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowTrends(!showTrends)}
          className="ml-2 px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors font-medium"
          style={
            showTrends
              ? { background: '#D4A017', color: '#FFFFFF' }
              : { background: 'rgba(196, 30, 58, 0.08)', color: '#5C3D2E', border: '1px solid #E8C8C8' }
          }
        >
          {showTrends ? 'Hide Trends' : 'Show Trends'}
        </button>
      </div>

      {loadingElections ? (
        <div className="text-center py-8" style={{ color: '#8B7355' }}>Loading elections...</div>
      ) : elections.length === 0 ? (
        <div className="text-center py-8" style={{ color: '#8B7355' }}>No election data available.</div>
      ) : showTrends ? (
        <VotingTrends countryId={countryId} />
      ) : electionDetail ? (
        <>
          <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
            <h3 className="font-semibold" style={{ color: '#8B1A1A' }}>{electionDetail.election_type} Election</h3>
            <p className="text-sm" style={{ color: '#8B7355' }}>{formatDate(electionDetail.date)}</p>
            <div className="flex gap-6 mt-2 text-sm">
              {electionDetail.turnout_percent && (
                <div>
                  <span style={{ color: '#8B7355' }}>Turnout:</span>
                  <span className="ml-1 font-medium" style={{ color: '#2C1810' }}>{electionDetail.turnout_percent.toFixed(1)}%</span>
                </div>
              )}
              {electionDetail.total_votes && (
                <div>
                  <span style={{ color: '#8B7355' }}>Total Votes:</span>
                  <span className="ml-1 font-medium" style={{ color: '#2C1810' }}>{electionDetail.total_votes.toLocaleString()}</span>
                </div>
              )}
              {electionDetail.total_seats && (
                <div>
                  <span style={{ color: '#8B7355' }}>Seats:</span>
                  <span className="ml-1 font-medium" style={{ color: '#2C1810' }}>{electionDetail.total_seats}</span>
                </div>
              )}
            </div>
          </div>

          {hemicycleData.length > 0 && (
            <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
              <h4 className="text-sm font-medium mb-3 text-center" style={{ color: '#8B1A1A' }}>Parliament Composition</h4>
              <ParliamentHemicycle
                parties={hemicycleData}
                totalSeats={electionDetail.total_seats || 0}
              />
            </div>
          )}

          {chartData.length > 0 && (
            <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
              <h4 className="text-sm font-medium mb-3" style={{ color: '#8B1A1A' }}>Vote Share (%)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Vote Share']}
                    labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '8px', color: '#2C1810' }}
                  />
                  <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
                  <th className="text-left px-3 py-2 font-medium" style={{ color: '#8B1A1A' }}>Party</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: '#8B1A1A' }}>Votes</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: '#8B1A1A' }}>%</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ color: '#8B1A1A' }}>Seats</th>
                </tr>
              </thead>
              <tbody>
                {electionDetail.results.map((result, index) => (
                  <tr key={result.id} style={{ borderTop: '1px solid #E8C8C8' }}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getPartyColor(result.party_family, index) }}
                        />
                        <span className="truncate max-w-[150px]" style={{ color: '#2C1810' }}>{result.party_name}</span>
                      </div>
                    </td>
                    <td className="text-right px-3 py-2" style={{ color: '#5C3D2E' }}>{result.votes?.toLocaleString() || '-'}</td>
                    <td className="text-right px-3 py-2" style={{ color: '#5C3D2E' }}>{result.vote_share?.toFixed(1) || '-'}%</td>
                    <td className="text-right px-3 py-2" style={{ color: '#5C3D2E' }}>{result.seats || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  )
}

// Voting Trends Component with Line Chart
function VotingTrends({ countryId }: { countryId: string }) {
  const { data: trends, isLoading } = useVotingTrends(countryId)

  // Transform data for recharts line chart
  const { chartData, topParties } = useMemo(() => {
    if (!trends || trends.length === 0) return { chartData: [], topParties: [] }

    // Find parties that appear most frequently and have high vote shares
    const partyScores: Record<string, { count: number; totalVotes: number; name: string; short?: string; family?: string }> = {}

    trends.forEach(election => {
      election.parties.forEach(party => {
        const id = party.party_id
        if (!partyScores[id]) {
          partyScores[id] = { count: 0, totalVotes: 0, name: party.party_name, short: party.party_short, family: party.party_family }
        }
        partyScores[id].count++
        partyScores[id].totalVotes += party.vote_share
      })
    })

    // Get top 6 parties by average vote share
    const sortedParties = Object.entries(partyScores)
      .map(([id, data]) => ({ id, avgVote: data.totalVotes / data.count, ...data }))
      .sort((a, b) => b.avgVote - a.avgVote)
      .slice(0, 6)

    const topPartyIds = new Set(sortedParties.map(p => p.id))

    // Build chart data
    const data = trends.map(election => {
      const point: Record<string, number | string> = { year: election.year }
      election.parties.forEach(party => {
        if (topPartyIds.has(party.party_id)) {
          point[party.party_id] = party.vote_share
        }
      })
      return point
    })

    return {
      chartData: data,
      topParties: sortedParties.map((p, i) => ({
        id: p.id,
        name: p.short || p.name.slice(0, 12),
        fullName: p.name,
        color: getPartyColor(p.family, i),
      }))
    }
  }, [trends])

  if (isLoading) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', color: '#8B7355' }}>
        Loading voting trends...
      </div>
    )
  }

  if (!trends || trends.length < 2) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', color: '#8B7355' }}>
        Not enough election data for trends. Need at least 2 elections.
      </div>
    )
  }

  return (
    <div className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}>
      <h4 className="text-sm font-medium mb-4" style={{ color: '#8B1A1A' }}>Voting Trends Over Time</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="year" stroke="#8B7355" />
          <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 'auto']} stroke="#8B7355" />
          <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, '']}
            labelFormatter={(label) => `Election: ${label}`}
            contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '8px', color: '#2C1810' }}
          />
          <Legend
            formatter={(value) => {
              const party = topParties.find(p => p.id === value)
              return party?.name || value
            }}
          />
          {topParties.map((party) => (
            <Line
              key={party.id}
              type="monotone"
              dataKey={party.id}
              name={party.id}
              stroke={party.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend with full party names */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {topParties.map((party) => (
          <div key={party.id} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: party.color }}
            />
            <span style={{ color: '#5C3D2E' }}>{party.fullName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

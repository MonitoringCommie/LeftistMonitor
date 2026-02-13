import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'

interface Election {
  id: string
  country_id: string
  date: string
  election_type: string
  turnout_percent: number | null
  total_votes: number | null
  total_seats: number | null
}

interface PoliticalParty {
  id: string
  name: string
  name_english: string | null
  name_short: string | null
  country_id: string
  founded: string | null
  dissolved: string | null
  left_right_score: number | null
  party_family: string | null
}

interface CountryOption {
  id: string
  name_en: string
}

const PER_PAGE = 50

export default function ElectionsPage() {
  const [activeTab, setActiveTab] = useState<'elections' | 'parties'>('elections')
  const [searchTerm, setSearchTerm] = useState('')

  // Election filters
  const [electionCountryFilter, setElectionCountryFilter] = useState('')
  const [electionTypeFilter, setElectionTypeFilter] = useState('')
  const [electionSortBy, setElectionSortBy] = useState<'date' | 'turnout'>('date')
  const [electionSortDir, setElectionSortDir] = useState<'asc' | 'desc'>('desc')
  const [electionPage, setElectionPage] = useState(1)

  // Party filters
  const [partyPage, setPartyPage] = useState(1)

  // Fetch countries for name resolution
  const { data: countriesData } = useQuery({
    queryKey: ['countries-for-elections'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: CountryOption[] }>('/geography/countries', {
        params: { per_page: 1000 }
      })
      return data.items
    },
  })

  const countryMap = useMemo(() => {
    if (!countriesData) return {} as Record<string, string>
    const map: Record<string, string> = {}
    // Deduplicate by picking first occurrence per name
    const seenNames = new Set<string>()
    for (const c of countriesData) {
      if (!seenNames.has(c.name_en)) {
        seenNames.add(c.name_en)
        map[c.id] = c.name_en
      } else {
        // Still map the id so we can resolve it
        map[c.id] = c.name_en
      }
    }
    return map
  }, [countriesData])

  // Unique country names for filter dropdown
  const countryOptions = useMemo(() => {
    if (!countriesData) return []
    const seen = new Set<string>()
    return countriesData.filter(c => {
      if (seen.has(c.name_en)) return false
      seen.add(c.name_en)
      return true
    }).sort((a, b) => a.name_en.localeCompare(b.name_en))
  }, [countriesData])

  // Fetch elections
  const { data: electionsData, isLoading: loadingElections } = useQuery({
    queryKey: ['elections-page'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: Election[] }>('/politics/elections', {
        params: { per_page: 2000 }
      })
      return data.items || []
    },
  })

  // Fetch parties
  const { data: partiesData, isLoading: loadingParties } = useQuery({
    queryKey: ['parties-page'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: PoliticalParty[] }>('/politics/parties', {
        params: { per_page: 2000 }
      })
      return data.items || []
    },
  })

  // Election types for filter
  const electionTypes = useMemo(() => {
    if (!electionsData) return []
    const types = new Set(electionsData.map(e => e.election_type))
    return Array.from(types).sort()
  }, [electionsData])

  // Filtered + sorted elections
  const filteredElections = useMemo(() => {
    if (!electionsData) return []
    let filtered = electionsData

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      filtered = filtered.filter(e =>
        e.date?.toLowerCase().includes(lower) ||
        e.election_type?.toLowerCase().includes(lower) ||
        (countryMap[e.country_id] || '').toLowerCase().includes(lower)
      )
    }

    if (electionCountryFilter) {
      filtered = filtered.filter(e => e.country_id === electionCountryFilter)
    }

    if (electionTypeFilter) {
      filtered = filtered.filter(e => e.election_type === electionTypeFilter)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (electionSortBy === 'date') {
        const cmp = a.date.localeCompare(b.date)
        return electionSortDir === 'desc' ? -cmp : cmp
      } else {
        const aT = a.turnout_percent ?? 0
        const bT = b.turnout_percent ?? 0
        return electionSortDir === 'desc' ? bT - aT : aT - bT
      }
    })

    return filtered
  }, [electionsData, searchTerm, electionCountryFilter, electionTypeFilter, electionSortBy, electionSortDir, countryMap])

  // Paginated elections
  const paginatedElections = useMemo(() => {
    const start = (electionPage - 1) * PER_PAGE
    return filteredElections.slice(start, start + PER_PAGE)
  }, [filteredElections, electionPage])

  const totalElectionPages = Math.ceil(filteredElections.length / PER_PAGE)

  // Filtered parties
  const filteredParties = useMemo(() => {
    if (!partiesData) return []
    if (!searchTerm) return partiesData
    const lower = searchTerm.toLowerCase()
    return partiesData.filter(p =>
      p.name?.toLowerCase().includes(lower) ||
      p.name_english?.toLowerCase().includes(lower) ||
      p.party_family?.toLowerCase().includes(lower) ||
      (countryMap[p.country_id] || '').toLowerCase().includes(lower)
    )
  }, [partiesData, searchTerm, countryMap])

  // Paginated parties
  const paginatedParties = useMemo(() => {
    const start = (partyPage - 1) * PER_PAGE
    return filteredParties.slice(start, start + PER_PAGE)
  }, [filteredParties, partyPage])

  const totalPartyPages = Math.ceil(filteredParties.length / PER_PAGE)

  const loading = activeTab === 'elections' ? loadingElections : loadingParties

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setElectionPage(1)
    setPartyPage(1)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F6' }}>
      <header style={{ borderBottom: '1px solid #E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#8B7355' }}>
            <Link to="/" className="hover:opacity-80" style={{ color: '#C41E3A' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#2C1810' }}>Elections</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Elections & Political Parties
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            Global electoral history, voting patterns, and political parties from around the world.
          </p>
        </div>
      </header>

      <nav style={{ borderBottom: '1px solid #E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <button
                onClick={() => { setActiveTab('elections'); setElectionPage(1); }}
                className="py-4 text-sm font-medium transition-colors"
                style={
                  activeTab === 'elections'
                    ? { borderBottom: '2px solid #D4A017', color: '#C41E3A' }
                    : { borderBottom: '2px solid transparent', color: '#8B7355' }
                }
              >
                Elections ({filteredElections.length})
              </button>
              <button
                onClick={() => { setActiveTab('parties'); setPartyPage(1); }}
                className="py-4 text-sm font-medium transition-colors"
                style={
                  activeTab === 'parties'
                    ? { borderBottom: '2px solid #D4A017', color: '#C41E3A' }
                    : { borderBottom: '2px solid transparent', color: '#8B7355' }
                }
              >
                Political Parties ({filteredParties.length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="px-4 py-2 text-sm rounded-lg focus:outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(196, 30, 58, 0.4)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {activeTab === 'elections' && (
              <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-end mb-6">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</label>
                    <select
                      value={electionCountryFilter}
                      onChange={(e) => { setElectionCountryFilter(e.target.value); setElectionPage(1); }}
                      className="px-3 py-2 text-sm rounded-lg focus:outline-none"
                      style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810', minWidth: '180px' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                    >
                      <option value="">All Countries</option>
                      {countryOptions.map(c => (
                        <option key={c.id} value={c.id}>{c.name_en}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                    <select
                      value={electionTypeFilter}
                      onChange={(e) => { setElectionTypeFilter(e.target.value); setElectionPage(1); }}
                      className="px-3 py-2 text-sm rounded-lg focus:outline-none"
                      style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810', minWidth: '140px' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                    >
                      <option value="">All Types</option>
                      {electionTypes.map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sort By</label>
                    <select
                      value={electionSortBy}
                      onChange={(e) => setElectionSortBy(e.target.value as 'date' | 'turnout')}
                      className="px-3 py-2 text-sm rounded-lg focus:outline-none"
                      style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810', minWidth: '120px' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
                    >
                      <option value="date">Date</option>
                      <option value="turnout">Turnout</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setElectionSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 text-sm rounded-lg font-medium transition-colors"
                    style={{ background: 'rgba(196, 30, 58, 0.08)', border: '1px solid #E8C8C8', color: '#5C3D2E' }}
                  >
                    {electionSortDir === 'desc' ? 'Newest First' : 'Oldest First'}
                  </button>

                  <div className="ml-auto text-sm" style={{ color: '#8B7355' }}>
                    {filteredElections.length} results
                  </div>
                </div>

                {filteredElections.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>No elections found.</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedElections.map((election) => (
                        <div
                          key={election.id}
                          className="p-4 rounded-lg hover:opacity-90 transition-opacity"
                          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium" style={{ color: '#8B1A1A' }}>
                                {countryMap[election.country_id] || 'Unknown Country'}
                              </h3>
                              <p className="text-sm" style={{ color: '#5C3D2E' }}>
                                {formatDate(election.date)} — {election.election_type.replace(/_/g, ' ')}
                                {election.total_seats ? ` (${election.total_seats} seats)` : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              {election.turnout_percent != null && (
                                <p className="text-sm font-medium" style={{ color: '#C41E3A' }}>
                                  {election.turnout_percent.toFixed(1)}% turnout
                                </p>
                              )}
                            </div>
                          </div>
                          {election.total_votes != null && (
                            <p className="mt-2 text-sm" style={{ color: '#8B7355' }}>
                              Total votes: {election.total_votes.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalElectionPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                          onClick={() => setElectionPage(p => Math.max(1, p - 1))}
                          disabled={electionPage === 1}
                          className="px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40"
                          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#C41E3A' }}
                        >
                          Previous
                        </button>
                        <span className="text-sm" style={{ color: '#5C3D2E' }}>
                          Page {electionPage} of {totalElectionPages}
                        </span>
                        <button
                          onClick={() => setElectionPage(p => Math.min(totalElectionPages, p + 1))}
                          disabled={electionPage === totalElectionPages}
                          className="px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40"
                          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#C41E3A' }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'parties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#8B1A1A' }}>Political Parties</h2>
                  <span className="text-sm" style={{ color: '#8B7355' }}>{filteredParties.length} results</span>
                </div>
                {filteredParties.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>No parties found.</p>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedParties.map((party) => (
                        <div
                          key={party.id}
                          className="p-4 rounded-lg hover:opacity-90 transition-opacity"
                          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}
                        >
                          <p className="text-xs font-medium mb-1" style={{ color: '#C41E3A' }}>
                            {countryMap[party.country_id] || 'Unknown Country'}
                          </p>
                          <h3 className="font-medium" style={{ color: '#2C1810' }}>
                            {party.name_english || party.name}
                          </h3>
                          {party.name_english && party.name !== party.name_english && (
                            <p className="text-xs" style={{ color: '#8B7355' }}>{party.name}</p>
                          )}
                          {party.name_short && (
                            <span className="text-xs" style={{ color: '#5C3D2E' }}> ({party.name_short})</span>
                          )}
                          {party.party_family && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
                              {party.party_family}
                            </span>
                          )}
                          {party.left_right_score != null && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: '#8B7355' }}>L-R:</span>
                                <div className="flex-1 h-2 rounded-full relative" style={{ background: '#E8C8C8' }}>
                                  <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                                    style={{
                                      background: '#C41E3A',
                                      left: `${Math.min(100, Math.max(0, (party.left_right_score / 10) * 100))}%`,
                                      transform: 'translate(-50%, -50%)',
                                      border: '2px solid #FFFFFF',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                    }}
                                  />
                                </div>
                                <span className="text-xs" style={{ color: '#5C3D2E' }}>{party.left_right_score.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                          {party.founded && (
                            <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Founded: {party.founded}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPartyPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                          onClick={() => setPartyPage(p => Math.max(1, p - 1))}
                          disabled={partyPage === 1}
                          className="px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40"
                          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#C41E3A' }}
                        >
                          Previous
                        </button>
                        <span className="text-sm" style={{ color: '#5C3D2E' }}>
                          Page {partyPage} of {totalPartyPages}
                        </span>
                        <button
                          onClick={() => setPartyPage(p => Math.min(totalPartyPages, p + 1))}
                          disabled={partyPage === totalPartyPages}
                          className="px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40"
                          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#C41E3A' }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

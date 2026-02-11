import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

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
  founded: number | null
  dissolved: number | null
  left_right_score: number | null
  party_family: string | null
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [parties, setParties] = useState<PoliticalParty[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'elections' | 'parties'>('elections')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const electionsRes = await fetch('/api/v1/politics/elections?limit=100')
        if (electionsRes.ok) {
          const data = await electionsRes.json()
          setElections(data.items || data || [])
        }
        const partiesRes = await fetch('/api/v1/politics/parties?limit=100')
        if (partiesRes.ok) {
          const data = await partiesRes.json()
          setParties(data.items || data || [])
        }
      } catch (error) {
        console.error('Failed to fetch:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredElections = elections.filter(e =>
    e.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.election_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredParties = parties.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name_english?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.party_family?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                onClick={() => setActiveTab('elections')}
                className={`py-4 text-sm font-medium transition-colors ${
                  activeTab === 'elections'
                    ? ''
                    : ''
                }`}
                style={
                  activeTab === 'elections'
                    ? { borderBottom: '2px solid #D4A017', color: '#C41E3A' }
                    : { borderBottom: '2px solid transparent', color: '#8B7355' }
                }
              >
                Elections ({elections.length})
              </button>
              <button
                onClick={() => setActiveTab('parties')}
                className={`py-4 text-sm font-medium transition-colors ${
                  activeTab === 'parties'
                    ? ''
                    : ''
                }`}
                style={
                  activeTab === 'parties'
                    ? { borderBottom: '2px solid #D4A017', color: '#C41E3A' }
                    : { borderBottom: '2px solid transparent', color: '#8B7355' }
                }
              >
                Political Parties ({parties.length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#8B1A1A' }}>Elections</h2>
                  <span className="text-sm" style={{ color: '#8B7355' }}>{filteredElections.length} results</span>
                </div>
                {filteredElections.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>No elections found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredElections.map((election) => (
                      <div
                        key={election.id}
                        className="p-4 rounded-lg hover:opacity-90 transition-opacity"
                        style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium" style={{ color: '#2C1810' }}>
                              {election.date} {election.election_type.replace('_', ' ')}
                            </h3>
                            <p className="text-sm" style={{ color: '#5C3D2E' }}>
                              {election.election_type.replace('_', ' ')} election
                              {election.total_seats ? ` (${election.total_seats} seats)` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-1 text-xs rounded" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
                              {election.election_type.replace('_', ' ')}
                            </span>
                            {election.turnout_percent != null && (
                              <p className="text-sm mt-1" style={{ color: '#8B7355' }}>Turnout: {election.turnout_percent.toFixed(1)}%</p>
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredParties.map((party) => (
                      <div
                        key={party.id}
                        className="p-4 rounded-lg hover:opacity-90 transition-opacity"
                        style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}
                      >
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
                          <p className="text-xs mt-1" style={{ color: '#8B7355' }}>
                            Left-Right: {party.left_right_score.toFixed(1)}
                          </p>
                        )}
                        {party.founded && (
                          <p className="text-xs mt-1" style={{ color: '#8B7355' }}>Founded: {party.founded}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

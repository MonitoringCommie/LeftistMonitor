import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Election {
  id: string
  name: string
  country: string
  country_id: string
  date: string
  election_type: string
  winner: string | null
  turnout: number | null
}

interface PoliticalParty {
  id: string
  name: string
  country: string
  ideology: string
  founded: number | null
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
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.country?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredParties = parties.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.country?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100">Elections</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Elections & Political Parties
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
            Global electoral history, voting patterns, and political parties from around the world.
          </p>
        </div>
      </header>

      <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('elections')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'elections'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Elections ({elections.length})
              </button>
              <button
                onClick={() => setActiveTab('parties')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'parties'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Political Parties ({parties.length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'elections' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Elections</h2>
                  <span className="text-sm text-neutral-500">{filteredElections.length} results</span>
                </div>
                {filteredElections.length === 0 ? (
                  <p className="text-neutral-500 py-8 text-center">No elections found.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredElections.map((election) => (
                      <div
                        key={election.id}
                        className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{election.name}</h3>
                            <p className="text-sm text-neutral-500">
                              {election.country} - {election.election_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-neutral-400">{election.date}</span>
                            {election.turnout && (
                              <p className="text-sm text-neutral-500">Turnout: {election.turnout}%</p>
                            )}
                          </div>
                        </div>
                        {election.winner && (
                          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            Winner: {election.winner}
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
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Political Parties</h2>
                  <span className="text-sm text-neutral-500">{filteredParties.length} results</span>
                </div>
                {filteredParties.length === 0 ? (
                  <p className="text-neutral-500 py-8 text-center">No parties found.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredParties.map((party) => (
                      <div
                        key={party.id}
                        className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
                      >
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{party.name}</h3>
                        <p className="text-sm text-neutral-500">{party.country}</p>
                        {party.ideology && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {party.ideology}
                          </span>
                        )}
                        {party.founded && (
                          <p className="text-xs text-neutral-400 mt-1">Founded: {party.founded}</p>
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

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface MovementEvent {
  id: string
  name: string
  date: string
  location: string
  description: string
}

interface MovementFigure {
  id: string
  name: string
  birth_year: number | null
  death_year: number | null
  description: string
}

interface MovementBook {
  id: string
  title: string
  author: string
  year: number | null
  description: string
}

export default function LaborMovementsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books'>('overview')
  const [events, setEvents] = useState<MovementEvent[]>([])
  const [figures, setFigures] = useState<MovementFigure[]>([])
  const [books, setBooks] = useState<MovementBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const peopleRes = await fetch('/api/v1/people/?search=labor+union&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }
        const booksRes = await fetch('/api/v1/books/?search=labor+workers&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }
        const eventsRes = await fetch('/api/v1/events/?search=strike+labor&limit=50')
        if (eventsRes.ok) {
          const data = await eventsRes.json()
          setEvents(data.items || [])
        }
      } catch (error) {
        console.error('Failed to fetch:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Strikes & Actions' },
    { id: 'figures', label: 'Union Leaders' },
    { id: 'books', label: 'Essential Reading' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F6' }}>
      <header className="border-b" style={{ borderColor: '#E8C8C8', backgroundColor: '#FFF5F6' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#8B7355' }}>
            <Link to="/" className="hover:text-red-700 transition-colors">Home</Link>
            <span>/</span>
            <span>Movements</span>
            <span>/</span>
            <span style={{ color: '#2C1810' }}>Labor</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Labor & Union Movements
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            The history of worker organizing, unions, strikes, and the fight for
            fair wages, safe conditions, and dignity in the workplace.
          </p>
        </div>
      </header>

      <nav className="border-b" style={{ borderColor: '#E8C8C8', backgroundColor: '#FFF5F6' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="py-4 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === tab.id ? '#D4A017' : 'transparent',
                  color: activeTab === tab.id ? '#C41E3A' : '#8B7355'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(196, 30, 58, 0.6)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    History of Worker Organizing
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div
                      className="p-6 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Early Labor Movement</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        From the Luddites to the First International. The formation of trade unions,
                        the fight for the 8-hour day, and the Haymarket affair.
                      </p>
                    </div>
                    <div
                      className="p-6 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Industrial Unionism</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        The IWW (Wobblies), CIO organizing drives, the sit-down strikes,
                        and the peak of union density in the mid-20th century.
                      </p>
                    </div>
                    <div
                      className="p-6 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Modern Labor</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Gig economy organizing, teacher strikes, Amazon union drives,
                        and the fight against neoliberal attacks on workers.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Themes & Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Collective Bargaining', 'Living Wage', 'Workplace Safety', 'Strike Actions',
                      'Union Busting', 'Solidarity', 'General Strike', 'Worker Cooperatives',
                      'Gig Economy', 'Right to Organize', 'May Day', 'Industrial Democracy'].map((theme) => (
                      <span
                        key={theme}
                        className="px-3 py-1 text-sm rounded-full"
                        style={{
                          background: 'rgba(196, 30, 58, 0.1)',
                          color: '#C41E3A'
                        }}
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B1A1A' }}>Strikes & Actions</h2>
                {events.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>Loading events...</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Link
                        key={event.id}
                        to={`/event/${event.id}`}
                        className="block p-4 rounded-lg transition-all"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E8C8C8',
                          borderLeft: '4px solid #C41E3A',
                          borderRadius: '10px'
                        }}
                      >
                        <h3 className="font-medium" style={{ color: '#2C1810' }}>{event.name}</h3>
                        <p className="text-sm" style={{ color: '#8B7355' }}>{event.location} - {event.date}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'figures' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B1A1A' }}>Union Leaders & Organizers</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {figures.map((person) => (
                    <Link
                      key={person.id}
                      to={`/person/${person.id}`}
                      className="p-4 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-medium" style={{ color: '#2C1810' }}>{person.name}</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        {person.birth_year}{person.death_year ? ` - ${person.death_year}` : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'books' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B1A1A' }}>Essential Reading</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {books.map((book) => (
                    <Link
                      key={book.id}
                      to={`/book/${book.id}`}
                      className="p-4 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-medium" style={{ color: '#2C1810' }}>{book.title}</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>{book.author}{book.year ? ` (${book.year})` : ''}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

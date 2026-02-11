import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface MovementEvent {
  id: string
  name: string
  date: string
  location: string
  description: string
  category: string
}

interface MovementFigure {
  id: string
  name: string
  birth_year: number | null
  death_year: number | null
  description: string
  nationality: string
}

interface MovementBook {
  id: string
  title: string
  author: string
  year: number | null
  description: string
}

export default function FeministMovementsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books'>('overview')
  const [events, setEvents] = useState<MovementEvent[]>([])
  const [figures, setFigures] = useState<MovementFigure[]>([])
  const [books, setBooks] = useState<MovementBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch feminist-related people
        const peopleRes = await fetch('/api/v1/people/?search=feminist&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }

        // Fetch feminist-related books
        const booksRes = await fetch('/api/v1/books/?search=feminism&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }

        // Fetch feminist-related events
        const eventsRes = await fetch('/api/v1/events/?search=suffrage&limit=50')
        if (eventsRes.ok) {
          const data = await eventsRes.json()
          setEvents(data.items || [])
        }
      } catch (error) {
        console.error('Failed to fetch movement data:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Key Events' },
    { id: 'figures', label: 'Notable Figures' },
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
            <span style={{ color: '#2C1810' }}>Feminist Movements</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Feminist Movements
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            The history of women's liberation, suffrage movements, reproductive rights,
            and the ongoing struggle for gender equality worldwide.
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
                    Historical Waves of Feminism
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>First Wave (1848-1920)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Focus on legal rights, especially women's suffrage. Key events include the Seneca Falls Convention
                        and the passage of the 19th Amendment in the US.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Second Wave (1960s-1980s)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Expanded focus to workplace equality, reproductive rights, and sexuality.
                        Connected to civil rights and anti-war movements.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Third/Fourth Wave (1990s-Present)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Intersectionality, global feminism, digital activism, #MeToo movement,
                        and continued fight for reproductive justice.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Themes & Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Suffrage', 'Reproductive Rights', 'Equal Pay', 'Workplace Discrimination',
                      'Sexual Harassment', 'Intersectionality', 'LGBTQ+ Rights', 'Maternal Health',
                      'Education Access', 'Political Representation', 'Violence Against Women', 'Body Autonomy'].map((theme) => (
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#8B1A1A' }}>Key Events</h2>
                  <span className="text-sm" style={{ color: '#8B7355' }}>{events.length} events</span>
                </div>
                {events.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>Loading events data...</p>
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium" style={{ color: '#2C1810' }}>{event.name}</h3>
                            <p className="text-sm" style={{ color: '#8B7355' }}>{event.location}</p>
                          </div>
                          <span className="text-sm" style={{ color: '#8B7355' }}>{event.date}</span>
                        </div>
                        {event.description && (
                          <p className="mt-2 text-sm line-clamp-2" style={{ color: '#5C3D2E' }}>{event.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'figures' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#8B1A1A' }}>Notable Figures</h2>
                  <span className="text-sm" style={{ color: '#8B7355' }}>{figures.length} people</span>
                </div>
                {figures.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>Loading figures data...</p>
                ) : (
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
                          {person.birth_year && person.death_year
                            ? `${person.birth_year} - ${person.death_year}`
                            : person.birth_year
                              ? `b. ${person.birth_year}`
                              : ''}
                        </p>
                        {person.description && (
                          <p className="mt-2 text-sm line-clamp-2" style={{ color: '#5C3D2E' }}>{person.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'books' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#8B1A1A' }}>Essential Reading</h2>
                  <span className="text-sm" style={{ color: '#8B7355' }}>{books.length} books</span>
                </div>
                {books.length === 0 ? (
                  <p className="py-8 text-center" style={{ color: '#8B7355' }}>Loading books data...</p>
                ) : (
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
                        <p className="text-sm" style={{ color: '#8B7355' }}>
                          {book.author}{book.year ? ` (${book.year})` : ''}
                        </p>
                        {book.description && (
                          <p className="mt-2 text-sm line-clamp-2" style={{ color: '#5C3D2E' }}>{book.description}</p>
                        )}
                      </Link>
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

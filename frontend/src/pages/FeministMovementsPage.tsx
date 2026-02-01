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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">Home</Link>
            <span>/</span>
            <span>Movements</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100">Feminist Movements</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Feminist Movements
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
            The history of women's liberation, suffrage movements, reproductive rights, 
            and the ongoing struggle for gender equality worldwide.
          </p>
        </div>
      </header>

      <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-fuchsia-600 text-fuchsia-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
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
            <div className="w-8 h-8 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Historical Waves of Feminism
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">First Wave (1848-1920)</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Focus on legal rights, especially women's suffrage. Key events include the Seneca Falls Convention 
                        and the passage of the 19th Amendment in the US.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Second Wave (1960s-1980s)</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Expanded focus to workplace equality, reproductive rights, and sexuality. 
                        Connected to civil rights and anti-war movements.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Third/Fourth Wave (1990s-Present)</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Intersectionality, global feminism, digital activism, #MeToo movement, 
                        and continued fight for reproductive justice.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Key Themes & Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Suffrage', 'Reproductive Rights', 'Equal Pay', 'Workplace Discrimination', 
                      'Sexual Harassment', 'Intersectionality', 'LGBTQ+ Rights', 'Maternal Health',
                      'Education Access', 'Political Representation', 'Violence Against Women', 'Body Autonomy'].map((theme) => (
                      <span key={theme} className="px-3 py-1 text-sm bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 rounded-full">
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
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Key Events</h2>
                  <span className="text-sm text-neutral-500">{events.length} events</span>
                </div>
                {events.length === 0 ? (
                  <p className="text-neutral-500 py-8 text-center">Loading events data...</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Link 
                        key={event.id} 
                        to={`/event/${event.id}`}
                        className="block p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{event.name}</h3>
                            <p className="text-sm text-neutral-500">{event.location}</p>
                          </div>
                          <span className="text-sm text-neutral-400">{event.date}</span>
                        </div>
                        {event.description && (
                          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{event.description}</p>
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
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Notable Figures</h2>
                  <span className="text-sm text-neutral-500">{figures.length} people</span>
                </div>
                {figures.length === 0 ? (
                  <p className="text-neutral-500 py-8 text-center">Loading figures data...</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {figures.map((person) => (
                      <Link
                        key={person.id}
                        to={`/person/${person.id}`}
                        className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                      >
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{person.name}</h3>
                        <p className="text-sm text-neutral-500">
                          {person.birth_year && person.death_year 
                            ? `${person.birth_year} - ${person.death_year}`
                            : person.birth_year 
                              ? `b. ${person.birth_year}`
                              : ''}
                        </p>
                        {person.description && (
                          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{person.description}</p>
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
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Essential Reading</h2>
                  <span className="text-sm text-neutral-500">{books.length} books</span>
                </div>
                {books.length === 0 ? (
                  <p className="text-neutral-500 py-8 text-center">Loading books data...</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {books.map((book) => (
                      <Link
                        key={book.id}
                        to={`/book/${book.id}`}
                        className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                      >
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{book.title}</h3>
                        <p className="text-sm text-neutral-500">
                          {book.author}{book.year ? ` (${book.year})` : ''}
                        </p>
                        {book.description && (
                          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{book.description}</p>
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

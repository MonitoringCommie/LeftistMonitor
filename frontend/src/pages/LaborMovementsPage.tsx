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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">Home</Link>
            <span>/</span>
            <span>Movements</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100">Labor</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Labor & Union Movements
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
            The history of worker organizing, unions, strikes, and the fight for 
            fair wages, safe conditions, and dignity in the workplace.
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
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
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
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    History of Worker Organizing
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Early Labor Movement</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        From the Luddites to the First International. The formation of trade unions, 
                        the fight for the 8-hour day, and the Haymarket affair.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Industrial Unionism</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        The IWW (Wobblies), CIO organizing drives, the sit-down strikes, 
                        and the peak of union density in the mid-20th century.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Modern Labor</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Gig economy organizing, teacher strikes, Amazon union drives, 
                        and the fight against neoliberal attacks on workers.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Key Themes & Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Collective Bargaining', 'Living Wage', 'Workplace Safety', 'Strike Actions', 
                      'Union Busting', 'Solidarity', 'General Strike', 'Worker Cooperatives',
                      'Gig Economy', 'Right to Organize', 'May Day', 'Industrial Democracy'].map((theme) => (
                      <span key={theme} className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Strikes & Actions</h2>
                {events.length === 0 ? (
                  <p className="text-neutral-500 py-8 text-center">Loading events...</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Link key={event.id} to={`/event/${event.id}`}
                        className="block p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 transition-colors">
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{event.name}</h3>
                        <p className="text-sm text-neutral-500">{event.location} - {event.date}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'figures' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Union Leaders & Organizers</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {figures.map((person) => (
                    <Link key={person.id} to={`/person/${person.id}`}
                      className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 transition-colors">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{person.name}</h3>
                      <p className="text-sm text-neutral-500">
                        {person.birth_year}{person.death_year ? ` - ${person.death_year}` : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'books' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Essential Reading</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {books.map((book) => (
                    <Link key={book.id} to={`/book/${book.id}`}
                      className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 transition-colors">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{book.title}</h3>
                      <p className="text-sm text-neutral-500">{book.author}{book.year ? ` (${book.year})` : ''}</p>
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

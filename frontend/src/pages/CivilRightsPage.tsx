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

export default function CivilRightsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books'>('overview')
  const [events, setEvents] = useState<MovementEvent[]>([])
  const [figures, setFigures] = useState<MovementFigure[]>([])
  const [books, setBooks] = useState<MovementBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const peopleRes = await fetch('/api/v1/people/?search=civil+rights&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }
        const booksRes = await fetch('/api/v1/books/?search=racism+colonialism&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }
        const eventsRes = await fetch('/api/v1/events/?search=civil+rights&limit=50')
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
            <span className="text-neutral-900 dark:text-neutral-100">Civil Rights</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Civil Rights & Racial Justice
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
            The struggle against racism, colonialism, and systemic oppression. From anti-slavery movements 
            to modern racial justice activism worldwide.
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
                    ? 'border-emerald-600 text-emerald-600'
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
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Global Movements for Racial Justice
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Abolitionism & Anti-Slavery</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        The movement to end slavery, from the Haitian Revolution to the Underground Railroad 
                        and the global fight against human trafficking today.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Anti-Colonial Movements</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Independence movements across Africa, Asia, and the Caribbean. The fight against 
                        European imperialism and for self-determination.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Modern Civil Rights</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        From the US Civil Rights Movement to Black Lives Matter, the ongoing struggle 
                        against systemic racism and police violence.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Key Themes & Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Anti-Racism', 'Decolonization', 'Reparations', 'Police Brutality', 
                      'Mass Incarceration', 'Voting Rights', 'Pan-Africanism', 'Indigenous Rights',
                      'Immigration Justice', 'Anti-Apartheid', 'Black Power', 'Solidarity'].map((theme) => (
                      <span key={theme} className="px-3 py-1 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Key Events</h2>
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
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Notable Figures</h2>
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

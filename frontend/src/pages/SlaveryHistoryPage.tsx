import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface HistoryEvent {
  id: string
  name: string
  date: string
  location: string
  description: string
}

interface HistoryFigure {
  id: string
  name: string
  birth_year: number | null
  death_year: number | null
  description: string
}

interface HistoryBook {
  id: string
  title: string
  author: string
  year: number | null
  description: string
}

export default function SlaveryHistoryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books' | 'economics'>('overview')
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [figures, setFigures] = useState<HistoryFigure[]>([])
  const [books, setBooks] = useState<HistoryBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const peopleRes = await fetch('/api/v1/people/?search=abolitionist&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }
        const booksRes = await fetch('/api/v1/books/?search=slavery+abolition&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }
        const eventsRes = await fetch('/api/v1/events/?search=slavery+abolition&limit=50')
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
    { id: 'economics', label: 'Economic Impact' },
    { id: 'events', label: 'Key Events' },
    { id: 'figures', label: 'Abolitionists' },
    { id: 'books', label: 'Essential Reading' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">Home</Link>
            <span>/</span>
            <span>History</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-100">Slavery & Economics</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Slavery, Colonialism & Economics
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-3xl">
            The economic foundations of slavery, the transatlantic slave trade, colonial extraction, 
            and the lasting economic impact on global inequality.
          </p>
        </div>
      </header>

      <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-stone-600 text-stone-600 dark:text-stone-400'
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
            <div className="w-8 h-8 border-4 border-stone-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Historical Overview
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Transatlantic Slave Trade</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        12.5 million Africans forcibly transported to the Americas between 1500-1900. 
                        The foundation of colonial wealth extraction.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Colonial Extraction</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        European powers extracted vast wealth from colonies through forced labor, 
                        resource theft, and exploitative trade systems.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Abolition & Resistance</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        From the Haitian Revolution to the Underground Railroad, 
                        enslaved peoples and abolitionists fought for freedom.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Regions & Systems
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Caribbean Plantations', 'American South', 'Brazilian Sugar', 'African Kingdoms', 
                      'British Empire', 'French Colonies', 'Dutch Trade', 'Portuguese Empire',
                      'Arab Slave Trade', 'Indian Ocean Trade', 'Triangular Trade', 'Middle Passage'].map((theme) => (
                      <span key={theme} className="px-3 py-1 text-sm bg-stone-100 dark:bg-stone-900/30 text-stone-700 dark:text-stone-300 rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'economics' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Economic Impact of Slavery
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Wealth Accumulation</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Slavery generated enormous wealth for European and American elites. 
                        Cotton, sugar, tobacco, and other crops built the foundations of industrial capitalism.
                      </p>
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                        <li>British industrial revolution funded by slave trade profits</li>
                        <li>American banks, insurance companies built on slavery</li>
                        <li>European port cities enriched by slave commerce</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Lasting Inequality</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        The economic legacy of slavery continues today through racial wealth gaps, 
                        underdevelopment of formerly colonized nations, and structural racism.
                      </p>
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                        <li>Racial wealth gap in the US: 10:1 white to Black</li>
                        <li>Former colonies remain economically disadvantaged</li>
                        <li>Reparations movements demand accountability</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Key Economic Concepts
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Primitive Accumulation</h3>
                      <p className="text-sm text-neutral-500 mt-1">Marx's concept of how capitalism was built on violence, colonialism, and slavery.</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Unequal Exchange</h3>
                      <p className="text-sm text-neutral-500 mt-1">How colonial trade extracted value from periphery to core nations.</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Reparations</h3>
                      <p className="text-sm text-neutral-500 mt-1">Demands for compensation and repair for the harms of slavery and colonialism.</p>
                    </div>
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
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Abolitionists & Resistance Leaders</h2>
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

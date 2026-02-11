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
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5F6' }}>
      <header className="border-b" style={{ borderColor: '#E8C8C8', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#8B7355' }}>
            <Link to="/" className="hover:opacity-70 transition-opacity" style={{ color: '#C41E3A' }}>Home</Link>
            <span>/</span>
            <span>History</span>
            <span>/</span>
            <span style={{ color: '#2C1810' }}>Slavery & Economics</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Slavery, Colonialism & Economics
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            The economic foundations of slavery, the transatlantic slave trade, colonial extraction,
            and the lasting economic impact on global inequality.
          </p>
        </div>
      </header>

      <nav className="border-b" style={{ borderColor: '#E8C8C8', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
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
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(196, 30, 58, 0.4)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Historical Overview
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Transatlantic Slave Trade</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        12.5 million Africans forcibly transported to the Americas between 1500-1900.
                        The foundation of colonial wealth extraction.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Colonial Extraction</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        European powers extracted vast wealth from colonies through forced labor,
                        resource theft, and exploitative trade systems.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Abolition & Resistance</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        From the Haitian Revolution to the Underground Railroad,
                        enslaved peoples and abolitionists fought for freedom.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Regions & Systems
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Caribbean Plantations', 'American South', 'Brazilian Sugar', 'African Kingdoms',
                      'British Empire', 'French Colonies', 'Dutch Trade', 'Portuguese Empire',
                      'Arab Slave Trade', 'Indian Ocean Trade', 'Triangular Trade', 'Middle Passage'].map((theme) => (
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

            {activeTab === 'economics' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Economic Impact of Slavery
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div
                      className="p-6 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Wealth Accumulation</h3>
                      <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
                        Slavery generated enormous wealth for European and American elites.
                        Cotton, sugar, tobacco, and other crops built the foundations of industrial capitalism.
                      </p>
                      <ul className="text-sm space-y-1" style={{ color: '#8B7355' }}>
                        <li>British industrial revolution funded by slave trade profits</li>
                        <li>American banks, insurance companies built on slavery</li>
                        <li>European port cities enriched by slave commerce</li>
                      </ul>
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Lasting Inequality</h3>
                      <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
                        The economic legacy of slavery continues today through racial wealth gaps,
                        underdevelopment of formerly colonized nations, and structural racism.
                      </p>
                      <ul className="text-sm space-y-1" style={{ color: '#8B7355' }}>
                        <li>Racial wealth gap in the US: 10:1 white to Black</li>
                        <li>Former colonies remain economically disadvantaged</li>
                        <li>Reparations movements demand accountability</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Economic Concepts
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-medium" style={{ color: '#2C1810' }}>Primitive Accumulation</h3>
                      <p className="text-sm mt-1" style={{ color: '#8B7355' }}>Marx's concept of how capitalism was built on violence, colonialism, and slavery.</p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-medium" style={{ color: '#2C1810' }}>Unequal Exchange</h3>
                      <p className="text-sm mt-1" style={{ color: '#8B7355' }}>How colonial trade extracted value from periphery to core nations.</p>
                    </div>
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-medium" style={{ color: '#2C1810' }}>Reparations</h3>
                      <p className="text-sm mt-1" style={{ color: '#8B7355' }}>Demands for compensation and repair for the harms of slavery and colonialism.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B1A1A' }}>Key Events</h2>
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
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B1A1A' }}>Abolitionists & Resistance Leaders</h2>
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

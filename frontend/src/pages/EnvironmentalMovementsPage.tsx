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

export default function EnvironmentalMovementsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books' | 'timeline'>('overview')
  const [events, setEvents] = useState<MovementEvent[]>([])
  const [figures, setFigures] = useState<MovementFigure[]>([])
  const [books, setBooks] = useState<MovementBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch environmental activists
        const peopleRes = await fetch('/api/v1/people/?search=environmental&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }

        // Fetch environmental books
        const booksRes = await fetch('/api/v1/books/?search=ecology&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }

        // Fetch environmental events
        const eventsRes = await fetch('/api/v1/events/?search=climate&limit=50')
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
    { id: 'timeline', label: 'Timeline' },
    { id: 'events', label: 'Key Events' },
    { id: 'figures', label: 'Notable Figures' },
    { id: 'books', label: 'Essential Reading' },
  ]

  const timelineEvents = [
    { year: 1962, event: 'Silent Spring Published', description: 'Rachel Carsons book exposes dangers of pesticides, sparking modern environmental movement' },
    { year: 1969, event: 'Santa Barbara Oil Spill', description: 'Major oil spill galvanizes environmental activism and leads to first Earth Day' },
    { year: 1970, event: 'First Earth Day', description: '20 million Americans participate in first Earth Day, leading to EPA creation' },
    { year: 1971, event: 'Greenpeace Founded', description: 'Environmental organization founded in Vancouver to protest nuclear testing' },
    { year: 1972, event: 'Club of Rome Report', description: 'Limits to Growth report warns of resource depletion and environmental collapse' },
    { year: 1973, event: 'Endangered Species Act', description: 'US passes landmark legislation protecting threatened wildlife and habitats' },
    { year: 1979, event: 'Three Mile Island', description: 'Nuclear accident in Pennsylvania strengthens anti-nuclear movement' },
    { year: 1984, event: 'Bhopal Disaster', description: 'Industrial disaster in India kills thousands, highlights corporate environmental crimes' },
    { year: 1986, event: 'Chernobyl Disaster', description: 'Nuclear catastrophe in Ukraine leads to increased environmental awareness globally' },
    { year: 1987, event: 'Montreal Protocol', description: 'International agreement to phase out ozone-depleting substances' },
    { year: 1988, event: 'IPCC Established', description: 'UN creates Intergovernmental Panel on Climate Change to assess climate science' },
    { year: 1992, event: 'Rio Earth Summit', description: 'UN Conference on Environment and Development produces Agenda 21 and climate framework' },
    { year: 1997, event: 'Kyoto Protocol', description: 'First international agreement setting binding emissions reduction targets' },
    { year: 2006, event: 'An Inconvenient Truth', description: 'Al Gores documentary brings climate change to mainstream attention' },
    { year: 2015, event: 'Paris Agreement', description: 'Historic international accord commits nations to limit warming to 1.5-2 degrees C' },
    { year: 2018, event: 'Greta Thunberg School Strike', description: '15-year-old begins school strike, sparking global youth climate movement' },
    { year: 2019, event: 'Global Climate Strikes', description: 'Millions participate in worldwide climate strikes led by youth activists' },
    { year: 2021, event: 'Glasgow COP26', description: 'UN climate conference strengthens commitments but falls short of needed action' },
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
            <span style={{ color: '#2C1810' }}>Environmental Movements</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Environmental Movements
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            The history of environmental activism, from conservation to climate justice,
            indigenous land defense, anti-nuclear movements, and the fight against extractive capitalism.
          </p>
        </div>
      </header>

      <nav className="border-b" style={{ borderColor: '#E8C8C8', backgroundColor: '#FFF5F6' }}>
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
        {loading && activeTab !== 'overview' && activeTab !== 'timeline' ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(196, 30, 58, 0.6)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Strands of Environmental Activism
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                      className="p-6 rounded-lg transition-all"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Conservation</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Protection of wilderness, national parks, and biodiversity.
                        From John Muir to modern wildlife conservation efforts.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Environmental Justice</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Fighting disproportionate environmental burdens on marginalized communities.
                        Connecting racism, poverty, and pollution.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Climate Justice</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Addressing climate change as a social justice issue. Global South perspectives,
                        youth movements, and system change demands.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Indigenous Land Defense</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Indigenous peoples protecting ancestral lands from extraction.
                        Standing Rock, Amazon defenders, and land back movements.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Climate Change', 'Deforestation', 'Ocean Acidification', 'Biodiversity Loss',
                      'Plastic Pollution', 'Air Quality', 'Water Rights', 'Fracking',
                      'Pipeline Resistance', 'Nuclear Power', 'Renewable Energy', 'Green New Deal',
                      'Carbon Pricing', 'Food Sovereignty', 'Environmental Racism', 'Degrowth'].map((theme) => (
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

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Tactics & Strategies
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#C41E3A' }}>Direct Action</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Tree sits, blockades, banner drops, pipeline protests.
                        Earth First!, Extinction Rebellion, Ende Gelande.
                      </p>
                    </div>
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#C41E3A' }}>Legal & Policy</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Environmental litigation, lobbying, international agreements.
                        Rights of Nature laws, climate lawsuits against corporations.
                      </p>
                    </div>
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E8C8C8',
                        borderLeft: '4px solid #C41E3A',
                        borderRadius: '10px'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: '#C41E3A' }}>Mass Mobilization</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Climate strikes, marches, youth movements.
                        Fridays for Future, Peoples Climate March.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Organizations
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Greenpeace', desc: 'International environmental NGO using direct action' },
                      { name: '350.org', desc: 'Global grassroots climate movement' },
                      { name: 'Extinction Rebellion', desc: 'Nonviolent civil disobedience for climate action' },
                      { name: 'Fridays for Future', desc: 'Youth climate strike movement started by Greta Thunberg' },
                      { name: 'Sierra Club', desc: 'Oldest grassroots environmental organization in US' },
                      { name: 'Indigenous Environmental Network', desc: 'Alliance of Indigenous peoples for environmental justice' },
                    ].map((org) => (
                      <div
                        key={org.name}
                        className="p-4 rounded-lg"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E8C8C8',
                          borderLeft: '4px solid #C41E3A',
                          borderRadius: '10px'
                        }}
                      >
                        <h3 className="font-medium" style={{ color: '#2C1810' }}>{org.name}</h3>
                        <p className="text-sm" style={{ color: '#8B7355' }}>{org.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#8B1A1A' }}>
                  Environmental Movement Timeline
                </h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: '#E8C8C8' }} />
                  <div className="space-y-6">
                    {timelineEvents.map((item, index) => (
                      <div key={index} className="relative pl-12">
                        <div
                          className="absolute left-2.5 w-3 h-3 rounded-full border-2"
                          style={{
                            backgroundColor: '#C41E3A',
                            borderColor: '#FFF5F6'
                          }}
                        />
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E8C8C8',
                            borderLeft: '4px solid #C41E3A',
                            borderRadius: '10px'
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className="px-2 py-1 text-xs font-semibold rounded"
                              style={{
                                background: 'rgba(196, 30, 58, 0.1)',
                                color: '#C41E3A'
                              }}
                            >
                              {item.year}
                            </span>
                            <h3 className="font-medium" style={{ color: '#2C1810' }}>{item.event}</h3>
                          </div>
                          <p className="text-sm" style={{ color: '#8B7355' }}>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <div className="py-8">
                    <p className="text-center mb-6" style={{ color: '#8B7355' }}>Loading from database...</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'Rachel Carson', years: '1907-1964', desc: 'Marine biologist whose Silent Spring launched modern environmentalism' },
                        { name: 'Wangari Maathai', years: '1940-2011', desc: 'Kenyan activist, Nobel laureate, founder of Green Belt Movement' },
                        { name: 'Vandana Shiva', years: 'b. 1952', desc: 'Indian scholar and seed sovereignty activist' },
                        { name: 'Greta Thunberg', years: 'b. 2003', desc: 'Swedish climate activist who sparked global youth movement' },
                        { name: 'Ken Saro-Wiwa', years: '1941-1995', desc: 'Nigerian activist executed for opposing Shell oil extraction' },
                        { name: 'Berta Caceres', years: '1971-2016', desc: 'Honduran indigenous activist assassinated for river defense' },
                      ].map((person) => (
                        <div
                          key={person.name}
                          className="p-4 rounded-lg"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E8C8C8',
                            borderLeft: '4px solid #C41E3A',
                            borderRadius: '10px'
                          }}
                        >
                          <h3 className="font-medium" style={{ color: '#2C1810' }}>{person.name}</h3>
                          <p className="text-sm" style={{ color: '#8B7355' }}>{person.years}</p>
                          <p className="mt-2 text-sm" style={{ color: '#5C3D2E' }}>{person.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  <div className="py-8">
                    <p className="text-center mb-6" style={{ color: '#8B7355' }}>Loading from database...</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { title: 'Silent Spring', author: 'Rachel Carson', year: 1962 },
                        { title: 'This Changes Everything', author: 'Naomi Klein', year: 2014 },
                        { title: 'The Uninhabitable Earth', author: 'David Wallace-Wells', year: 2019 },
                        { title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', year: 2013 },
                        { title: 'Sand County Almanac', author: 'Aldo Leopold', year: 1949 },
                        { title: 'Staying with the Trouble', author: 'Donna Haraway', year: 2016 },
                      ].map((book) => (
                        <div
                          key={book.title}
                          className="p-4 rounded-lg"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E8C8C8',
                            borderLeft: '4px solid #C41E3A',
                            borderRadius: '10px'
                          }}
                        >
                          <h3 className="font-medium" style={{ color: '#2C1810' }}>{book.title}</h3>
                          <p className="text-sm" style={{ color: '#8B7355' }}>{book.author} ({book.year})</p>
                        </div>
                      ))}
                    </div>
                  </div>
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

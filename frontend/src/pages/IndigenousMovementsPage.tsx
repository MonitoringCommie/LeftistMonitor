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

export default function IndigenousMovementsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books' | 'regions'>('overview')
  const [events, setEvents] = useState<MovementEvent[]>([])
  const [figures, setFigures] = useState<MovementFigure[]>([])
  const [books, setBooks] = useState<MovementBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const peopleRes = await fetch('/api/v1/people/?search=indigenous&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }

        const booksRes = await fetch('/api/v1/books/?search=indigenous&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }

        const eventsRes = await fetch('/api/v1/events/?search=indigenous&limit=50')
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
    { id: 'regions', label: 'By Region' },
    { id: 'events', label: 'Key Events' },
    { id: 'figures', label: 'Notable Figures' },
    { id: 'books', label: 'Essential Reading' },
  ]

  const regions = [
    {
      name: 'North America',
      peoples: ['Lakota/Sioux', 'Cherokee', 'Navajo', 'Ojibwe', 'Inuit', 'Cree', 'Haudenosaunee'],
      struggles: 'Standing Rock, Line 3, Wet\'suwet\'en, Missing and Murdered Indigenous Women (MMIW)',
      color: 'bg-amber-100 border-amber-300',
    },
    {
      name: 'Central & South America',
      peoples: ['Maya', 'Quechua', 'Aymara', 'Mapuche', 'Guarani', 'Yanomami', 'Kayapo'],
      struggles: 'Amazon deforestation, land rights, Zapatista movement, mining resistance',
      color: 'bg-emerald-100 border-emerald-300',
    },
    {
      name: 'Australia & Pacific',
      peoples: ['Aboriginal Australians', 'Torres Strait Islanders', 'Maori', 'Kanaky', 'Papuans'],
      struggles: 'Land rights (Mabo), Stolen Generations, Treaty campaigns, West Papua independence',
      color: 'bg-orange-100 border-orange-300',
    },
    {
      name: 'Africa',
      peoples: ['San/Bushmen', 'Maasai', 'Amazigh/Berber', 'Tuareg', 'Ogoni', 'Himba'],
      struggles: 'Land dispossession, pastoralist rights, cultural preservation, resource extraction',
      color: 'bg-red-100 border-red-300',
    },
    {
      name: 'Asia',
      peoples: ['Ainu', 'Adivasi', 'Tibetans', 'Uyghurs', 'Karen', 'Hmong', 'Jumma'],
      struggles: 'Cultural suppression, land rights, autonomy movements, displacement',
      color: 'bg-violet-100 border-violet-300',
    },
    {
      name: 'Arctic & Northern',
      peoples: ['Sami', 'Inuit', 'Nenets', 'Evenki', 'Chukchi'],
      struggles: 'Climate change impacts, resource extraction, reindeer herding rights',
      color: 'bg-sky-100 border-sky-300',
    },
  ]

  const keyEvents = [
    { year: 1890, event: 'Wounded Knee Massacre', description: 'US Army kills 250-300 Lakota at Wounded Knee Creek, South Dakota' },
    { year: 1969, event: 'Alcatraz Occupation', description: 'Native American activists occupy Alcatraz Island for 19 months' },
    { year: 1973, event: 'Wounded Knee Occupation', description: 'AIM occupies Wounded Knee for 71 days in protest of federal policies' },
    { year: 1975, event: 'Pine Ridge Conflict', description: 'Shootout at Pine Ridge results in deaths of two FBI agents and one AIM member' },
    { year: 1990, event: 'Oka Crisis', description: 'Mohawk resistance to golf course expansion on sacred land in Quebec' },
    { year: 1992, event: 'Mabo Decision', description: 'Australian High Court recognizes native title, overturning terra nullius' },
    { year: 1994, event: 'Zapatista Uprising', description: 'EZLN launches armed uprising in Chiapas on day NAFTA takes effect' },
    { year: 2007, event: 'UN Declaration (UNDRIP)', description: 'UN adopts Declaration on the Rights of Indigenous Peoples' },
    { year: 2016, event: 'Standing Rock', description: 'Massive protest against Dakota Access Pipeline becomes global movement' },
    { year: 2019, event: 'Wet\'suwet\'en', description: 'Hereditary chiefs oppose Coastal GasLink pipeline, sparking solidarity actions' },
    { year: 2020, event: 'Land Back Movement', description: 'Growing movement demanding return of indigenous lands gains momentum' },
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
            <span style={{ color: '#2C1810' }}>Indigenous Peoples</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Indigenous Peoples Movements
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            The ongoing resistance of Indigenous peoples worldwide against colonialism, land theft,
            cultural genocide, and environmental destruction. From the American Indian Movement to
            Land Back, these struggles continue to shape our world.
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
        {loading && activeTab !== 'overview' && activeTab !== 'regions' ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(196, 30, 58, 0.6)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Core Issues
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Land Rights</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Stolen lands, broken treaties, and the Land Back movement demanding
                        return of ancestral territories.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Sovereignty</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Self-determination, treaty rights, and the recognition of
                        Indigenous nations as sovereign entities.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Cultural Preservation</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Language revitalization, protection of sacred sites, and resistance
                        to cultural genocide.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Environmental Defense</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Indigenous peoples as frontline defenders against pipelines,
                        mining, and deforestation.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Concepts
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Land Back', 'UNDRIP', 'Free Prior Informed Consent', 'Treaty Rights',
                      'Sovereignty', 'Decolonization', 'MMIW', 'Water Protectors',
                      'Two-Eyed Seeing', 'Traditional Ecological Knowledge', 'Reparations',
                      'Residential Schools', 'Stolen Generations', 'Terra Nullius', 'Manifest Destiny'].map((theme) => (
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
                    Timeline
                  </h2>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: '#E8C8C8' }} />
                    <div className="space-y-4">
                      {keyEvents.map((item, index) => (
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
                            <div className="flex items-center gap-3 mb-1">
                              <span
                                className="px-2 py-0.5 text-xs font-semibold rounded"
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
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Organizations
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'American Indian Movement (AIM)', desc: 'Civil rights organization founded in 1968' },
                      { name: 'Idle No More', desc: 'Indigenous rights movement started in Canada in 2012' },
                      { name: 'EZLN (Zapatistas)', desc: 'Indigenous revolutionary group in Chiapas, Mexico' },
                      { name: 'Indigenous Environmental Network', desc: 'Alliance of indigenous peoples for environmental justice' },
                      { name: 'First Nations Assembly', desc: 'National advocacy organization for First Nations in Canada' },
                      { name: 'Cultural Survival', desc: 'Advocates for indigenous peoples rights worldwide' },
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

            {activeTab === 'regions' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A' }}>
                  Indigenous Movements by Region
                </h2>
                {regions.map((region) => (
                  <div
                    key={region.name}
                    className="p-6 rounded-lg"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8C8C8',
                      borderLeft: '4px solid #C41E3A',
                      borderRadius: '10px'
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#2C1810' }}>{region.name}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2" style={{ color: '#C41E3A' }}>Indigenous Peoples</h4>
                        <div className="flex flex-wrap gap-1">
                          {region.peoples.map((people) => (
                            <span
                              key={people}
                              className="px-2 py-0.5 text-xs rounded"
                              style={{
                                background: 'rgba(196, 30, 58, 0.1)',
                                color: '#C41E3A'
                              }}
                            >
                              {people}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2" style={{ color: '#C41E3A' }}>Key Struggles</h4>
                        <p className="text-sm" style={{ color: '#8B7355' }}>{region.struggles}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                        { name: 'Sitting Bull', years: '1831-1890', desc: 'Hunkpapa Lakota leader who resisted US government policies' },
                        { name: 'Rigoberta Menchu', years: 'b. 1959', desc: 'Guatemalan K\'iche\' activist, Nobel Peace Prize laureate' },
                        { name: 'Russell Means', years: '1939-2012', desc: 'Oglala Lakota activist, leader of American Indian Movement' },
                        { name: 'Winona LaDuke', years: 'b. 1959', desc: 'Ojibwe environmentalist, executive director of Honor the Earth' },
                        { name: 'Leonard Peltier', years: 'b. 1944', desc: 'AIM member imprisoned since 1977, international cause celebre' },
                        { name: 'Subcomandante Marcos', years: 'b. 1957', desc: 'Spokesperson for the Zapatista Army of National Liberation' },
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
                        { title: 'Bury My Heart at Wounded Knee', author: 'Dee Brown', year: 1970 },
                        { title: 'An Indigenous Peoples History of the United States', author: 'Roxanne Dunbar-Ortiz', year: 2014 },
                        { title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer', year: 2013 },
                        { title: 'The Inconvenient Indian', author: 'Thomas King', year: 2012 },
                        { title: 'Red Skin, White Masks', author: 'Glen Coulthard', year: 2014 },
                        { title: 'I, Rigoberta Menchu', author: 'Rigoberta Menchu', year: 1983 },
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

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

export default function LGBTQMovementsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'figures' | 'books' | 'timeline'>('overview')
  const [events, setEvents] = useState<MovementEvent[]>([])
  const [figures, setFigures] = useState<MovementFigure[]>([])
  const [books, setBooks] = useState<MovementBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch LGBTQ-related people
        const peopleRes = await fetch('/api/v1/people/?search=LGBT&limit=50')
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          setFigures(data.items || [])
        }

        // Fetch LGBTQ-related books
        const booksRes = await fetch('/api/v1/books/?search=queer&limit=50')
        if (booksRes.ok) {
          const data = await booksRes.json()
          setBooks(data.items || [])
        }

        // Fetch LGBTQ-related events (pride, stonewall, etc.)
        const eventsRes = await fetch('/api/v1/events/?search=pride&limit=50')
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
    { year: 1924, event: 'Society for Human Rights', description: 'First documented gay rights organization in the US founded in Chicago by Henry Gerber' },
    { year: 1950, event: 'Mattachine Society', description: 'One of the earliest LGBT rights organizations in the United States founded in Los Angeles' },
    { year: 1955, event: 'Daughters of Bilitis', description: 'First lesbian civil and political rights organization in the US founded in San Francisco' },
    { year: 1969, event: 'Stonewall Uprising', description: 'Pivotal moment in LGBTQ+ history when patrons of the Stonewall Inn fought back against police raids in NYC' },
    { year: 1970, event: 'First Pride Marches', description: 'Christopher Street Liberation Day marches held in NYC, Los Angeles, San Francisco, and Chicago' },
    { year: 1973, event: 'APA Declassifies Homosexuality', description: 'American Psychiatric Association removes homosexuality from list of mental disorders' },
    { year: 1978, event: 'Rainbow Flag Created', description: 'Gilbert Baker designs the rainbow flag as a symbol of LGBTQ+ pride in San Francisco' },
    { year: 1979, event: 'First National March', description: 'First National March on Washington for Lesbian and Gay Rights draws 100,000 people' },
    { year: 1981, event: 'AIDS Crisis Begins', description: 'First cases of what would become known as AIDS reported, devastating LGBTQ+ communities' },
    { year: 1987, event: 'ACT UP Founded', description: 'AIDS Coalition to Unleash Power founded to demand action on the AIDS crisis' },
    { year: 1990, event: 'Queer Nation Founded', description: 'Activist group focused on direct action against homophobia and increasing LGBTQ+ visibility' },
    { year: 1993, event: 'Dont Ask Dont Tell', description: 'US military policy allowing closeted service, later repealed in 2011' },
    { year: 2000, event: 'Vermont Civil Unions', description: 'Vermont becomes first US state to legally recognize civil unions for same-sex couples' },
    { year: 2003, event: 'Lawrence v. Texas', description: 'US Supreme Court strikes down sodomy laws, decriminalizing same-sex relations nationwide' },
    { year: 2004, event: 'Massachusetts Marriage', description: 'Massachusetts becomes first US state to legalize same-sex marriage' },
    { year: 2013, event: 'Windsor v. US', description: 'Supreme Court strikes down Defense of Marriage Act (DOMA)' },
    { year: 2015, event: 'Obergefell v. Hodges', description: 'US Supreme Court rules same-sex marriage is a constitutional right nationwide' },
    { year: 2020, event: 'Bostock v. Clayton County', description: 'Supreme Court rules Title VII protects LGBTQ+ employees from workplace discrimination' },
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
            <span style={{ color: '#2C1810' }}>LGBTQ+ Movements</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-semibold" style={{ color: '#8B1A1A' }}>
              LGBTQ+ Movements
            </h1>
          </div>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            The history of LGBTQ+ liberation, from early homophile movements through Stonewall,
            the AIDS crisis, marriage equality, and the ongoing fight for transgender rights and full equality.
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
                    Eras of LGBTQ+ Liberation
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Homophile Era (1950s-1960s)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Early organizations like Mattachine Society and Daughters of Bilitis focused on
                        respectability and assimilation into mainstream society.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Gay Liberation (1969-1980s)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Post-Stonewall era of radical activism, Pride marches, and coming out as a
                        political act. Connected to broader liberation movements.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>AIDS Crisis (1981-1996)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Devastating epidemic met with government inaction. ACT UP and other groups
                        demanded action through direct action and civil disobedience.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#2C1810' }}>Marriage Equality & Beyond (2000s-Present)</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Legal victories including marriage equality and employment protections,
                        with ongoing fights for transgender rights and against discrimination.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
                    Key Themes & Issues
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {['Marriage Equality', 'Decriminalization', 'Anti-Discrimination Laws', 'Transgender Rights',
                      'HIV/AIDS', 'Conversion Therapy Bans', 'Military Service', 'Adoption Rights',
                      'Healthcare Access', 'Youth Support', 'Hate Crime Legislation', 'International Solidarity',
                      'Intersectionality', 'Non-Binary Recognition', 'Asylum Rights', 'Sports Inclusion'].map((theme) => (
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
                    Global Perspective
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
                      <h3 className="font-semibold mb-2" style={{ color: '#C41E3A' }}>Criminalized</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        ~70 countries still criminalize same-sex relations, with some imposing
                        death penalty. Concentrated in Middle East, Africa, and parts of Asia.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#C41E3A' }}>Partial Rights</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        Many countries have decriminalized but lack marriage equality or
                        comprehensive anti-discrimination protections.
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
                      <h3 className="font-semibold mb-2" style={{ color: '#C41E3A' }}>Full Equality</h3>
                      <p className="text-sm" style={{ color: '#8B7355' }}>
                        ~30 countries have marriage equality. Leaders include Netherlands (2001),
                        Belgium, Spain, Canada, South Africa, and many Western nations.
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
                      { name: 'Human Rights Campaign (HRC)', desc: 'Largest LGBTQ+ advocacy group in the US' },
                      { name: 'ILGA World', desc: 'International federation of LGBTQ+ organizations' },
                      { name: 'GLAAD', desc: 'Media advocacy organization for LGBTQ+ representation' },
                      { name: 'Lambda Legal', desc: 'Legal organization fighting for civil rights' },
                      { name: 'The Trevor Project', desc: 'Crisis intervention for LGBTQ+ youth' },
                      { name: 'PFLAG', desc: 'Support for LGBTQ+ people and their families' },
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
                  LGBTQ+ Rights Timeline
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
                        { name: 'Marsha P. Johnson', years: '1945-1992', desc: 'Black transgender activist, key figure at Stonewall' },
                        { name: 'Sylvia Rivera', years: '1951-2002', desc: 'Latina trans activist, co-founded STAR with Marsha P. Johnson' },
                        { name: 'Harvey Milk', years: '1930-1978', desc: 'First openly gay elected official in California' },
                        { name: 'Audre Lorde', years: '1934-1992', desc: 'Black lesbian feminist poet and activist' },
                        { name: 'Bayard Rustin', years: '1912-1987', desc: 'Gay civil rights leader, organized March on Washington' },
                        { name: 'Larry Kramer', years: '1935-2020', desc: 'Playwright and AIDS activist, founded ACT UP' },
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
                        { title: 'Stone Butch Blues', author: 'Leslie Feinberg', year: 1993 },
                        { title: 'Gender Trouble', author: 'Judith Butler', year: 1990 },
                        { title: 'And the Band Played On', author: 'Randy Shilts', year: 1987 },
                        { title: 'The Stonewall Reader', author: 'Various', year: 2019 },
                        { title: 'Sister Outsider', author: 'Audre Lorde', year: 1984 },
                        { title: 'Transgender History', author: 'Susan Stryker', year: 2008 },
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

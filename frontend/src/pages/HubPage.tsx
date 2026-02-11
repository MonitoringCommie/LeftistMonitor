import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface TopicCard {
  title: string
  description: string
  path: string
  accent: string
  iconPath: string
}

interface CategorySection {
  title: string
  topics: TopicCard[]
}

// SVG icon paths for a more professional look
const icons = {
  map: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  conflict: 'M13 10V3L4 14h7v7l9-11h-7z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  glossary: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  compare: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  people: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  feminist: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
  fist: 'M11 11V5a2 2 0 114 0v6m-4 0h4m-8 4a4 4 0 004 4h4a4 4 0 004-4v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3z',
  chains: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  labor: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  election: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
}

// Color palette for category accents (warm muted tones for light theme)
const accentColors = [
  '#8B1A1A', // deep red
  '#6B3A3A', // muted rose
  '#8B6914', // dark gold
  '#5C3D2E', // warm brown
  '#7A4A5A', // dusty rose
  '#6A4A3A', // warm stone
  '#5A6A4A', // olive
  '#6A3A5A', // plum
]

const categories: CategorySection[] = [
  {
    title: 'Explore',
    topics: [
      {
        title: 'World Map',
        description: 'Explore wars, conflicts, borders, and liberation struggles across the world',
        path: '/map',
        accent: '#C41E3A',
        iconPath: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M3.6 9h16.8 M3.6 15h16.8 M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z',
      },
      {
        title: 'Books & Literature',
        description: 'Political texts, revolutionary writings, and theory',
        path: '/books',
        accent: '#8B6914',
        iconPath: icons.book,
      },
      {
        title: 'People & Figures',
        description: 'Political leaders, activists, theorists, and movements',
        path: '/people',
        accent: '#8B1A1A',
        iconPath: icons.people,
      },
      {
        title: 'Statistics',
        description: 'GDP, demographics, military spending, and global data',
        path: '/stats',
        accent: '#C41E3A',
        iconPath: icons.chart,
      },
    ],
  },
  {
    title: 'Movements & Struggles',
    topics: [
      {
        title: 'Conflicts & Wars',
        description: 'Armed conflicts, frontlines, and military operations',
        path: '/frontlines',
        accent: '#C41E3A',
        iconPath: icons.conflict,
      },
      {
        title: 'Feminist Movements',
        description: "Women's liberation, suffrage, and gender equality struggles",
        path: '/movements/feminist',
        accent: '#8B1A1A',
        iconPath: icons.feminist,
      },
      {
        title: 'Civil Rights',
        description: 'Racial justice, anti-colonialism, and liberation movements',
        path: '/movements/civil-rights',
        accent: '#D4A017',
        iconPath: icons.fist,
      },
      {
        title: 'Labor & Unions',
        description: 'Worker movements, strikes, and union organizing',
        path: '/movements/labor',
        accent: '#C41E3A',
        iconPath: icons.labor,
      },
      {
        title: 'LGBTQ+ Movements',
        description: 'Pride history, Stonewall, marriage equality, and transgender rights',
        path: '/movements/lgbtq',
        accent: '#8B1A1A',
        iconPath: icons.people,
      },
      {
        title: 'Environmental',
        description: 'Climate justice, indigenous land defense, and ecological movements',
        path: '/movements/environmental',
        accent: '#8B6914',
        iconPath: icons.map,
      },
      {
        title: 'Indigenous Peoples',
        description: 'Land rights, sovereignty, and resistance to colonialism worldwide',
        path: '/movements/indigenous',
        accent: '#D4A017',
        iconPath: icons.fist,
      },
    ],
  },
  {
    title: 'History & Analysis',
    topics: [
      {
        title: 'Slavery & Economics',
        description: 'The economics of slavery, colonialism, and exploitation',
        path: '/history/slavery',
        accent: '#8B1A1A',
        iconPath: icons.chains,
      },
      {
        title: 'Elections',
        description: 'Electoral history, voting patterns, and political parties',
        path: '/elections',
        accent: '#C41E3A',
        iconPath: icons.election,
      },
      {
        title: 'Compare Countries',
        description: 'Side-by-side analysis across multiple metrics',
        path: '/compare',
        accent: '#8B6914',
        iconPath: icons.compare,
      },
      {
        title: 'Glossary',
        description: 'Political concepts, terminology, and theory explained',
        path: '/glossary',
        accent: '#D4A017',
        iconPath: icons.glossary,
      },
    ],
  },
]

const liberationStruggles = [
  'Palestine', 'Ireland', 'Kurdistan', 'Kashmir',
  'Tibet', 'Western Sahara', 'West Papua', 'Puerto Rico'
]

interface DatabaseStats {
  countries: number
  books: number
  people: number
  events: number
  conflicts: number
  elections: number
}

export default function HubPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/v1/stats/overview')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch {
        setStats({
          countries: 710,
          books: 33000,
          people: 104000,
          events: 81000,
          conflicts: 21000,
          elections: 30000,
        })
      }
    }
    fetchStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${Math.floor(num / 1000)}K+`
    return num.toString()
  }

  return (
    <div style={{ backgroundColor: '#FFF5F6', minHeight: '100vh' }}>
      {/* Header Section */}
      <header style={{
        borderBottom: '1px solid #E8C8C8',
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: '#C41E3A',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(196, 30, 58, 0.3)'
            }}>
              <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold' }}>L</span>
            </div>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '600',
              color: '#8B1A1A',
              letterSpacing: '-0.02em'
            }}>
              Leftist Monitor
            </h1>
          </div>
          <p style={{
            color: '#5C3D2E',
            maxWidth: '40rem',
            fontSize: '0.95rem',
            lineHeight: '1.6'
          }}>
            A comprehensive database of global political history, liberation movements, and social struggles.
          </p>
        </div>
      </header>

      {/* Stats Section */}
      <div style={{
        borderBottom: '1px solid #E8C8C8',
        background: '#FFFFFF',
        borderTop: '3px solid #C41E3A'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.875rem' }}>
            {stats && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#8B7355' }}>Countries</span>
                  <span style={{ fontWeight: '600', color: '#2C1810' }}>{formatNumber(stats.countries)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#8B7355' }}>People</span>
                  <span style={{ fontWeight: '600', color: '#2C1810' }}>{formatNumber(stats.people)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#8B7355' }}>Books</span>
                  <span style={{ fontWeight: '600', color: '#2C1810' }}>{formatNumber(stats.books)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#8B7355' }}>Events</span>
                  <span style={{ fontWeight: '600', color: '#2C1810' }}>{formatNumber(stats.events)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#8B7355' }}>Conflicts</span>
                  <span style={{ fontWeight: '600', color: '#2C1810' }}>{formatNumber(stats.conflicts)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#8B7355' }}>Elections</span>
                  <span style={{ fontWeight: '600', color: '#2C1810' }}>{formatNumber(stats.elections)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {categories.map((category, categoryIndex) => (
          <section key={category.title} style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              color: '#8B1A1A',
              fontWeight: '600',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              {category.title}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}>
              {category.topics.map((topic) => (
                <Link
                  key={topic.path}
                  to={topic.path}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8C8C8',
                      borderLeft: `4px solid ${topic.accent}`,
                      borderRadius: '10px',
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      height: '100%',
                      boxSizing: 'border-box',
                      boxShadow: '0 1px 3px rgba(139, 26, 26, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = topic.accent;
                      e.currentTarget.style.background = 'rgba(196, 30, 58, 0.03)';
                      e.currentTarget.style.boxShadow = `0 4px 12px rgba(196, 30, 58, 0.1)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E8C8C8';
                      e.currentTarget.style.borderLeftColor = topic.accent;
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(139, 26, 26, 0.06)';
                    }}
                  >
                    {/* Icon Container */}
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      minWidth: '2.5rem',
                      borderRadius: '0.5rem',
                      background: `rgba(196, 30, 58, 0.08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <svg style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        color: topic.accent
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={topic.iconPath} />
                      </svg>
                    </div>

                    {/* Content */}
                    <div style={{ minWidth: '0', flex: '1' }}>
                      <h3 style={{
                        fontWeight: '600',
                        color: '#2C1810',
                        marginBottom: '0.5rem',
                        fontSize: '0.95rem'
                      }}>
                        {topic.title}
                      </h3>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#8B7355',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Liberation Struggles Section */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            color: '#8B1A1A',
            fontWeight: '600',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            Liberation Struggles
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {liberationStruggles.map((struggle) => (
              <Link
                key={struggle}
                to={`/map?focus=${struggle.toLowerCase().replace(' ', '-')}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '9999px',
                    background: 'rgba(196, 30, 58, 0.08)',
                    color: '#C41E3A',
                    border: '1px solid rgba(196, 30, 58, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.6)';
                    e.currentTarget.style.background = 'rgba(196, 30, 58, 0.15)';
                    e.currentTarget.style.color = '#8B1A1A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)';
                    e.currentTarget.style.background = 'rgba(196, 30, 58, 0.08)';
                    e.currentTarget.style.color = '#C41E3A';
                  }}
                >
                  {struggle}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Section */}
        <section style={{
          paddingTop: '2rem',
          borderTop: '1px solid #E8C8C8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#8B7355'
          }}>
            Data from Wikidata, World Bank, UCDP, and open sources.
          </p>
          <Link to="/about" style={{ textDecoration: 'none' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#C41E3A',
              transition: 'color 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#8B1A1A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#C41E3A';
            }}>
              About this project
            </div>
          </Link>
        </section>
      </main>
    </div>
  )
}

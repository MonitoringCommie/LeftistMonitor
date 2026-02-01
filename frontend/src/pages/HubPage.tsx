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

const categories: CategorySection[] = [
  {
    title: 'Explore',
    topics: [
      {
        title: 'World Map',
        description: 'Interactive map with historical borders and geopolitical data',
        path: '/map',
        accent: 'border-l-rose-600',
        iconPath: icons.map,
      },
      {
        title: 'Books & Literature',
        description: 'Political texts, revolutionary writings, and theory',
        path: '/books',
        accent: 'border-l-amber-600',
        iconPath: icons.book,
      },
      {
        title: 'People & Figures',
        description: 'Political leaders, activists, theorists, and movements',
        path: '/people',
        accent: 'border-l-violet-600',
        iconPath: icons.people,
      },
      {
        title: 'Statistics',
        description: 'GDP, demographics, military spending, and global data',
        path: '/stats',
        accent: 'border-l-sky-600',
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
        accent: 'border-l-orange-600',
        iconPath: icons.conflict,
      },
      {
        title: 'Feminist Movements',
        description: "Women's liberation, suffrage, and gender equality struggles",
        path: '/movements/feminist',
        accent: 'border-l-fuchsia-600',
        iconPath: icons.feminist,
      },
      {
        title: 'Civil Rights',
        description: 'Racial justice, anti-colonialism, and liberation movements',
        path: '/movements/civil-rights',
        accent: 'border-l-emerald-600',
        iconPath: icons.fist,
      },
      {
        title: 'Labor & Unions',
        description: 'Worker movements, strikes, and union organizing',
        path: '/movements/labor',
        accent: 'border-l-red-600',
        iconPath: icons.labor,
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
        accent: 'border-l-stone-600',
        iconPath: icons.chains,
      },
      {
        title: 'Elections',
        description: 'Electoral history, voting patterns, and political parties',
        path: '/elections',
        accent: 'border-l-blue-600',
        iconPath: icons.election,
      },
      {
        title: 'Compare Countries',
        description: 'Side-by-side analysis across multiple metrics',
        path: '/compare',
        accent: 'border-l-purple-600',
        iconPath: icons.compare,
      },
      {
        title: 'Glossary',
        description: 'Political concepts, terminology, and theory explained',
        path: '/glossary',
        accent: 'border-l-teal-600',
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">L</span>
            </div>
            <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Leftist Monitor
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-lg">
            A comprehensive database of global political history, liberation movements, and social struggles.
          </p>
        </div>
      </header>

      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-8 text-sm">
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Countries</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(stats.countries)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">People</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(stats.people)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Books</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(stats.books)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Events</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(stats.events)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Conflicts</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(stats.conflicts)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Elections</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatNumber(stats.elections)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {categories.map((category) => (
          <section key={category.title} className="mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.topics.map((topic) => (
                <Link
                  key={topic.path}
                  to={topic.path}
                  className={`group block p-5 rounded-lg border-l-4 ${topic.accent} bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 hover:shadow-sm`}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                      <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={topic.iconPath} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">{topic.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{topic.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Liberation Struggles</h2>
          <div className="flex flex-wrap gap-2">
            {liberationStruggles.map((struggle) => (
              <Link
                key={struggle}
                to={`/map?focus=${struggle.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 text-sm font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-400 border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-800 transition-colors"
              >
                {struggle}
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">Data from Wikidata, World Bank, UCDP, and open sources.</p>
            <Link to="/about" className="text-sm font-medium text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400">
              About this project
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

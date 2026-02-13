import { useState, lazy, Suspense, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCountry } from '../api/geography'
import { useSelectedYear } from '../stores/mapStore'
import CountryTabs from '../components/country/CountryTabs'
import ErrorBoundary from '../components/ErrorBoundary'

// Lazy load all tab components for better initial load
const OverviewTab = lazy(() => import('../components/country/OverviewTab'))
const BorderDevelopmentTab = lazy(() => import('../components/country/BorderDevelopmentTab'))
const ElectionsTab = lazy(() => import('../components/country/ElectionsTab'))
const PartiesTab = lazy(() => import('../components/country/PartiesTab'))
const PeopleTab = lazy(() => import('../components/country/PeopleTab'))
const EventsTab = lazy(() => import('../components/country/EventsTab'))
const ConflictsTab = lazy(() => import('../components/country/ConflictsTab'))
const BooksTab = lazy(() => import('../components/country/BooksTab'))
const PoliciesTab = lazy(() => import('../components/country/PoliciesTab'))
const OccupationsTab = lazy(() => import('../components/country/OccupationsTab'))

// Tab loading skeleton
function TabSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 rounded w-1/4" style={{ backgroundColor: 'rgba(196, 30, 58, 0.1)' }}></div>
      <div className="space-y-3">
        <div className="h-4 rounded w-full" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
        <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
        <div className="h-4 rounded w-4/6" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-32 rounded" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
        <div className="h-32 rounded" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
      </div>
    </div>
  )
}

// Tab error fallback
function TabErrorFallback() {
  return (
    <div className="rounded-lg p-6 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #D4A017' }}>
      <p className="font-medium" style={{ color: '#8B1A1A' }}>Unable to load this tab</p>
      <p className="text-sm mt-1" style={{ color: '#5C3D2E' }}>Try selecting a different tab or refresh the page.</p>
    </div>
  )
}

const TABS: Array<{ id: string; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'conflicts', label: 'Conflicts' },
  { id: 'borders', label: 'Border Changes' },
  { id: 'events', label: 'Events & History' },
  { id: 'elections', label: 'Elections' },
  { id: 'parties', label: 'Political Parties' },
  { id: 'policies', label: 'Key Policies' },
  { id: 'people', label: 'People & Authors' },
  { id: 'books', label: 'Books' },
  { id: 'occupations', label: 'Occupations' },
] as const

export default function CountryPage() {
  const { id } = useParams<{ id: string }>()
  const { data: country, isLoading, error } = useCountry(id || '')
  const [activeTab, setActiveTab] = useState('overview')

  // Use granular selector
  const selectedYear = useSelectedYear()

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  // Memoize tab content to prevent re-render on parent updates
  const tabContent = useMemo(() => {
    if (!country) return null

    switch (activeTab) {
      case 'overview':
        return <OverviewTab country={country} year={selectedYear} />
      case 'borders':
        return <BorderDevelopmentTab countryId={country.id} countryName={country.name_en} />
      case 'occupations':
        return <OccupationsTab countryId={country.id} countryName={country.name_en} />
      case 'elections':
        return <ElectionsTab countryId={country.id} year={selectedYear} />
      case 'parties':
        return <PartiesTab countryId={country.id} year={selectedYear} />
      case 'policies':
        return <PoliciesTab countryId={country.id} year={selectedYear} />
      case 'people':
        return <PeopleTab countryId={country.id} year={selectedYear} />
      case 'events':
        return <EventsTab countryId={country.id} year={selectedYear} />
      case 'conflicts':
        return <ConflictsTab countryId={country.id} year={selectedYear} />
      case 'books':
        return <BooksTab countryId={country.id} year={selectedYear} />
      default:
        return null
    }
  }, [activeTab, country, selectedYear])

  if (isLoading) {
    return (
      <div className="min-h-screen pb-4" style={{ backgroundColor: '#FFF5F6' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/3 mb-4" style={{ backgroundColor: 'rgba(196, 30, 58, 0.1)' }}></div>
            <div className="h-4 rounded w-1/2 mb-8" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 rounded" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
              <div className="h-32 rounded" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
              <div className="h-32 rounded" style={{ backgroundColor: 'rgba(196, 30, 58, 0.08)' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !country) {
    return (
      <div className="min-h-screen pb-4" style={{ backgroundColor: '#FFF5F6' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}>
            <h2 className="font-semibold text-xl" style={{ color: '#8B1A1A' }}>Country not found</h2>
            <p className="mt-2" style={{ color: '#5C3D2E' }}>
              The country you are looking for does not exist or has been removed.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-4 py-2 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: '#C41E3A' }}
            >
              Back to Map
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-4" style={{ backgroundColor: '#FFF5F6' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E8C8C8', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}>
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <Link to="/" className="font-medium" style={{ color: '#C41E3A' }}>
              World Map
            </Link>
            <span className="mx-2" style={{ color: '#8B7355' }}>/</span>
            <span style={{ color: '#5C3D2E' }}>{country.name_en}</span>
          </nav>

          {/* Country title and info */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#8B1A1A' }}>
                {country.name_en}
              </h1>
              {country.name_native && country.name_native !== country.name_en && (
                <p className="text-xl mb-2" style={{ color: '#5C3D2E' }}>{country.name_native}</p>
              )}
              <div className="flex items-center flex-wrap gap-2 text-sm">
                {country.iso_alpha2 && (
                  <span className="px-2 py-1 rounded font-mono" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>{country.iso_alpha2}</span>
                )}
                {country.iso_alpha3 && (
                  <span className="px-2 py-1 rounded font-mono" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>{country.iso_alpha3}</span>
                )}
                <span className="px-2 py-1 rounded capitalize" style={{ background: 'rgba(212, 160, 23, 0.15)', color: '#8B6914' }}>
                  {country.entity_type.replace('_', ' ')}
                </span>
                <span style={{ color: '#8B7355' }}>
                  {new Date(country.valid_from).getFullYear()}
                  {country.valid_to
                    ? ' - ' + new Date(country.valid_to).getFullYear()
                    : ' - Present'
                  }
                </span>
              </div>
            </div>

            {/* Year indicator and external links */}
            <div className="flex flex-col items-end gap-2">
              <div className="px-3 py-1 rounded-lg font-semibold" style={{ background: 'rgba(212, 160, 23, 0.15)', color: '#8B6914', border: '1px solid rgba(212, 160, 23, 0.3)' }}>
                Viewing: {selectedYear}
              </div>
              <div className="flex gap-2">
                {country.wikidata_id && (
                  <a
                    href={'https://www.wikidata.org/wiki/' + country.wikidata_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A', border: '1px solid rgba(196, 30, 58, 0.3)' }}
                  >
                    Wikidata
                  </a>
                )}
                <a
                  href={'https://en.wikipedia.org/wiki/' + encodeURIComponent(country.name_en)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A', border: '1px solid rgba(196, 30, 58, 0.3)' }}
                >
                  Wikipedia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{ borderBottom: '1px solid #E8C8C8', background: '#FFFFFF' }} className="sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <CountryTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Tab content with Suspense for lazy loading and ErrorBoundary for error handling */}
      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary fallback={<TabErrorFallback />}>
          <Suspense fallback={<TabSkeleton />}>
            {tabContent}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}

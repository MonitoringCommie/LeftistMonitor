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
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

// Tab error fallback
function TabErrorFallback() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <p className="text-yellow-800 font-medium">Unable to load this tab</p>
      <p className="text-yellow-600 text-sm mt-1">Try selecting a different tab or refresh the page.</p>
    </div>
  )
}

const TABS: Array<{ id: string; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'borders', label: 'Border Development' },
  { id: 'occupations', label: 'Occupations' },
  { id: 'elections', label: 'Elections' },
  { id: 'parties', label: 'Parties' },
  { id: 'policies', label: 'Policies' },
  { id: 'people', label: 'People' },
  { id: 'events', label: 'Events' },
  { id: 'conflicts', label: 'Conflicts' },
  { id: 'books', label: 'Books' },
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !country) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold text-xl">Country not found</h2>
            <p className="text-red-600 mt-2">
              The country you are looking for does not exist or has been removed.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Map
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4">
            <Link to="/" className="text-red-600 hover:text-red-700 hover:underline font-medium">
              World Map
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{country.name_en}</span>
          </nav>

          {/* Country title and info */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {country.name_en}
              </h1>
              {country.name_native && country.name_native !== country.name_en && (
                <p className="text-xl text-gray-500 mb-2">{country.name_native}</p>
              )}
              <div className="flex items-center flex-wrap gap-2 text-sm">
                {country.iso_alpha2 && (
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono">{country.iso_alpha2}</span>
                )}
                {country.iso_alpha3 && (
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono">{country.iso_alpha3}</span>
                )}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                  {country.entity_type.replace('_', ' ')}
                </span>
                <span className="text-gray-500">
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
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-semibold">
                Viewing: {selectedYear}
              </div>
              <div className="flex gap-2">
                {country.wikidata_id && (
                  <a
                    href={'https://www.wikidata.org/wiki/' + country.wikidata_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    Wikidata
                  </a>
                )}
                <a
                  href={'https://en.wikipedia.org/wiki/' + encodeURIComponent(country.name_en)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Wikipedia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
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

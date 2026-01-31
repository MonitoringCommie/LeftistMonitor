import { useParams, Link } from 'react-router-dom'
import { useEvent } from '../api/events'

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const CATEGORY_COLORS: Record<string, string> = {
  political: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  military: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  economic: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  social: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  cultural: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  revolution: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  protest: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  election: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Minor',
  2: 'Notable',
  3: 'Significant',
  4: 'Major',
  5: 'Historic',
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, error } = useEvent(id || '')

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h1>
          <Link to="/map" className="text-red-600 hover:underline">Back to Map</Link>
        </div>
      </div>
    )
  }

  const categoryColor = CATEGORY_COLORS[event.category?.toLowerCase()] || CATEGORY_COLORS.default

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/map" className="text-gray-500 dark:text-gray-400 hover:text-red-600">Map</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${categoryColor}`}>
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h1>
                {event.title_native && event.title_native !== event.title && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    {event.title_native}
                  </p>
                )}
              </div>
              {event.importance && (
                <div className="text-right">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= event.importance! ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {IMPORTANCE_LABELS[event.importance] || 'Unknown'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formatDate(event.start_date)}
                  {event.end_date && event.end_date !== event.start_date && (
                    <> - {formatDate(event.end_date)}</>
                  )}
                </span>
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location_name}</span>
                </div>
              )}
              {event.event_type && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  {event.event_type}
                </span>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {event.image_url && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Progressive Analysis */}
          {event.progressive_analysis && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-300">Progressive Analysis</h2>
              <p className="text-red-700 dark:text-red-300 whitespace-pre-wrap leading-relaxed">
                {event.progressive_analysis}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Event Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                <dd className="text-gray-900 dark:text-white capitalize">{event.category}</dd>
              </div>
              {event.event_type && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="text-gray-900 dark:text-white capitalize">{event.event_type}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                <dd className="text-gray-900 dark:text-white">{formatDate(event.start_date)}</dd>
              </div>
              {event.end_date && event.end_date !== event.start_date && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">End Date</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(event.end_date)}</dd>
                </div>
              )}
              {event.location_name && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="text-gray-900 dark:text-white">{event.location_name}</dd>
                </div>
              )}
              {event.importance && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Importance</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {IMPORTANCE_LABELS[event.importance] || `Level ${event.importance}`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Related Country */}
          {event.primary_country_id && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Related Country</h3>
              <Link
                to={`/country/${event.primary_country_id}`}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-900 dark:text-white">View Country</span>
              </Link>
            </div>
          )}

          {/* External Links */}
          {event.wikidata_id && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">External Links</h3>
              <a
                href={`https://www.wikidata.org/wiki/${event.wikidata_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View on Wikidata
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

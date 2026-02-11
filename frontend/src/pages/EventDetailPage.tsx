import { useParams, Link } from 'react-router-dom'
import { useEvent } from '../api/events'

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
          <div className="h-8 rounded w-1/3 mb-4" style={{ background: 'rgba(196, 30, 58, 0.08)' }}></div>
          <div className="h-4 rounded w-2/3 mb-2" style={{ background: 'rgba(196, 30, 58, 0.08)' }}></div>
          <div className="h-4 rounded w-1/2" style={{ background: 'rgba(196, 30, 58, 0.08)' }}></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Event Not Found</h1>
          <Link to="/map" className="hover:underline" style={{ color: '#C41E3A' }}>Back to Map</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/map" className="hover:underline" style={{ color: '#8B7355' }}>Map</Link>
        <span className="mx-2" style={{ color: '#E8C8C8' }}>/</span>
        <span style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                  style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                >
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  {event.title}
                </h1>
                {event.title_native && event.title_native !== event.title && (
                  <p className="text-lg mt-1" style={{ color: '#8B7355' }}>
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
                        className="w-5 h-5"
                        style={{ color: star <= event.importance! ? '#D4A017' : '#E8C8C8' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: '#8B7355' }}>
                    {IMPORTANCE_LABELS[event.importance] || 'Unknown'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#5C3D2E' }}>
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
                <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(196, 30, 58, 0.04)', color: '#5C3D2E' }}>
                  {event.event_type}
                </span>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {event.image_url && (
            <div className="overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '10px' }}>
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Description</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Progressive Analysis */}
          {event.progressive_analysis && (
            <div className="p-6" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', fontFamily: 'Georgia, serif' }}>Progressive Analysis</h2>
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#5C3D2E', fontFamily: 'Georgia, serif' }}>
                {event.progressive_analysis}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Event Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt style={{ color: '#8B7355' }}>Category</dt>
                <dd className="capitalize" style={{ color: '#2C1810' }}>{event.category}</dd>
              </div>
              {event.event_type && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Type</dt>
                  <dd className="capitalize" style={{ color: '#2C1810' }}>{event.event_type}</dd>
                </div>
              )}
              <div>
                <dt style={{ color: '#8B7355' }}>Date</dt>
                <dd style={{ color: '#2C1810' }}>{formatDate(event.start_date)}</dd>
              </div>
              {event.end_date && event.end_date !== event.start_date && (
                <div>
                  <dt style={{ color: '#8B7355' }}>End Date</dt>
                  <dd style={{ color: '#2C1810' }}>{formatDate(event.end_date)}</dd>
                </div>
              )}
              {event.location_name && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Location</dt>
                  <dd style={{ color: '#2C1810' }}>{event.location_name}</dd>
                </div>
              )}
              {event.importance && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Importance</dt>
                  <dd style={{ color: '#2C1810' }}>
                    {IMPORTANCE_LABELS[event.importance] || `Level ${event.importance}`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Related Country */}
          {event.primary_country_id && (
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Related Country</h3>
              <Link
                to={`/country/${event.primary_country_id}`}
                className="flex items-center gap-2 p-3 rounded-lg transition-colors"
                style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}
              >
                <svg className="w-5 h-5" style={{ color: '#8B7355' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ color: '#2C1810' }}>View Country</span>
              </Link>
            </div>
          )}

          {/* External Links */}
          {event.wikidata_id && (
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>External Links</h3>
              <a
                href={`https://www.wikidata.org/wiki/${event.wikidata_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-sm"
                style={{ color: '#C41E3A' }}
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

import { useParams, Link } from 'react-router-dom'
import { usePerson, usePersonConnections } from '../api/people'
import CountryLink from '../components/ui/CountryLink'

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getYear(dateStr?: string): string {
  if (!dateStr) return '?'
  return dateStr.slice(0, 4)
}

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: person, isLoading, error } = usePerson(id || '')
  const { data: connections } = usePersonConnections(id || '', 1)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 skeleton rounded w-1/3 mb-4"></div>
          <div className="h-4 skeleton rounded w-2/3 mb-2"></div>
          <div className="h-4 skeleton rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2C1810' }}>Person Not Found</h1>
          <Link to="/people" style={{ color: '#C41E3A' }} className="hover:underline">Back to People</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/people" style={{ color: '#8B7355' }} className="hover:underline">People</Link>
        <span className="mx-2" style={{ color: '#E8C8C8' }}>/</span>
        <span style={{ color: '#2C1810' }}>{person.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
            <div className="flex gap-6">
              {person.image_url ? (
                <img
                  src={person.image_url}
                  alt={person.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg skeleton flex items-center justify-center text-4xl font-bold" style={{ color: '#8B7355' }}>
                  {person.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-1" style={{ color: '#2C1810' }}>
                  {person.name}
                </h1>
                {person.name_native && (
                  <p className="text-lg mb-2" style={{ color: '#8B7355' }}>{person.name_native}</p>
                )}
                <p className="mb-3" style={{ color: '#5C3D2E' }}>
                  {getYear(person.birth_date)} - {person.death_date ? getYear(person.death_date) : 'Present'}
                </p>
                {person.ideology_tags && person.ideology_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {person.ideology_tags.map((tag) => (
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
            </div>
          </div>

          {/* Biography */}
          {(person.bio_short || person.bio_full) && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Biography</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap" style={{ color: '#5C3D2E' }}>
                  {person.bio_full || person.bio_short}
                </p>
              </div>
            </div>
          )}

          {/* Progressive Analysis */}
          {person.progressive_analysis && (
            <div style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A' }}>Progressive Analysis</h2>
              <p className="whitespace-pre-wrap" style={{ color: '#C41E3A' }}>
                {person.progressive_analysis}
              </p>
            </div>
          )}

          {/* Positions */}
          {person.positions && person.positions.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Political Positions</h2>
              <div className="space-y-3">
                {person.positions.map((pos) => (
                  <div key={pos.id} className="flex justify-between items-start pb-3 last:border-0" style={{ borderBottom: '1px solid #E8C8C8' }}>
                    <div>
                      <p className="font-medium" style={{ color: '#2C1810' }}>{pos.title}</p>
                      {pos.country_name && (
                        <p className="text-sm" style={{ color: '#8B7355' }}>
                          <CountryLink countryId={pos.country_id} countryName={pos.country_name} />
                        </p>
                      )}
                    </div>
                    <div className="text-sm" style={{ color: '#8B7355' }}>
                      {getYear(pos.start_date)} - {pos.end_date ? getYear(pos.end_date) : 'Present'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Books */}
          {person.books && person.books.length > 0 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810' }}>Written Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {person.books.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="p-4 rounded-lg transition-colors"
                    style={{ border: '1px solid #E8C8C8' }}
                  >
                    <p className="font-medium" style={{ color: '#2C1810' }}>{book.title}</p>
                    {book.publication_year && (
                      <p className="text-sm" style={{ color: '#8B7355' }}>{book.publication_year}</p>
                    )}
                    {book.topics && book.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.topics.slice(0, 3).map((topic) => (
                          <span key={topic} className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
            <h3 className="font-semibold mb-4" style={{ color: '#2C1810' }}>Quick Facts</h3>
            <dl className="space-y-3 text-sm">
              {person.birth_date && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Born</dt>
                  <dd style={{ color: '#2C1810' }}>{formatDate(person.birth_date)}</dd>
                  {person.birth_place && (
                    <dd style={{ color: '#5C3D2E' }}>{person.birth_place}</dd>
                  )}
                </div>
              )}
              {person.death_date && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Died</dt>
                  <dd style={{ color: '#2C1810' }}>{formatDate(person.death_date)}</dd>
                  {person.death_place && (
                    <dd style={{ color: '#5C3D2E' }}>{person.death_place}</dd>
                  )}
                </div>
              )}
              {person.person_types && person.person_types.length > 0 && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Roles</dt>
                  <dd style={{ color: '#2C1810' }}>{person.person_types.join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Connections */}
          {connections && connections.nodes && connections.nodes.length > 1 && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810' }}>Connections</h3>
              <div className="space-y-2">
                {connections.nodes
                  .filter(n => n.id !== id)
                  .slice(0, 10)
                  .map((node) => (
                    <Link
                      key={node.id}
                      to={`/person/${node.id}`}
                      className="flex items-center gap-3 p-2 rounded"
                    >
                      {node.image ? (
                        <img src={node.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#5C3D2E' }}>
                          {node.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm" style={{ color: '#2C1810' }}>{node.name}</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {person.wikidata_id && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }} className="p-6">
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810' }}>External Links</h3>
              <div className="space-y-2">
                <a
                  href={`https://www.wikidata.org/wiki/${person.wikidata_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline text-sm"
                  style={{ color: '#C41E3A' }}
                >
                  Wikidata
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

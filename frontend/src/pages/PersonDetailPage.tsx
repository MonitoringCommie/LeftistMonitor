import { useParams, Link } from 'react-router-dom'
import { usePerson, usePersonConnections } from '../api/people'

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
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Person Not Found</h1>
          <Link to="/people" className="text-red-600 hover:underline">Back to People</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/people" className="text-gray-500 dark:text-gray-400 hover:text-red-600">People</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{person.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <div className="flex gap-6">
              {person.image_url ? (
                <img 
                  src={person.image_url} 
                  alt={person.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-400">
                  {person.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {person.name}
                </h1>
                {person.name_native && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">{person.name_native}</p>
                )}
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {getYear(person.birth_date)} - {person.death_date ? getYear(person.death_date) : 'Present'}
                </p>
                {person.ideology_tags && person.ideology_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {person.ideology_tags.map((tag) => (
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
            </div>
          </div>

          {/* Biography */}
          {(person.bio_short || person.bio_full) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Biography</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {person.bio_full || person.bio_short}
                </p>
              </div>
            </div>
          )}

          {/* Progressive Analysis */}
          {person.progressive_analysis && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-300">Progressive Analysis</h2>
              <p className="text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {person.progressive_analysis}
              </p>
            </div>
          )}

          {/* Positions */}
          {person.positions && person.positions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Political Positions</h2>
              <div className="space-y-3">
                {person.positions.map((pos) => (
                  <div key={pos.id} className="flex justify-between items-start border-b dark:border-gray-700 pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{pos.title}</p>
                      {pos.country_name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{pos.country_name}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {getYear(pos.start_date)} - {pos.end_date ? getYear(pos.end_date) : 'Present'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Books */}
          {person.books && person.books.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Written Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {person.books.map((book) => (
                  <Link
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                    {book.publication_year && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{book.publication_year}</p>
                    )}
                    {book.topics && book.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.topics.slice(0, 3).map((topic) => (
                          <span key={topic} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Facts</h3>
            <dl className="space-y-3 text-sm">
              {person.birth_date && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Born</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(person.birth_date)}</dd>
                  {person.birth_place && (
                    <dd className="text-gray-600 dark:text-gray-300">{person.birth_place}</dd>
                  )}
                </div>
              )}
              {person.death_date && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Died</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(person.death_date)}</dd>
                  {person.death_place && (
                    <dd className="text-gray-600 dark:text-gray-300">{person.death_place}</dd>
                  )}
                </div>
              )}
              {person.person_types && person.person_types.length > 0 && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Roles</dt>
                  <dd className="text-gray-900 dark:text-white">{person.person_types.join(', ')}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Connections */}
          {connections && connections.nodes && connections.nodes.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Connections</h3>
              <div className="space-y-2">
                {connections.nodes
                  .filter(n => n.id !== id)
                  .slice(0, 10)
                  .map((node) => (
                    <Link
                      key={node.id}
                      to={`/person/${node.id}`}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {node.image ? (
                        <img src={node.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                          {node.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-gray-900 dark:text-white text-sm">{node.name}</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {person.wikidata_id && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">External Links</h3>
              <div className="space-y-2">
                <a
                  href={`https://www.wikidata.org/wiki/${person.wikidata_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm"
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

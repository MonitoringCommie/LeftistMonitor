import { useParams, Link } from 'react-router-dom'
import { useBook } from '../api/people'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: book, isLoading, error } = useBook(id || '')

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

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book Not Found</h1>
          <Link to="/books" className="text-red-600 hover:underline">Back to Books</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/books" className="text-gray-500 dark:text-gray-400 hover:text-red-600">Books</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <div className="flex gap-6">
              {book.cover_url ? (
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="w-40 h-56 rounded-lg object-cover shadow-md"
                />
              ) : (
                <div className="w-40 h-56 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4 shadow-md">
                  <span className="text-white text-center font-serif text-sm leading-tight">
                    {book.title}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h1>
                {book.title_original && book.title_original !== book.title && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 italic mb-2">
                    {book.title_original}
                  </p>
                )}
                
                {/* Authors */}
                {book.authors && book.authors.length > 0 && (
                  <div className="mb-3">
                    <span className="text-gray-600 dark:text-gray-300">By </span>
                    {book.authors.map((author, idx) => (
                      <span key={author.person_id}>
                        <Link 
                          to={`/person/${author.person_id}`}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          {author.person_name}
                        </Link>
                        {idx < book.authors.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {book.publication_year && (
                    <span>Published: {book.publication_year}</span>
                  )}
                  {book.publisher && (
                    <span>Publisher: {book.publisher}</span>
                  )}
                  {book.book_type && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {book.book_type}
                    </span>
                  )}
                </div>

                {book.topics && book.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {book.topics.map((topic) => (
                      <span 
                        key={topic}
                        className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {book.description}
              </p>
            </div>
          )}

          {/* Significance */}
          {book.significance && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Historical Significance</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {book.significance}
              </p>
            </div>
          )}

          {/* Progressive Analysis */}
          {book.progressive_analysis && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-300">Progressive Analysis</h2>
              <p className="text-red-700 dark:text-red-300 whitespace-pre-wrap leading-relaxed">
                {book.progressive_analysis}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Read Online */}
          {(book.marxists_archive_url || book.gutenberg_url || book.pdf_url) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Read Online</h3>
              <div className="space-y-2">
                {book.marxists_archive_url && (
                  <a
                    href={book.marxists_archive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                    </svg>
                    Marxists Archive
                  </a>
                )}
                {book.gutenberg_url && (
                  <a
                    href={book.gutenberg_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    Project Gutenberg
                  </a>
                )}
                {book.pdf_url && (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                    </svg>
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Book Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Details</h3>
            <dl className="space-y-3 text-sm">
              {book.isbn && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">ISBN</dt>
                  <dd className="text-gray-900 dark:text-white font-mono">{book.isbn}</dd>
                </div>
              )}
              {book.book_type && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="text-gray-900 dark:text-white capitalize">{book.book_type}</dd>
                </div>
              )}
              {book.publication_year && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Year</dt>
                  <dd className="text-gray-900 dark:text-white">{book.publication_year}</dd>
                </div>
              )}
              {book.publisher && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Publisher</dt>
                  <dd className="text-gray-900 dark:text-white">{book.publisher}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* External Links */}
          {book.wikidata_id && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">External Links</h3>
              <a
                href={`https://www.wikidata.org/wiki/${book.wikidata_id}`}
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

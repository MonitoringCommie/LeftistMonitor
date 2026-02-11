import { useParams, Link } from 'react-router-dom'
import { useBook } from '../api/people'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: book, isLoading, error } = useBook(id || '')

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

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Book Not Found</h1>
          <Link to="/books" className="hover:underline" style={{ color: '#C41E3A' }}>Back to Books</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/books" className="hover:underline" style={{ color: '#8B7355' }}>Books</Link>
        <span className="mx-2" style={{ color: '#E8C8C8' }}>/</span>
        <span style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <div className="flex gap-6">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-40 h-56 rounded-lg object-cover shadow-md"
                />
              ) : (
                <div className="w-40 h-56 rounded-lg flex items-center justify-center p-4 shadow-md" style={{ background: 'linear-gradient(to bottom right, #C41E3A, #8B1A1A)' }}>
                  <span className="text-white text-center font-serif text-sm leading-tight">
                    {book.title}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                  {book.title}
                </h1>
                {book.title_original && book.title_original !== book.title && (
                  <p className="text-lg italic mb-2" style={{ color: '#8B7355' }}>
                    {book.title_original}
                  </p>
                )}

                {/* Authors */}
                {book.authors && book.authors.length > 0 && (
                  <div className="mb-3">
                    <span style={{ color: '#5C3D2E' }}>By </span>
                    {book.authors.map((author, idx) => (
                      <span key={author.person_id}>
                        <Link
                          to={`/person/${author.person_id}`}
                          className="hover:underline"
                          style={{ color: '#C41E3A' }}
                        >
                          {author.person_name}
                        </Link>
                        {idx < book.authors.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: '#5C3D2E' }}>
                  {book.publication_year && (
                    <span>Published: {book.publication_year}</span>
                  )}
                  {book.publisher && (
                    <span>Publisher: {book.publisher}</span>
                  )}
                  {book.book_type && (
                    <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(196, 30, 58, 0.04)', color: '#5C3D2E' }}>
                      {book.book_type}
                    </span>
                  )}
                </div>

                {book.topics && book.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {book.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}
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
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Description</h2>
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                {book.description}
              </p>
            </div>
          )}

          {/* Significance */}
          {book.significance && (
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Historical Significance</h2>
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>
                {book.significance}
              </p>
            </div>
          )}

          {/* Progressive Analysis */}
          {book.progressive_analysis && (
            <div className="p-6" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A', fontFamily: 'Georgia, serif' }}>Progressive Analysis</h2>
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#5C3D2E', fontFamily: 'Georgia, serif' }}>
                {book.progressive_analysis}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Read Online */}
          {(book.marxists_archive_url || book.gutenberg_url || book.pdf_url) && (
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Read Online</h3>
              <div className="space-y-2">
                {book.marxists_archive_url && (
                  <a
                    href={book.marxists_archive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors"
                    style={{ background: 'rgba(196, 30, 58, 0.06)', color: '#C41E3A', border: '1px solid #E8C8C8' }}
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
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors"
                    style={{ background: 'rgba(196, 30, 58, 0.04)', color: '#5C3D2E', border: '1px solid #E8C8C8' }}
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
                    className="flex items-center gap-2 p-3 rounded-lg transition-colors"
                    style={{ background: 'rgba(196, 30, 58, 0.04)', color: '#5C3D2E', border: '1px solid #E8C8C8' }}
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
          <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Details</h3>
            <dl className="space-y-3 text-sm">
              {book.isbn && (
                <div>
                  <dt style={{ color: '#8B7355' }}>ISBN</dt>
                  <dd className="font-mono" style={{ color: '#2C1810' }}>{book.isbn}</dd>
                </div>
              )}
              {book.book_type && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Type</dt>
                  <dd className="capitalize" style={{ color: '#2C1810' }}>{book.book_type}</dd>
                </div>
              )}
              {book.publication_year && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Year</dt>
                  <dd style={{ color: '#2C1810' }}>{book.publication_year}</dd>
                </div>
              )}
              {book.publisher && (
                <div>
                  <dt style={{ color: '#8B7355' }}>Publisher</dt>
                  <dd style={{ color: '#2C1810' }}>{book.publisher}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* External Links */}
          {book.wikidata_id && (
            <div className="p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>External Links</h3>
              <a
                href={`https://www.wikidata.org/wiki/${book.wikidata_id}`}
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

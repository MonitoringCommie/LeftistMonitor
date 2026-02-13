import { memo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

interface Book {
  id: string
  title: string
  title_original?: string
  publication_year?: number
  publisher?: string
  book_type?: string
  topics: string[]
  description?: string
  significance?: string
  progressive_analysis?: string
  marxists_archive_url?: string
  gutenberg_url?: string
  wikipedia_url?: string
  cover_url?: string
  authors: { id: string; name: string; role: string }[]
}

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

async function fetchBooks(params: {
  skip?: number
  limit?: number
  book_type?: string
  topic?: string
  search?: string
}): Promise<Book[]> {
  const searchParams = new URLSearchParams()
  if (params.skip) searchParams.set('skip', String(params.skip))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.book_type) searchParams.set('book_type', params.book_type)
  if (params.topic) searchParams.set('topic', params.topic)
  if (params.search) searchParams.set('search', params.search)

  const res = await fetch(`${API_BASE}/books?${searchParams}`)
  if (!res.ok) throw new Error('Failed to fetch books')
  return res.json()
}

async function fetchBookTypes(): Promise<{ types: string[] }> {
  const res = await fetch(`${API_BASE}/books/types`)
  if (!res.ok) throw new Error('Failed to fetch book types')
  return res.json()
}

async function fetchTopics(): Promise<{ topics: string[] }> {
  const res = await fetch(`${API_BASE}/books/topics`)
  if (!res.ok) throw new Error('Failed to fetch topics')
  return res.json()
}

const BookCard = memo(function BookCard({ book }: { book: Book }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8C8C8',
      borderLeft: '4px solid #C41E3A',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
    }} className="overflow-hidden transition-shadow hover:shadow-md"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 30, 58, 0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 26, 26, 0.08)'
      }}
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Book cover placeholder */}
          <div className="w-20 h-28 rounded flex-shrink-0 flex items-center justify-center" style={{
            background: 'rgba(196, 30, 58, 0.06)',
            border: '1px solid rgba(196, 30, 58, 0.2)'
          }}>
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <svg className="w-8 h-8" style={{ color: '#C41E3A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link to={`/book/${book.id}`} style={{ color: '#2C1810' }} className="text-lg font-bold truncate block hover:underline"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C41E3A' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#2C1810' }}
            >
              {book.title}
            </Link>

            {book.authors.length > 0 && (
              <p style={{ color: '#5C3D2E' }} className="text-sm">
                {book.authors.map((a, i) => (<span key={a.id}>{i > 0 && ", "}<Link to={`/person/${a.id}`} style={{ color: '#5C3D2E' }} className="hover:underline"
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#C41E3A' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#5C3D2E' }}
                >{a.name}</Link></span>))}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: '#8B7355' }}>
              {book.publication_year && <span>{book.publication_year}</span>}
              {book.book_type && (
                <span style={{
                  background: 'rgba(196, 30, 58, 0.1)',
                  color: '#C41E3A'
                }} className="px-2 py-0.5 rounded text-xs">
                  {book.book_type.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {book.description && (
          <p className={`mt-3 text-sm ${expanded ? '' : 'line-clamp-2'}`} style={{ color: '#5C3D2E' }}>
            {book.description}
          </p>
        )}

        {book.description && book.description.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ color: '#C41E3A' }}
            className="text-sm mt-1 hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Topics */}
        {book.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {book.topics.slice(0, expanded ? undefined : 3).map((topic, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(196, 30, 58, 0.1)',
                  color: '#C41E3A'
                }}
                className="px-2 py-0.5 rounded text-xs"
              >
                {topic}
              </span>
            ))}
            {!expanded && book.topics.length > 3 && (
              <span style={{ color: '#8B7355' }} className="text-xs">+{book.topics.length - 3} more</span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2 mt-3">
          {book.marxists_archive_url && (
            <a
              href={book.marxists_archive_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#C41E3A',
                color: '#fff'
              }}
              className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
            >
              Read Free
            </a>
          )}
          {book.wikipedia_url && (
            <a
              href={book.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(196, 30, 58, 0.08)',
                color: '#C41E3A',
                border: '1px solid rgba(196, 30, 58, 0.3)'
              }}
              className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
            >
              Wikipedia
            </a>
          )}
        </div>
      </div>
    </div>
  )
})

const BooksPage = memo(function BooksPage() {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(initialSearch)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books', debouncedSearch, selectedType, selectedTopic],
    queryFn: () => fetchBooks({
      limit: 100,
      search: debouncedSearch || undefined,
      book_type: selectedType || undefined,
      topic: selectedTopic || undefined,
    }),
  })

  const { data: typesData } = useQuery({
    queryKey: ['book-types'],
    queryFn: fetchBookTypes,
  })

  const { data: topicsData } = useQuery({
    queryKey: ['book-topics'],
    queryFn: fetchTopics,
  })

  const bookTypes = typesData?.types || []
  const topics = topicsData?.topics || []

  return (
    <div style={{ backgroundColor: '#FFF5F6' }} className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ color: '#8B1A1A' }} className="text-4xl font-bold mb-4">
            Leftist Literature
          </h1>
          <p style={{ color: '#5C3D2E' }} className="text-xl">
            Browse {(books?.length ?? 0).toLocaleString()}+ political books, pamphlets, and writings from around the world.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
        }} className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search books by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  borderColor: '#E8C8C8',
                  color: '#2C1810'
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C41E3A'
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E8C8C8'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span style={{ color: '#8B7355' }} className="text-sm py-1">Type:</span>
              <button
                onClick={() => setSelectedType(null)}
                style={{
                  background: !selectedType ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                  color: !selectedType ? '#fff' : '#C41E3A',
                  border: !selectedType ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)',
                  borderRadius: '9999px'
                }}
                className="px-3 py-1 text-sm transition-colors"
              >
                All
              </button>
              {bookTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    background: selectedType === type ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                    color: selectedType === type ? '#fff' : '#C41E3A',
                    border: selectedType === type ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)',
                    borderRadius: '9999px'
                  }}
                  className="px-3 py-1 text-sm transition-colors capitalize"
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Topic Filter */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span style={{ color: '#8B7355' }} className="text-sm py-1">Topic:</span>
                <button
                  onClick={() => setSelectedTopic(null)}
                  style={{
                    background: !selectedTopic ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                    color: !selectedTopic ? '#fff' : '#C41E3A',
                    border: !selectedTopic ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)',
                    borderRadius: '9999px'
                  }}
                  className="px-3 py-1 text-sm transition-colors"
                >
                  All
                </button>
                {topics.slice(0, 15).map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      background: selectedTopic === topic ? '#C41E3A' : 'rgba(196, 30, 58, 0.08)',
                      color: selectedTopic === topic ? '#fff' : '#C41E3A',
                      border: selectedTopic === topic ? '1px solid #C41E3A' : '1px solid rgba(196, 30, 58, 0.3)',
                      borderRadius: '9999px'
                    }}
                    className="px-3 py-1 text-sm transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <p style={{ color: '#8B7355' }} className="mb-4">
          {isLoading ? 'Loading...' : `Showing ${books?.length || 0} books`}
        </p>

        {/* Error State */}
        {error && (
          <div style={{
            background: 'rgba(196, 30, 58, 0.06)',
            border: '1px solid rgba(196, 30, 58, 0.3)',
            borderRadius: '10px'
          }} className="p-4 mb-6">
            <p style={{ color: '#C41E3A' }}>
              Failed to load books. The API may not be running.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderRadius: '10px'
              }} className="p-4 animate-pulse">
                <div className="flex gap-4">
                  <div style={{ background: '#F5DEB3' }} className="w-20 h-28 rounded" />
                  <div className="flex-1">
                    <div style={{ background: '#F5DEB3' }} className="h-5 rounded w-3/4 mb-2" />
                    <div style={{ background: '#F5DEB3' }} className="h-4 rounded w-1/2 mb-2" />
                    <div style={{ background: '#F5DEB3' }} className="h-3 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Books Grid */}
        {!isLoading && books && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && books?.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#E8C8C8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p style={{ color: '#8B7355' }} className="text-lg">
              No books found matching your criteria.
            </p>
          </div>
        )}

        {/* Educational Note */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderTop: '3px solid #C41E3A',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
        }} className="mt-8 p-6">
          <h2 style={{ color: '#8B1A1A' }} className="text-xl font-bold mb-2 uppercase tracking-wider text-sm">
            Why These Books Matter
          </h2>
          <p style={{ color: '#5C3D2E' }}>
            These books cover political theory, history, economics, and social movements
            from across the globe. Many are available free at{' '}
            <a
              href="https://www.marxists.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#C41E3A' }}
              className="hover:underline"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#8B1A1A' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#C41E3A' }}
            >
              marxists.org
            </a>.
          </p>
        </div>

        {/* Back to Map */}
        <div className="text-center mt-8">
          <Link
            to="/"
            style={{
              background: '#C41E3A',
              color: '#fff'
            }}
            className="inline-block font-bold py-3 px-6 rounded-lg transition-opacity hover:opacity-80"
          >
            Explore the Map
          </Link>
        </div>
      </div>
    </div>
  )
})

export default BooksPage

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
  cover_image_url?: string
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex gap-4">
          {/* Book cover placeholder */}
          <div className="w-20 h-28 bg-red-100 dark:bg-red-900/30 rounded flex-shrink-0 flex items-center justify-center">
            {book.cover_image_url ? (
              <img 
                src={book.cover_image_url} 
                alt={book.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {book.title}
            </h3>
            
            {book.authors.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {book.authors.map(a => a.name).join(', ')}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-500">
              {book.publication_year && <span>{book.publication_year}</span>}
              {book.book_type && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs">
                  {book.book_type.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {book.description && (
          <p className={`mt-3 text-gray-700 dark:text-gray-300 text-sm ${expanded ? '' : 'line-clamp-2'}`}>
            {book.description}
          </p>
        )}
        
        {book.description && book.description.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-red-600 dark:text-red-500 text-sm mt-1 hover:underline"
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
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
              >
                {topic}
              </span>
            ))}
            {!expanded && book.topics.length > 3 && (
              <span className="text-gray-500 text-xs">+{book.topics.length - 3} more</span>
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
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Read Free
            </a>
          )}
          {book.wikipedia_url && (
            <a
              href={book.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Leftist Literature
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Essential texts for understanding class struggle, imperialism, and liberation movements.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search books by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm py-1">Type:</span>
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !selectedType 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {bookTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                    selectedType === type 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            {/* Topic Filter */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm py-1">Topic:</span>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    !selectedTopic 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {topics.slice(0, 15).map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTopic === topic 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {isLoading ? 'Loading...' : `Showing ${books?.length || 0} books`}
        </p>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">
              Failed to load books. The API may not be running.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
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
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No books found matching your criteria.
            </p>
          </div>
        )}

        {/* Educational Note */}
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-700 dark:text-red-500 mb-2">
            Why These Books Matter
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Understanding theory is essential for effective praxis. These texts provide the analytical
            framework to understand capitalism, imperialism, and the strategies of liberation movements
            throughout history. Many are available free at{' '}
            <a 
              href="https://www.marxists.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 dark:text-red-500 hover:underline"
            >
              marxists.org
            </a>.
          </p>
        </div>

        {/* Back to Map */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Explore the Map
          </Link>
        </div>
      </div>
    </div>
  )
})

export default BooksPage

import { useState, useMemo, useCallback, memo } from 'react'
import { useBooks, useBook } from '../../api/people'
import OptimizedImage from '../ui/OptimizedImage'

interface BooksTabProps {
  countryId: string
  year?: number
}

// Move outside component
const BOOK_TYPE_COLORS: Record<string, string> = {
  political_theory: 'bg-red-100 text-red-700',
  manifesto: 'bg-red-200 text-red-800',
  history: 'bg-blue-100 text-blue-700',
  economics: 'bg-green-100 text-green-700',
  philosophy: 'bg-purple-100 text-purple-700',
  memoir: 'bg-orange-100 text-orange-700',
}

const BOOK_TYPES = ['political_theory', 'manifesto', 'history', 'economics', 'philosophy', 'memoir'] as const

// Memoized book card
const BookCard = memo(function BookCard({
  book,
  isSelected,
  isNearYear,
  year,
  onClick,
}: {
  book: any
  isSelected: boolean
  isNearYear: boolean
  year?: number
  onClick: () => void
}) {
  const typeColor = BOOK_TYPE_COLORS[book.book_type || ''] || 'bg-gray-100 text-gray-700'
  
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-3 rounded-lg border transition-colors w-full
        ${isSelected
          ? 'bg-blue-50 border-blue-300'
          : isNearYear
            ? 'bg-white border-amber-200 hover:bg-amber-50'
            : 'bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <OptimizedImage
          src={book.cover_url}
          alt={book.title}
          width={48}
          height={64}
          className="rounded flex-shrink-0 object-cover"
          fallbackIcon="book"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="font-medium line-clamp-2">{book.title}</h5>
            {isNearYear && (
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title={`Published near ${year}`} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {book.publication_year && (
              <span className="text-xs text-gray-500">{book.publication_year}</span>
            )}
            {book.book_type && (
              <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${typeColor}`}>
                {book.book_type.replace('_', ' ')}
              </span>
            )}
          </div>
          {book.topics && book.topics.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {book.topics.slice(0, 3).map((topic: string) => (
                <span key={topic} className="text-xs text-gray-500">#{topic}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
})

const BooksTab = memo(function BooksTab({ countryId, year }: BooksTabProps) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('')

  const { data: booksData, isLoading } = useBooks(countryId, filterType || undefined)
  const { data: bookDetail } = useBook(selectedBookId || '')

  const books = useMemo(() => booksData?.items || [], [booksData])

  // Memoize year check function
  const isNearYear = useCallback((publicationYear?: number) => {
    if (!publicationYear || !year) return false
    return Math.abs(publicationYear - year) <= 5
  }, [year])

  // Pre-compute near-year books for quick lookup
  const nearYearBookIds = useMemo(() => 
    new Set(books.filter(b => isNearYear(b.publication_year)).map(b => b.id)),
    [books, isNearYear]
  )

  const handleFilterChange = useCallback((type: string) => {
    setFilterType(type)
  }, [])

  const handleSelectBook = useCallback((id: string) => {
    setSelectedBookId(id)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by book type">
        <button
          onClick={() => handleFilterChange('')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filterType === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {BOOK_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
              filterType === type
                ? 'bg-gray-800 text-white'
                : `${BOOK_TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'} hover:opacity-80`
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {year && (
        <div className="text-xs text-gray-500">
          Showing all books. Books near {year} are highlighted
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No books data available for this country.</div>
      ) : (
        <div className="grid gap-3">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isSelected={selectedBookId === book.id}
              isNearYear={nearYearBookIds.has(book.id)}
              year={year}
              onClick={() => handleSelectBook(book.id)}
            />
          ))}
        </div>
      )}

      {bookDetail && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex items-start gap-4">
            <OptimizedImage
              src={bookDetail.cover_url}
              alt={bookDetail.title}
              width={96}
              height={128}
              className="rounded object-cover"
              fallbackIcon="book"
            />
            <div>
              <h3 className="text-lg font-semibold">{bookDetail.title}</h3>
              {bookDetail.title_original && bookDetail.title_original !== bookDetail.title && (
                <p className="text-sm text-gray-500 italic">{bookDetail.title_original}</p>
              )}
              {bookDetail.authors && bookDetail.authors.length > 0 && (
                <p className="text-sm mt-1">
                  By {bookDetail.authors.map((a: any) => a.person_name).join(', ')}
                </p>
              )}
              <div className="text-sm text-gray-500 mt-1">
                {bookDetail.publication_year && <span>{bookDetail.publication_year}</span>}
                {bookDetail.publisher && <span> • {bookDetail.publisher}</span>}
              </div>
            </div>
          </div>

          {bookDetail.description && (
            <p className="text-sm text-gray-600">{bookDetail.description}</p>
          )}

          {bookDetail.significance && (
            <div className="bg-blue-50 rounded p-3">
              <h5 className="text-xs font-medium text-blue-800 mb-1">Significance</h5>
              <p className="text-sm text-blue-700">{bookDetail.significance}</p>
            </div>
          )}

          {bookDetail.progressive_analysis && (
            <div className="bg-red-50 rounded p-3">
              <h5 className="text-xs font-medium text-red-800 mb-1">Progressive Analysis</h5>
              <p className="text-sm text-red-700">{bookDetail.progressive_analysis}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {bookDetail.marxists_archive_url && (
              <a
                href={bookDetail.marxists_archive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Read on Marxists.org
              </a>
            )}
            {bookDetail.gutenberg_url && (
              <a
                href={bookDetail.gutenberg_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Project Gutenberg
              </a>
            )}
            {bookDetail.pdf_url && (
              <a
                href={bookDetail.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Download PDF
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default BooksTab

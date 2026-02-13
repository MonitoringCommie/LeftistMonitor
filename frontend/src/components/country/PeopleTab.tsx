import { useState, useMemo, useCallback, memo } from 'react'
import { usePeople, usePerson, usePersonConnections } from '../../api/people'
import ConnectionsGraph from './ConnectionsGraph'
import OptimizedImage from '../ui/OptimizedImage'
import CountryLink from '../ui/CountryLink'

interface PeopleTabProps {
  countryId: string
  year: number
}

// Move outside component
const PERSON_TYPE_COLORS: Record<string, string> = {
  politician: 'bg-blue-100 text-blue-700',
  activist: 'bg-red-100 text-red-700',
  writer: 'bg-purple-100 text-purple-700',
  philosopher: 'bg-indigo-100 text-indigo-700',
  economist: 'bg-green-100 text-green-700',
  revolutionary: 'bg-red-200 text-red-800',
  labor_leader: 'bg-orange-100 text-orange-700',
  artist: 'bg-pink-100 text-pink-700',
}

const PERSON_TYPES = ['politician', 'activist', 'writer', 'philosopher', 'economist', 'revolutionary', 'labor_leader', 'artist'] as const

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '?'
  return new Date(dateStr).getFullYear().toString()
}

// Memoized person card
const PersonCard = memo(function PersonCard({
  person,
  isSelected,
  isAlive,
  year,
  onClick,
}: {
  person: any
  isSelected: boolean
  isAlive: boolean
  year: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-3 rounded-lg border transition-colors w-full
        ${isSelected
          ? 'bg-blue-50 border-blue-300'
          : isAlive
            ? 'bg-white border-green-200 hover:bg-green-50'
            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <OptimizedImage
          src={person.image_url}
          alt={person.name}
          width={48}
          height={48}
          className={`rounded-full object-cover flex-shrink-0 ${!isAlive ? 'opacity-60' : ''}`}
          fallbackIcon="person"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className={`font-medium ${!isAlive ? 'text-gray-500' : ''}`}>{person.name}</h5>
            {isAlive && (
              <span className="w-2 h-2 rounded-full bg-green-500" title={`Alive in ${year}`} />
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatDate(person.birth_date)} - {formatDate(person.death_date)}
          </p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {person.person_types?.slice(0, 3).map((type: string) => (
              <span
                key={type}
                className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                  PERSON_TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {type.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
      {person.bio_short && (
        <p className={`text-sm mt-2 line-clamp-2 ${!isAlive ? 'text-gray-400' : 'text-gray-600'}`}>
          {person.bio_short}
        </p>
      )}
    </button>
  )
})

const PeopleTab = memo(function PeopleTab({ countryId, year }: PeopleTabProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('')
  const [showGraph, setShowGraph] = useState(false)

  const { data: peopleData, isLoading } = usePeople(countryId, undefined, filterType || undefined)
  const { data: personDetail } = usePerson(selectedPersonId || '')
  const { data: connectionsData } = usePersonConnections(selectedPersonId || '', 2)

  const people = useMemo(() => {
    const items = peopleData?.items || []
    return [...items].sort((a, b) => {
      const dateA = a.birth_date ? new Date(a.birth_date).getTime() : 0
      const dateB = b.birth_date ? new Date(b.birth_date).getTime() : 0
      return dateB - dateA
    })
  }, [peopleData])

  // Memoize alive check
  const wasAliveInYear = useCallback((person: typeof people[0]) => {
    const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : 0
    const deathYear = person.death_date ? new Date(person.death_date).getFullYear() : 9999
    return year >= birthYear && year <= deathYear
  }, [year])

  // Pre-compute alive person IDs
  const alivePersonIds = useMemo(() =>
    new Set(people.filter(wasAliveInYear).map(p => p.id)),
    [people, wasAliveInYear]
  )

  const handleFilterChange = useCallback((type: string) => {
    setFilterType(type)
  }, [])

  const handleSelectPerson = useCallback((id: string) => {
    setSelectedPersonId(id)
    setShowGraph(false)
  }, [])

  const handleToggleGraph = useCallback(() => {
    setShowGraph(prev => !prev)
  }, [])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedPersonId(nodeId)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by person type">
        <button
          onClick={() => handleFilterChange('')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filterType === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {PERSON_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
              filterType === type
                ? 'bg-gray-800 text-white'
                : `${PERSON_TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'} hover:opacity-80`
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        Showing all people. Those alive in {year} are highlighted
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 rounded-lg skeleton"></div>
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No people data available for this country.</div>
      ) : (
        <div className="grid gap-3">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              isSelected={selectedPersonId === person.id}
              isAlive={alivePersonIds.has(person.id)}
              year={year}
              onClick={() => handleSelectPerson(person.id)}
            />
          ))}
        </div>
      )}

      {personDetail && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="flex items-start gap-4">
            <OptimizedImage
              src={personDetail.image_url}
              alt={personDetail.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
              fallbackIcon="person"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{personDetail.name}</h3>
              {personDetail.name_native && (
                <p className="text-sm text-gray-500">{personDetail.name_native}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {personDetail.birth_place && `Born: ${personDetail.birth_place}`}
                {personDetail.birth_date && ` (${formatDate(personDetail.birth_date)})`}
              </p>
              {personDetail.death_date && (
                <p className="text-sm text-gray-600">
                  {personDetail.death_place && `Died: ${personDetail.death_place}`}
                  {` (${formatDate(personDetail.death_date)})`}
                </p>
              )}
            </div>
          </div>

          {personDetail.ideology_tags && personDetail.ideology_tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {personDetail.ideology_tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 capitalize">
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}

          {personDetail.bio_full && (
            <p className="text-sm text-gray-600">{personDetail.bio_full}</p>
          )}

          {personDetail.progressive_analysis && (
            <div className="bg-red-50 rounded p-3">
              <h5 className="text-xs font-medium text-red-800 mb-1">Progressive Analysis</h5>
              <p className="text-sm text-red-700">{personDetail.progressive_analysis}</p>
            </div>
          )}

          {personDetail.positions && personDetail.positions.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">Positions Held</h5>
              <div className="space-y-1">
                {personDetail.positions.map((pos: any) => (
                  <div key={pos.id} className="text-sm">
                    <span className="font-medium">{pos.title}</span>
                    {pos.country_name && <span className="text-gray-500"> (<CountryLink countryId={pos.country_id} countryName={pos.country_name} />)</span>}
                    <span className="text-gray-400 ml-2">
                      {pos.start_date && formatDate(pos.start_date)}
                      {pos.end_date && ` - ${formatDate(pos.end_date)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {personDetail.connections && personDetail.connections.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium">Connections</h5>
                <button
                  onClick={handleToggleGraph}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  {showGraph ? 'Hide Graph' : 'Show Graph'}
                </button>
              </div>

              {showGraph && connectionsData && (
                <div className="mb-4">
                  <ConnectionsGraph
                    data={connectionsData}
                    width={350}
                    height={250}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {personDetail.connections.map((conn: any) => (
                  <div key={conn.id} className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm">
                    <span className="text-gray-500 text-xs capitalize">{conn.connection_type.replace('_', ' ')}</span>
                    <span className="font-medium">{conn.person_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {personDetail.books && personDetail.books.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2">Notable Works</h5>
              <div className="space-y-1">
                {personDetail.books.map((book: any) => (
                  <div key={book.id} className="text-sm">
                    <span className="font-medium">{book.title}</span>
                    {book.publication_year && (
                      <span className="text-gray-500 ml-2">({book.publication_year})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default PeopleTab

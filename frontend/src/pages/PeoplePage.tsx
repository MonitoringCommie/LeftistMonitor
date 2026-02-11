import { Link } from "react-router-dom"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../api/client"

interface PersonListItem {
  id: string
  name: string
  name_native?: string
  birth_date?: string
  death_date?: string
  person_types?: string[]
  ideology_tags?: string[]
  bio_short?: string
  image_url?: string
  primary_country_id?: string
}

interface PaginatedResponse {
  items: PersonListItem[]
  total: number
  page: number
  per_page: number
  pages: number
}

const PERSON_TYPES = [
  { value: "", label: "All Types" },
  { value: "politician", label: "Politicians" },
  { value: "revolutionary", label: "Revolutionaries" },
  { value: "activist", label: "Activists" },
  { value: "theorist", label: "Theorists" },
  { value: "organizer", label: "Organizers" },
]

function useAllPeople(page: number, personType?: string, search?: string) {
  return useQuery({
    queryKey: ["all-people", page, personType, search],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse>("/people/", {
        params: { page, per_page: 50, person_type: personType || undefined, search: search || undefined },
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

const getYear = (dateStr?: string): number | null => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date.getFullYear()
}

export default function PeoplePage() {
  const [page, setPage] = useState(1)
  const [personType, setPersonType] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading, error } = useAllPeople(page, personType, searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setPage(1)
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "politician": return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }
      case "revolutionary": return { bg: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }
      case "activist": return { bg: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }
      case "theorist": return { bg: 'rgba(147, 51, 234, 0.1)', color: '#7c3aed' }
      case "organizer": return { bg: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }
      default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
    }
  }

  return (
    <div style={{ backgroundColor: '#FFF5F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 style={{ color: '#8B1A1A' }} className="text-3xl font-bold mb-2">Political Figures</h1>
          <p style={{ color: '#5C3D2E' }}>Browse revolutionary figures, politicians, and activists</p>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
        }} className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search people..."
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#E8C8C8',
                    color: '#2C1810'
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E8C8C8'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#C41E3A',
                    color: '#fff'
                  }}
                  className="px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                >
                  Search
                </button>
              </div>
            </form>
            <select
              value={personType}
              onChange={(e) => { setPersonType(e.target.value); setPage(1) }}
              style={{
                background: '#FFFFFF',
                borderColor: '#E8C8C8',
                color: '#2C1810'
              }}
              className="px-4 py-2 border rounded-lg"
            >
              {PERSON_TYPES.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: '#FFFFFF',
                border: '1px solid #E8C8C8',
                borderRadius: '10px'
              }} className="p-4 animate-pulse">
                <div style={{ background: '#F5DEB3' }} className="h-5 rounded w-3/4 mb-2"></div>
                <div style={{ background: '#F5DEB3' }} className="h-4 rounded w-1/4 mb-2"></div>
                <div style={{ background: '#F5DEB3' }} className="h-3 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p style={{ color: '#C41E3A' }}>Failed to load people data. Please try again later.</p>
          </div>
        ) : !data?.items?.length ? (
          <div className="text-center py-12" style={{ color: '#8B7355' }}>No people found.</div>
        ) : (
          <>
            <p style={{ color: '#8B7355' }} className="text-sm mb-4">
              Showing {data.items.length} of {data.total} people
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((person) => {
                const birthYear = getYear(person.birth_date)
                const deathYear = getYear(person.death_date)
                const primaryType = person.person_types?.[0]
                const typeColors = getTypeColor(primaryType)

                return (
                  <Link
                    key={person.id}
                    to={`/person/${person.id}`}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8C8C8',
                      borderLeft: '4px solid #C41E3A',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)'
                    }}
                    className="p-4 transition-all block hover:shadow-md"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#C41E3A'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 30, 58, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E8C8C8'
                      e.currentTarget.style.borderLeft = '4px solid #C41E3A'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 26, 26, 0.08)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {person.image_url ? (
                          <img src={person.image_url} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div style={{
                            background: 'rgba(196, 30, 58, 0.1)',
                            border: '1px solid rgba(196, 30, 58, 0.3)'
                          }} className="w-10 h-10 rounded-full flex items-center justify-center">
                            <span style={{ color: '#C41E3A' }} className="text-sm">{person.name.charAt(0)}</span>
                          </div>
                        )}
                        <h3 style={{ color: '#2C1810' }} className="font-semibold">{person.name}</h3>
                      </div>
                      {primaryType && (
                        <span style={{
                          background: typeColors.bg,
                          color: typeColors.color,
                          border: `1px solid ${typeColors.color}33`
                        }} className="text-xs px-2 py-1 rounded-full">
                          {primaryType}
                        </span>
                      )}
                    </div>
                    <div className="text-sm mb-2" style={{ color: '#8B7355' }}>
                      {birthYear && <span>{birthYear}{deathYear ? " - " + deathYear : " - present"}</span>}
                    </div>
                    {person.bio_short && (
                      <p style={{ color: '#5C3D2E' }} className="text-sm line-clamp-2">{person.bio_short}</p>
                    )}
                    {person.ideology_tags && person.ideology_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {person.ideology_tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(196, 30, 58, 0.1)',
                              color: '#C41E3A'
                            }}
                            className="text-xs px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
            {data.pages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    background: 'rgba(196, 30, 58, 0.08)',
                    color: '#C41E3A',
                    border: '1px solid rgba(196, 30, 58, 0.3)',
                    borderRadius: '10px'
                  }}
                  className="px-4 py-2 disabled:opacity-50 transition-opacity"
                >
                  Previous
                </button>
                <span style={{ color: '#5C3D2E' }}>Page {page} of {data.pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  style={{
                    background: 'rgba(196, 30, 58, 0.08)',
                    color: '#C41E3A',
                    border: '1px solid rgba(196, 30, 58, 0.3)',
                    borderRadius: '10px'
                  }}
                  className="px-4 py-2 disabled:opacity-50 transition-opacity"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

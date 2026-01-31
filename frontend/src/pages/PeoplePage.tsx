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
      const { data } = await apiClient.get<PaginatedResponse>("/people/people", {
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
      case "politician": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "revolutionary": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "activist": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "theorist": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "organizer": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Political Figures</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse revolutionary figures, politicians, and activists</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <form onSubmit={handleSearch} className="flex-1 min-w-[250px]">
              <div className="flex gap-2">
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search people..." className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Search</button>
              </div>
            </form>
            <select value={personType} onChange={(e) => { setPersonType(e.target.value); setPage(1) }}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              {PERSON_TYPES.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 dark:text-red-400">Failed to load people data. Please try again later.</p>
          </div>
        ) : !data?.items?.length ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No people found.</div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Showing {data.items.length} of {data.total} people
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((person) => {
                const birthYear = getYear(person.birth_date)
                const deathYear = getYear(person.death_date)
                const primaryType = person.person_types?.[0]

                return (
                  <Link key={person.id} to={`/person/${person.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow block">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {person.image_url ? (
                          <img src={person.image_url} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-sm">{person.name.charAt(0)}</span>
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{person.name}</h3>
                      </div>
                      {primaryType && (
                        <span className={"text-xs px-2 py-1 rounded-full " + getTypeColor(primaryType)}>{primaryType}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {birthYear && <span>{birthYear}{deathYear ? " - " + deathYear : " - present"}</span>}
                    </div>
                    {person.bio_short && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{person.bio_short}</p>
                    )}
                    {person.ideology_tags && person.ideology_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {person.ideology_tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
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
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 dark:text-white">Previous</button>
                <span className="text-gray-600 dark:text-gray-400">Page {page} of {data.pages}</span>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 dark:text-white">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

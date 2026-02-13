import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'

interface ConflictParticipant {
  country_id: string | null
  name: string
  side: string
}

interface Conflict {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  conflict_type: string | null
  intensity: string | null
  countries: ConflictParticipant[]
  lat: number | null
  lng: number | null
}

interface ConflictType {
  type: string
  count: number
}

const TYPE_LABELS: Record<string, string> = {
  battle: 'Battle',
  military_operation: 'Military Operation',
  one_sided: 'One-Sided Violence',
  intrastate: 'Intrastate',
  interstate: 'Interstate',
  'civil war': 'Civil War',
  coup: 'Coup',
  other: 'Other',
}

const TYPE_COLORS: Record<string, string> = {
  battle: '#C41E3A',
  military_operation: '#8B1A1A',
  one_sided: '#D4A017',
  intrastate: '#B8860B',
  interstate: '#4A0E0E',
  'civil war': '#8B0000',
  coup: '#5C3D2E',
  other: '#8B7355',
}

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [types, setTypes] = useState<ConflictType[]>([])
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const LIMIT = 50

  useEffect(() => {
    apiClient.get<ConflictType[]>('/conflicts/types')
      .then(res => setTypes(res.data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string | number> = { limit: LIMIT, offset }
    if (search) params.search = search
    if (selectedType) params.conflict_type = selectedType

    apiClient.get<Conflict[]>('/conflicts/all', { params })
      .then(res => {
        setConflicts(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [search, selectedType, offset])

  const handleSearch = (val: string) => {
    setSearch(val)
    setOffset(0)
  }

  const handleTypeChange = (val: string) => {
    setSelectedType(val)
    setOffset(0)
  }

  return (
    <div style={{ background: '#FFF5F6', minHeight: '100%' }} className="pb-12">
      {/* Header */}
      <div className="py-8 border-b" style={{ background: 'linear-gradient(to right, rgba(196, 30, 58, 0.08), #FFF5F6)', borderColor: '#E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#8B1A1A', fontFamily: 'Georgia, serif' }}>
            Conflicts & Wars
          </h1>
          <p style={{ color: '#5C3D2E' }}>
            Browse {types.reduce((sum, t) => sum + t.count, 0).toLocaleString()} conflicts, wars, and military operations worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Type Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {types.map(t => (
            <button
              key={t.type}
              onClick={() => handleTypeChange(selectedType === t.type ? '' : t.type)}
              className="rounded-lg p-3 text-center transition-all"
              style={{
                background: selectedType === t.type ? (TYPE_COLORS[t.type] || '#8B1A1A') : '#FFFFFF',
                color: selectedType === t.type ? '#fff' : '#5C3D2E',
                border: `1px solid ${selectedType === t.type ? 'transparent' : '#E8C8C8'}`,
                borderTop: `3px solid ${TYPE_COLORS[t.type] || '#C41E3A'}`,
              }}
            >
              <div className="text-lg font-bold">{t.count.toLocaleString()}</div>
              <div className="text-xs">{TYPE_LABELS[t.type] || t.type}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="rounded-lg p-4 mb-6 shadow"
          style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A' }}
        >
          <input
            type="text"
            placeholder="Search conflicts by name..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E8C8C8', background: '#FFF5F6', color: '#2C1810' }}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#E8C8C8', borderTopColor: '#C41E3A' }} />
          </div>
        ) : conflicts.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#8B7355' }}>
            No conflicts found matching your search.
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {conflicts.map(c => (
                <Link
                  key={c.id}
                  to={`/conflict/${c.id}`}
                  className="block rounded-lg p-4 transition-all hover:shadow-md"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8C8C8',
                    borderLeft: `4px solid ${TYPE_COLORS[c.conflict_type || ''] || '#C41E3A'}`,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ color: '#2C1810' }}>
                        {c.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {c.conflict_type && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: `${TYPE_COLORS[c.conflict_type] || '#C41E3A'}15`,
                              color: TYPE_COLORS[c.conflict_type] || '#C41E3A',
                              border: `1px solid ${TYPE_COLORS[c.conflict_type] || '#C41E3A'}40`,
                            }}
                          >
                            {TYPE_LABELS[c.conflict_type] || c.conflict_type}
                          </span>
                        )}
                        {c.intensity && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: '#FFF5F6', color: '#8B7355', border: '1px solid #E8C8C8' }}
                          >
                            {c.intensity}
                          </span>
                        )}
                      </div>
                      {c.countries.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.countries.map((p, i) => (
                            <span
                              key={i}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: p.side === 'side_a' ? 'rgba(196, 30, 58, 0.1)' : 'rgba(212, 160, 23, 0.1)',
                                color: p.side === 'side_a' ? '#C41E3A' : '#B8860B',
                              }}
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0" style={{ color: '#8B7355' }}>
                      <div className="text-sm font-medium">
                        {c.start_date ? new Date(c.start_date).getFullYear() : '?'}
                        {c.end_date ? ` – ${new Date(c.end_date).getFullYear()}` : c.start_date ? ' – ongoing' : ''}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                disabled={offset === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: offset === 0 ? '#E8C8C8' : '#C41E3A',
                  color: offset === 0 ? '#8B7355' : '#fff',
                  cursor: offset === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ color: '#5C3D2E' }} className="text-sm">
                Showing {offset + 1}–{offset + conflicts.length}
              </span>
              <button
                onClick={() => setOffset(offset + LIMIT)}
                disabled={conflicts.length < LIMIT}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: conflicts.length < LIMIT ? '#E8C8C8' : '#C41E3A',
                  color: conflicts.length < LIMIT ? '#8B7355' : '#fff',
                  cursor: conflicts.length < LIMIT ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

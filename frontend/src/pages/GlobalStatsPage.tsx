import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface CountryStats {
  id: string
  name: string
  iso_alpha3?: string
  gdp?: number
  population?: number
  military_spending_pct?: number
}

const RED_COLORS = ['#C41E3A', '#E8485C', '#8B1A1A', '#D4A017', '#A52A2A', '#DC3545', '#B22222', '#CD5C5C']

type StatCategory = 'gdp' | 'population' | 'military'

export default function GlobalStatsPage() {
  const [category, setCategory] = useState<StatCategory>('gdp')
  const [limit, setLimit] = useState(20)

  const { data: overview } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ countries: number; people: number; books: number; events: number; conflicts: number; elections: number }>('/stats/overview')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })

  const { data: stats, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<CountryStats[]>('/geography/countries/stats')
      // Deduplicate by country name — keep entry with most data
      const byName = new Map<string, CountryStats>()
      for (const item of data) {
        const existing = byName.get(item.name)
        if (!existing || (item.gdp && !existing.gdp) || (item.population && !existing.population)) {
          byName.set(item.name, item)
        }
      }
      return Array.from(byName.values())
    },
    staleTime: 1000 * 60 * 30,
  })

  const sortedData = useMemo(() => {
    if (!stats) return []
    const getValue = (item: CountryStats): number => {
      switch (category) {
        case 'gdp': return item.gdp || 0
        case 'population': return item.population || 0
        case 'military': return item.military_spending_pct || 0
        default: return 0
      }
    }
    return [...stats]
      .filter(item => getValue(item) > 0)
      .sort((a, b) => getValue(b) - getValue(a))
      .slice(0, limit)
      .map(item => ({ ...item, value: getValue(item) }))
  }, [stats, category, limit])

  const formatValue = (value: number): string => {
    switch (category) {
      case 'gdp':
        if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T'
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B'
        return '$' + (value / 1e6).toFixed(0) + 'M'
      case 'population':
        if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B'
        if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M'
        return value.toLocaleString()
      case 'military':
        return value.toFixed(1) + '%'
      default:
        return value.toLocaleString()
    }
  }

  const categoryLabels: Record<StatCategory, string> = {
    gdp: 'GDP (Current USD)',
    population: 'Population',
    military: 'Military Spending (% of GDP)',
  }

  const pieData = useMemo(() => {
    return sortedData.slice(0, 8).map((item, index) => ({
      name: item.name,
      value: item.value,
      color: RED_COLORS[index % RED_COLORS.length],
    }))
  }, [sortedData])

  if (isLoading) {
    return (
      <div className="min-h-screen pb-8" style={{ backgroundColor: '#FFF5F6' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'rgba(196, 30, 58, 0.1)' }}></div>
            <div className="h-96 rounded" style={{ backgroundColor: 'rgba(196, 30, 58, 0.1)' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#FFF5F6' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="mb-4">
            <Link to="/" className="font-medium" style={{ color: '#C41E3A' }}>World Map</Link>
            <span className="mx-2" style={{ color: '#8B7355' }}>/</span>
            <span style={{ color: '#8B7355' }}>Global Statistics</span>
          </nav>
          <h1 className="text-3xl font-bold" style={{ color: '#8B1A1A' }}>Global Statistics</h1>
          <p className="mt-2" style={{ color: '#5C3D2E' }}>Compare countries by economic and demographic metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Countries', value: overview?.countries, color: '#2C1810' },
            { label: 'People', value: overview?.people, color: '#C41E3A' },
            { label: 'Events', value: overview?.events, color: '#C41E3A' },
            { label: 'Conflicts', value: overview?.conflicts, color: '#8B1A1A' },
            { label: 'Books', value: overview?.books, color: '#C41E3A' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)' }}>
              <p className="text-sm" style={{ color: '#8B7355' }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value?.toLocaleString() ?? '...'}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)' }}>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as StatCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={
                  category === cat
                    ? { background: '#C41E3A', color: '#FFFFFF', border: '1px solid #C41E3A' }
                    : { background: 'rgba(196, 30, 58, 0.08)', color: '#C41E3A', border: '1px solid rgba(196, 30, 58, 0.3)' }
                }
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm" style={{ color: '#5C3D2E' }}>Show top:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded px-3 py-1 text-sm"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#8B1A1A' }}>
              Top {limit} by {categoryLabels[category]}
            </h3>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData} layout="vertical" margin={{ left: 80, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(196, 30, 58, 0.1)" />
                  <XAxis type="number" tickFormatter={(v) => formatValue(v)} stroke="rgba(139, 115, 85, 0.5)" />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11, fill: '#5C3D2E' }} stroke="rgba(139, 115, 85, 0.5)" />
                  <Tooltip formatter={(value) => [formatValue(value as number), categoryLabels[category]]} contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '8px', color: '#2C1810' }} />
                  <Bar dataKey="value" fill="#C41E3A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#8B1A1A' }}>Distribution (Top 8)</h3>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150}
                    label={({ name, percent }) => String(name || '') + ': ' + ((percent || 0) * 100).toFixed(1) + '%'}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatValue(Number(value) || 0)} contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '8px', color: '#2C1810' }} />
                  <Legend wrapperStyle={{ color: '#5C3D2E' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.08)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid #E8C8C8' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#8B1A1A' }}>Rankings</h3>
          </div>
          <table className="w-full">
            <thead style={{ background: 'rgba(196, 30, 58, 0.06)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#5C3D2E' }}>Rank</th>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: '#5C3D2E' }}>Country</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#5C3D2E' }}>{categoryLabels[category]}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E8C8C8' }} className="hover:bg-red-50">
                  <td className="px-4 py-3 text-sm" style={{ color: '#8B7355' }}>{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={'/country/' + item.id} className="font-medium" style={{ color: '#C41E3A' }}>
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#2C1810' }}>{formatValue(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

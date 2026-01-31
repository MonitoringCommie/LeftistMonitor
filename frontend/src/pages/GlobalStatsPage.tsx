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

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#c026d3']

type StatCategory = 'gdp' | 'population' | 'military'

export default function GlobalStatsPage() {
  const [category, setCategory] = useState<StatCategory>('gdp')
  const [limit, setLimit] = useState(20)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<CountryStats[]>('/geography/countries/stats')
      return data
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
      color: COLORS[index % COLORS.length],
    }))
  }, [sortedData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="mb-4">
            <Link to="/" className="text-red-600 hover:text-red-700 font-medium">World Map</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-300">Global Statistics</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Global Statistics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Compare countries by economic and demographic metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <p className="text-sm text-gray-500">Countries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">710</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <p className="text-sm text-gray-500">People</p>
            <p className="text-2xl font-bold text-purple-600">104,453</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <p className="text-sm text-gray-500">Events</p>
            <p className="text-2xl font-bold text-blue-600">81,096</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <p className="text-sm text-gray-500">Conflicts</p>
            <p className="text-2xl font-bold text-red-600">21,045</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <p className="text-sm text-gray-500">Books</p>
            <p className="text-2xl font-bold text-green-600">21,036</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(categoryLabels) as StatCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">Show top:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border rounded px-3 py-1 text-sm bg-white dark:bg-gray-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Top {limit} by {categoryLabels[category]}
            </h3>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedData} layout="vertical" margin={{ left: 80, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatValue(v)} />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [formatValue(value as number), categoryLabels[category]]} />
                  <Bar dataKey="value" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribution (Top 8)</h3>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150}
                    label={({ name, percent }) => String(name || '') + ': ' + ((percent || 0) * 100).toFixed(1) + '%'}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatValue(Number(value) || 0)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rankings</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Country</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">{categoryLabels[category]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={'/country/' + item.id} className="text-red-600 hover:text-red-700 font-medium">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">{formatValue(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

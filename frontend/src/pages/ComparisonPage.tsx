import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiClient } from '../api/client'

const COUNTRY_COLORS = [
  '#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA',
  '#EC4899', '#0891B2', '#EA580C', '#4F46E5', '#059669',
]

interface CountryOption {
  id: string
  name: string
}

export default function ComparisonPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [startYear, setStartYear] = useState(1900)
  const [endYear, setEndYear] = useState(2024)
  const [comparisonType, setComparisonType] = useState<'elections' | 'left-performance' | 'ideology'>('left-performance')

  // Fetch countries for selection
  const { data: countries } = useQuery({
    queryKey: ['countries-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: CountryOption[] }>('/geography/countries', {
        params: { limit: 200 }
      })
      return data.items
    },
  })

  // Fetch comparison data
  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ['comparison', comparisonType, selectedCountries, startYear, endYear],
    queryFn: async () => {
      if (selectedCountries.length < 2) return null
      const { data } = await apiClient.get(`/comparison/${comparisonType}`, {
        params: {
          countries: selectedCountries.join(','),
          start_year: startYear,
          end_year: endYear,
        }
      })
      return data
    },
    enabled: selectedCountries.length >= 2,
  })

  // Process data for charts
  const chartData = useMemo(() => {
    if (!comparisonData?.data) return []
    
    // Group by year
    const byYear: Record<number, Record<string, number>> = {}
    for (const point of comparisonData.data) {
      if (!byYear[point.year]) {
        byYear[point.year] = {}
      }
      byYear[point.year][point.country_name] = point.left_vote_share
    }
    
    return Object.entries(byYear)
      .map(([year, values]) => ({ year: parseInt(year), ...values }))
      .sort((a, b) => a.year - b.year)
  }, [comparisonData])

  const countryNames = useMemo(() => {
    return comparisonData?.countries || []
  }, [comparisonData])

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId)
        ? prev.filter(id => id !== countryId)
        : prev.length < 10 ? [...prev, countryId] : prev
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Cross-Country Comparison
      </h1>
      <p className="text-gray-600 mb-8">
        Compare political trends across multiple countries over time
      </p>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Comparison Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comparison Type
            </label>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value as typeof comparisonType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="left-performance">Left Party Performance</option>
              <option value="ideology-trends">Ideology Trends</option>
              <option value="elections">All Elections</option>
            </select>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Year
            </label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              min={1800}
              max={2024}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Year
            </label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value))}
              min={1800}
              max={2024}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Selected count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {selectedCountries.length} / 10 countries selected
            </div>
          </div>
        </div>

        {/* Country Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Countries (2-10)
          </label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {countries?.map((country) => (
              <button
                key={country.id}
                onClick={() => toggleCountry(country.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCountries.includes(country.id)
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-red-300'
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {selectedCountries.length < 2 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Select at least 2 countries to see comparison
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading comparison data...</p>
        </div>
      ) : chartData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {comparisonType === 'left-performance' && 'Left Party Vote Share Over Time'}
            {comparisonType === 'ideology' && 'Party Family Trends'}
            {comparisonType === 'elections' && 'Election Results'}
          </h2>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend />
                {countryNames.map((name: string, idx: number) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COUNTRY_COLORS[idx % COUNTRY_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          {comparisonData?.summary && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(comparisonData.summary.average_left_share_by_country || {}).map(
                  ([country, avg]) => (
                    <div key={country} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">{country}</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {(avg as number).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">avg left share</div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">No data available for the selected criteria</p>
        </div>
      )}
    </div>
  )
}

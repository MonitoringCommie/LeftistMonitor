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
  '#C41E3A', '#E8485C', '#8B1A1A', '#D4A017', '#A0522D',
  '#B22222', '#CD5C5C', '#DC143C', '#D2691E', '#8B0000',
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
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: '#FFF5F6', minHeight: '100vh' }}>
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#8B1A1A' }}>
        Cross-Country Comparison
      </h1>
      <p className="mb-8" style={{ color: '#5C3D2E' }}>
        Compare political trends across multiple countries over time
      </p>

      {/* Controls */}
      <div className="rounded-lg p-6 mb-8" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Comparison Type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#8B1A1A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Comparison Type
            </label>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value as typeof comparisonType)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
            >
              <option value="left-performance" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Left Party Performance</option>
              <option value="ideology-trends" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>Ideology Trends</option>
              <option value="elections" style={{ backgroundColor: '#FFFFFF', color: '#2C1810' }}>All Elections</option>
            </select>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#8B1A1A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Start Year
            </label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              min={1800}
              max={2024}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#8B1A1A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
              End Year
            </label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value))}
              min={1800}
              max={2024}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
            />
          </div>

          {/* Selected count */}
          <div className="flex items-end">
            <div className="text-sm" style={{ color: '#8B7355' }}>
              {selectedCountries.length} / 10 countries selected
            </div>
          </div>
        </div>

        {/* Country Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2" style={{ color: '#8B1A1A', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Select Countries (2-10)
          </label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ background: 'rgba(196, 30, 58, 0.04)' }}>
            {countries?.map((country) => (
              <button
                key={country.id}
                onClick={() => toggleCountry(country.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors font-medium ${
                  selectedCountries.includes(country.id)
                    ? ''
                    : 'hover:opacity-80'
                }`}
                style={
                  selectedCountries.includes(country.id)
                    ? { background: 'rgba(196, 30, 58, 0.15)', border: '1px solid rgba(196, 30, 58, 0.3)', color: '#C41E3A' }
                    : { border: '1px solid #E8C8C8', color: '#5C3D2E', background: '#FFFFFF' }
                }
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {selectedCountries.length < 2 ? (
        <div className="rounded-lg p-6 text-center" style={{ background: 'rgba(196, 30, 58, 0.08)', border: '1px solid rgba(196, 30, 58, 0.3)' }}>
          <p style={{ color: '#C41E3A' }}>
            Select at least 2 countries to see comparison
          </p>
        </div>
      ) : isLoading ? (
        <div className="rounded-lg p-12 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}>
          <div className="animate-spin h-12 w-12 border-4 rounded-full mx-auto mb-4" style={{ borderColor: 'rgba(196, 30, 58, 0.4)', borderTopColor: 'transparent' }} />
          <p style={{ color: '#8B7355' }}>Loading comparison data...</p>
        </div>
      ) : chartData.length > 0 ? (
        <div className="rounded-lg p-6" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A', boxShadow: '0 1px 3px rgba(139, 26, 26, 0.08)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B1A1A' }}>
            {comparisonType === 'left-performance' && 'Left Party Vote Share Over Time'}
            {comparisonType === 'ideology' && 'Party Family Trends'}
            {comparisonType === 'elections' && 'Election Results'}
          </h2>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(196, 30, 58, 0.1)" />
                <XAxis dataKey="year" stroke="#8B7355" />
                <YAxis domain={[0, 100]} unit="%" stroke="#8B7355" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E8C8C8', borderRadius: '8px', color: '#2C1810' }} />
                <Legend wrapperStyle={{ color: '#5C3D2E' }} />
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
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #E8C8C8' }}>
              <h3 className="font-medium mb-3" style={{ color: '#8B1A1A' }}>Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(comparisonData.summary.average_left_share_by_country || {}).map(
                  ([country, avg]) => (
                    <div key={country} className="rounded-lg p-3" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A' }}>
                      <div className="text-sm" style={{ color: '#5C3D2E' }}>{country}</div>
                      <div className="text-xl font-semibold" style={{ color: '#C41E3A' }}>
                        {(avg as number).toFixed(1)}%
                      </div>
                      <div className="text-xs" style={{ color: '#8B7355' }}>avg left share</div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg p-6 text-center" style={{ background: 'rgba(196, 30, 58, 0.04)', border: '1px solid #E8C8C8' }}>
          <p style={{ color: '#8B7355' }}>No data available for the selected criteria</p>
        </div>
      )}
    </div>
  )
}

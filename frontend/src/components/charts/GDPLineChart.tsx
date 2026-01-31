import { memo, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'

interface GDPDataPoint {
  year: number
  gdp?: number
  gdp_per_capita?: number
  growth_rate?: number
}

interface GDPLineChartProps {
  data: GDPDataPoint[]
  title?: string
  showGrowthRate?: boolean
  highlightYear?: number
}

const GDPLineChart = memo(function GDPLineChart({
  data,
  title = 'GDP Over Time',
  showGrowthRate = false,
  highlightYear
}: GDPLineChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year)
  }, [data])

  const formatGDP = (value: number) => {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T'
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B'
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M'
    return '$' + value.toLocaleString()
  }

  const formatGDPPerCapita = (value: number) => {
    return '$' + value.toLocaleString()
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No GDP data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => String(value)}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={formatGDP}
            width={80}
          />
          {showGrowthRate && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value + '%'}
              domain={[-10, 15]}
            />
          )}
          <Tooltip
            formatter={(value, name) => {
              const numValue = Number(value) || 0
              if (name === 'GDP') return [formatGDP(numValue), name]
              if (name === 'GDP per Capita') return [formatGDPPerCapita(numValue), name]
              if (name === 'Growth Rate') return [numValue.toFixed(1) + '%', name]
              return [String(value), name]
            }}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          {highlightYear && (
            <ReferenceLine
              x={highlightYear}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: highlightYear, position: 'top' }}
            />
          )}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gdp"
            name="GDP"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          {showGrowthRate && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growth_rate"
              name="Growth Rate"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

export default GDPLineChart

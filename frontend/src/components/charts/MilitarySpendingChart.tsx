import { memo, useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface MilitaryDataPoint {
  year: number
  spending: number
  gdp_percent?: number
  personnel?: number
}

interface MilitarySpendingChartProps {
  data: MilitaryDataPoint[]
  title?: string
  showGDPPercent?: boolean
  currency?: string
}

const MilitarySpendingChart = memo(function MilitarySpendingChart({
  data,
  title = 'Military Spending',
  showGDPPercent = true,
  currency: _currency = "USD"
}: MilitarySpendingChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year)
  }, [data])

  const formatSpending = (value: number) => {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T'
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B'
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M'
    return '$' + value.toLocaleString()
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No military spending data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={formatSpending}
            width={80}
          />
          {showGDPPercent && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value + '%'}
              domain={[0, 10]}
            />
          )}
          <Tooltip
            formatter={(value, name) => {
              const numValue = Number(value) || 0
              if (name === 'Spending') return [formatSpending(numValue), name]
              if (name === '% of GDP') return [numValue.toFixed(2) + '%', name]
              return [numValue.toLocaleString(), name]
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="spending"
            name="Spending"
            fill="#ef4444"
            fillOpacity={0.8}
          />
          {showGDPPercent && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="gdp_percent"
              name="% of GDP"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
})

export default MilitarySpendingChart

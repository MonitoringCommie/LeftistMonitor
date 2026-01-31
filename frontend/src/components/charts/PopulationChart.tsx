import { memo, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface PopulationDataPoint {
  year: number
  population: number
  urban_population?: number
  rural_population?: number
}

interface PopulationChartProps {
  data: PopulationDataPoint[]
  title?: string
  showUrbanRural?: boolean
}

const PopulationChart = memo(function PopulationChart({
  data,
  title = 'Population Over Time',
  showUrbanRural = false
}: PopulationChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year)
  }, [data])

  const formatPopulation = (value: number) => {
    if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B'
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M'
    if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K'
    return value.toLocaleString()
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No population data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={formatPopulation}
            width={60}
          />
          <Tooltip
            formatter={(value, name) => [formatPopulation(Number(value) || 0), name]}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          {showUrbanRural ? (
            <>
              <Area
                type="monotone"
                dataKey="urban_population"
                name="Urban"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="rural_population"
                name="Rural"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
              />
            </>
          ) : (
            <Area
              type="monotone"
              dataKey="population"
              name="Population"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.4}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

export default PopulationChart

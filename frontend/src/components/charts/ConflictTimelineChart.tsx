import { memo, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts'

interface ConflictDataPoint {
  year: number
  conflicts: number
  casualties?: number
  intensity?: 'low' | 'medium' | 'high'
}

interface ConflictTimelineChartProps {
  data: ConflictDataPoint[]
  title?: string
  showCasualties?: boolean
  highlightYear?: number
}

const INTENSITY_COLORS = {
  low: '#fbbf24',
  medium: '#f97316',
  high: '#ef4444',
}

const ConflictTimelineChart = memo(function ConflictTimelineChart({
  data,
  title = 'Conflicts Over Time',
  showCasualties = false,
  highlightYear
}: ConflictTimelineChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year)
  }, [data])

  const formatCasualties = (value: number) => {
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M'
    if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K'
    return value.toLocaleString()
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No conflict data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            allowDecimals={false}
          />
          {showCasualties && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={formatCasualties}
            />
          )}
          <Tooltip
            formatter={(value, name) => {
              const numValue = Number(value) || 0
              if (name === 'Casualties') return [formatCasualties(numValue), name]
              return [numValue, name]
            }}
          />
          <Legend />
          {highlightYear && (
            <ReferenceLine
              x={highlightYear}
              stroke="#6366f1"
              strokeDasharray="5 5"
              label={{ value: 'Now', position: 'top' }}
            />
          )}
          <Bar
            yAxisId="left"
            dataKey="conflicts"
            name="Active Conflicts"
            fill="#ef4444"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={INTENSITY_COLORS[entry.intensity || 'medium']}
              />
            ))}
          </Bar>
          {showCasualties && (
            <Bar
              yAxisId="right"
              dataKey="casualties"
              name="Casualties"
              fill="#1f2937"
              fillOpacity={0.6}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-xs dark:text-gray-300">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: INTENSITY_COLORS.low }}></span>
          Low Intensity
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: INTENSITY_COLORS.medium }}></span>
          Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: INTENSITY_COLORS.high }}></span>
          High
        </span>
      </div>
    </div>
  )
})

export default ConflictTimelineChart

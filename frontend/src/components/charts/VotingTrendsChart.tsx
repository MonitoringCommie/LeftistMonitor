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

interface TrendDataPoint {
  year: number
  [partyName: string]: number
}

interface PartyInfo {
  name: string
  color: string
}

interface VotingTrendsChartProps {
  data: TrendDataPoint[]
  parties: PartyInfo[]
  title?: string
  stacked?: boolean
}

const DEFAULT_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#06b6d4'
]

const VotingTrendsChart = memo(function VotingTrendsChart({
  data,
  parties,
  title = 'Voting Trends Over Time',
  stacked = true
}: VotingTrendsChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year)
  }, [data])

  const partyColors = useMemo(() => {
    return parties.map((party, idx) => ({
      ...party,
      color: party.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
    }))
  }, [parties])

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No voting trend data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => String(value)}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value + '%'}
            domain={[0, stacked ? 100 : 'auto']}
          />
          <Tooltip
            formatter={(value, name) => [(Number(value) || 0).toFixed(1) + '%', name]}
            labelFormatter={(label) => `Election: ${label}`}
          />
          <Legend />
          {partyColors.map((party) => (
            <Area
              key={party.name}
              type="monotone"
              dataKey={party.name}
              name={party.name}
              stackId={stacked ? '1' : undefined}
              stroke={party.color}
              fill={party.color}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

export default VotingTrendsChart

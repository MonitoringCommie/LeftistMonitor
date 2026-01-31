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
  Cell
} from 'recharts'

interface PartyResult {
  party_name: string
  party_short?: string
  vote_share: number
  seats?: number
  color?: string
  ideology?: string
}

interface ElectionResultsChartProps {
  data: PartyResult[]
  title?: string
  showSeats?: boolean
  maxParties?: number
}

// Political party colors by ideology
const IDEOLOGY_COLORS: Record<string, string> = {
  'far-left': '#dc2626',
  'left': '#ef4444',
  'center-left': '#f97316',
  'center': '#facc15',
  'center-right': '#84cc16',
  'right': '#22c55e',
  'far-right': '#14b8a6',
  'green': '#10b981',
  'liberal': '#3b82f6',
  'conservative': '#1d4ed8',
  'socialist': '#dc2626',
  'communist': '#b91c1c',
  'social-democratic': '#f87171',
  'nationalist': '#7c3aed',
  'populist': '#a855f7',
  'default': '#6b7280',
}

const ElectionResultsChart = memo(function ElectionResultsChart({
  data,
  title = 'Election Results',
  showSeats = false,
  maxParties = 10
}: ElectionResultsChartProps) {
  const chartData = useMemo(() => {
    // Sort by vote share and take top parties
    const sorted = [...data]
      .sort((a, b) => b.vote_share - a.vote_share)
      .slice(0, maxParties)

    // Calculate "Others" if there are more parties
    if (data.length > maxParties) {
      const othersShare = data
        .slice(maxParties)
        .reduce((sum, p) => sum + p.vote_share, 0)
      const othersSeats = data
        .slice(maxParties)
        .reduce((sum, p) => sum + (p.seats || 0), 0)

      if (othersShare > 0) {
        sorted.push({
          party_name: 'Others',
          party_short: 'Others',
          vote_share: othersShare,
          seats: othersSeats,
          color: '#9ca3af'
        })
      }
    }

    return sorted.map(party => ({
      ...party,
      name: party.party_short || party.party_name,
      color: party.color || IDEOLOGY_COLORS[party.ideology?.toLowerCase() || 'default'] || IDEOLOGY_COLORS.default
    }))
  }, [data, maxParties])

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No election data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 40)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(value) => value + '%'}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={90}
          />
          <Tooltip
            formatter={(value, name) => {
              const numValue = Number(value) || 0
              if (name === 'Vote Share') return [numValue.toFixed(1) + '%', name]
              return [numValue, name]
            }}
          />
          <Legend />
          <Bar
            dataKey="vote_share"
            name="Vote Share"
            radius={[0, 4, 4, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          {showSeats && (
            <Bar
              dataKey="seats"
              name="Seats"
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})

export default ElectionResultsChart

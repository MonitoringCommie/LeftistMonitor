import { memo, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BudgetCategory {
  name: string
  value: number
  color?: string
}

interface BudgetPieChartProps {
  data: BudgetCategory[]
  title?: string
  showLegend?: boolean
}

const COLORS = [
  '#ef4444', // red - military
  '#3b82f6', // blue - education
  '#22c55e', // green - health
  '#f59e0b', // amber - infrastructure
  '#8b5cf6', // purple - social services
  '#ec4899', // pink - admin
  '#6366f1', // indigo - debt
  '#14b8a6', // teal - other
]

const BudgetPieChart = memo(function BudgetPieChart({ 
  data, 
  title = 'Budget Breakdown',
  showLegend = true 
}: BudgetPieChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || COLORS[index % COLORS.length]
    }))
  }, [data])

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0)
  }, [data])

  const formatValue = (value: number) => {
    if (value >= 1e12) return (value / 1e12).toFixed(1) + 'T'
    if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B'
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M'
    return value.toLocaleString()
  }

  const formatPercent = (value: number) => {
    return ((value / total) * 100).toFixed(1) + '%'
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <p className="text-gray-500 text-sm">No budget data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${formatValue(value as number)} (${formatPercent(value as number)})`,
              name
            ]}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-gray-600">
        Total: {formatValue(total)}
      </div>
    </div>
  )
})

export default BudgetPieChart

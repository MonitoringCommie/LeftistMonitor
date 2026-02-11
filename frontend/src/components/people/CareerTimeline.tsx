import { useMemo } from 'react'

interface Position {
  id: string
  title: string
  organization?: string
  start_date?: string
  end_date?: string
  position_type?: string
}

interface CareerTimelineProps {
  positions: Position[]
  birthYear?: number
  deathYear?: number
  personName: string
}

const POSITION_COLORS: Record<string, string> = {
  head_of_state: '#DC2626',
  head_of_government: '#EA580C',
  minister: '#D97706',
  party_leader: '#CA8A04',
  legislator: '#65A30D',
  diplomat: '#0D9488',
  military: '#6366F1',
  academic: '#8B5CF6',
  activist: '#EC4899',
  writer: '#F472B6',
  other: '#6B7280',
}

export default function CareerTimeline({
  positions,
  birthYear,
  deathYear,
  personName,
}: CareerTimelineProps) {
  const { timelineData, minYear, maxYear, yearRange } = useMemo(() => {
    if (positions.length === 0) {
      return { timelineData: [], minYear: 1900, maxYear: 2000, yearRange: 100 }
    }

    // Parse positions and calculate year range
    const parsed = positions
      .filter(p => p.start_date)
      .map(p => {
        const startYear = new Date(p.start_date!).getFullYear()
        const endYear = p.end_date ? new Date(p.end_date).getFullYear() : new Date().getFullYear()
        return {
          ...p,
          startYear,
          endYear,
          duration: endYear - startYear || 1,
        }
      })
      .sort((a, b) => a.startYear - b.startYear)

    const allYears = parsed.flatMap(p => [p.startYear, p.endYear])
    if (birthYear) allYears.push(birthYear)
    if (deathYear) allYears.push(deathYear)
    
    const min = Math.min(...allYears) - 2
    const max = Math.max(...allYears) + 2
    const range = max - min

    return {
      timelineData: parsed,
      minYear: min,
      maxYear: max,
      yearRange: range,
    }
  }, [positions, birthYear, deathYear])

  if (timelineData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No career data available</p>
      </div>
    )
  }

  const getPosition = (year: number) => ((year - minYear) / yearRange) * 100
  const getWidth = (startYear: number, endYear: number) => 
    ((endYear - startYear) / yearRange) * 100

  // Generate year markers
  const yearMarkers = []
  const step = yearRange > 50 ? 10 : yearRange > 20 ? 5 : 1
  for (let year = Math.ceil(minYear / step) * step; year <= maxYear; year += step) {
    yearMarkers.push(year)
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Career Timeline: {personName}
      </h3>
      
      <div className="relative bg-gray-50 rounded-lg p-4 overflow-x-auto">
        {/* Year axis */}
        <div className="relative h-8 mb-2 border-b border-gray-300">
          {yearMarkers.map(year => (
            <div
              key={year}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${getPosition(year)}%` }}
            >
              <div className="h-2 w-px bg-gray-400" />
              <span className="text-xs text-gray-500 mt-1">{year}</span>
            </div>
          ))}
        </div>

        {/* Life span bar */}
        {birthYear && (
          <div className="relative h-6 mb-4">
            <div className="absolute top-0 h-full text-xs text-gray-500 flex items-center pr-2">
              Life
            </div>
            <div
              className="absolute h-4 top-1 rounded-full"
              style={{
                left: `${getPosition(birthYear)}%`,
                width: `${getWidth(birthYear, deathYear || new Date().getFullYear())}%`,
                background: 'rgba(196, 30, 58, 0.1)',
              }}
            >
              {birthYear && (
                <span className="absolute left-1 top-0 text-xs text-gray-600">
                  b.{birthYear}
                </span>
              )}
              {deathYear && (
                <span className="absolute right-1 top-0 text-xs text-gray-600">
                  d.{deathYear}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Position bars */}
        <div className="space-y-2">
          {timelineData.map((position, index) => (
            <div key={position.id || index} className="relative h-8 group">
              {/* Position label */}
              <div 
                className="absolute h-6 top-1 rounded flex items-center px-2 text-xs text-white font-medium overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  left: `${getPosition(position.startYear)}%`,
                  width: `${Math.max(getWidth(position.startYear, position.endYear), 3)}%`,
                  minWidth: '60px',
                  backgroundColor: POSITION_COLORS[position.position_type || 'other'] || POSITION_COLORS.other,
                }}
                title={`${position.title}${position.organization ? ` at ${position.organization}` : ''} (${position.startYear}-${position.endYear})`}
              >
                <span className="truncate">
                  {position.title}
                </span>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg p-2 text-xs z-10 hidden group-hover:block min-w-[200px]">
                <div className="font-semibold">{position.title}</div>
                {position.organization && (
                  <div className="text-gray-600">{position.organization}</div>
                )}
                <div className="text-gray-500 mt-1">
                  {position.startYear} - {position.end_date ? position.endYear : 'Present'}
                </div>
                {position.position_type && (
                  <div className="mt-1">
                    <span 
                      className="inline-block px-2 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: POSITION_COLORS[position.position_type] }}
                    >
                      {position.position_type.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(POSITION_COLORS).slice(0, 8).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="capitalize text-gray-600">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

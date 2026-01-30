import { useMemo, memo } from 'react'

interface PartySeats {
  name: string
  shortName: string
  seats: number
  color: string
  leftRight?: number | null
}

interface ParliamentHemicycleProps {
  parties: PartySeats[]
  totalSeats: number
}

interface Seat {
  x: number
  y: number
  color: string
  party: string
}

const ParliamentHemicycle = memo(function ParliamentHemicycle({ parties, totalSeats }: ParliamentHemicycleProps) {
  const seats = useMemo(() => {
    const result: Seat[] = []

    // Sort parties by left-right score (left on left side, right on right side)
    const sortedParties = [...parties]
      .filter(p => p.seats > 0)
      .sort((a, b) => (a.leftRight ?? 5) - (b.leftRight ?? 5))

    // Calculate total actual seats
    const actualTotalSeats = sortedParties.reduce((sum, p) => sum + p.seats, 0)
    const seatsToRender = Math.min(actualTotalSeats, totalSeats || actualTotalSeats)

    if (seatsToRender === 0) return []

    // Calculate number of rows needed
    const numRows = Math.ceil(Math.sqrt(seatsToRender / 3))
    const rowSeats: number[] = []

    // Distribute seats across rows (more seats in outer rows)
    let remainingSeats = seatsToRender
    for (let row = 0; row < numRows; row++) {
      const rowRatio = 0.6 + (0.4 * row / Math.max(1, numRows - 1))
      const baseSeats = Math.round((seatsToRender / numRows) * rowRatio)
      const seatsInRow = Math.min(remainingSeats, baseSeats)
      rowSeats.push(seatsInRow)
      remainingSeats -= seatsInRow
    }

    // Add any remaining seats to outer rows
    let rowIndex = numRows - 1
    while (remainingSeats > 0 && rowIndex >= 0) {
      rowSeats[rowIndex]++
      remainingSeats--
      rowIndex = (rowIndex - 1 + numRows) % numRows
    }

    // Calculate seat positions
    const centerX = 200
    const centerY = 180
    const minRadius = 60
    const maxRadius = 160

    const partyAssignments: { partyIdx: number; remaining: number }[] = sortedParties.map((p, i) => ({
      partyIdx: i,
      remaining: p.seats
    }))

    for (let row = 0; row < numRows; row++) {
      const seatsInRow = rowSeats[row]
      if (seatsInRow === 0) continue

      const radius = minRadius + (maxRadius - minRadius) * (row / Math.max(1, numRows - 1))

      for (let i = 0; i < seatsInRow; i++) {
        // Angle from 180° to 0° (left to right)
        const angle = Math.PI - (Math.PI * (i + 0.5)) / seatsInRow

        const x = centerX + radius * Math.cos(angle)
        const y = centerY - radius * Math.sin(angle)

        // Find party with remaining seats
        const assignment = partyAssignments.find(a => a.remaining > 0)
        if (assignment) {
          const party = sortedParties[assignment.partyIdx]
          result.push({
            x,
            y,
            color: party.color,
            party: party.shortName || party.name
          })
          assignment.remaining--
        }
      }
    }

    return result
  }, [parties, totalSeats])

  const legendParties = useMemo(() => {
    return parties
      .filter(p => p.seats > 0)
      .sort((a, b) => b.seats - a.seats)
  }, [parties])

  if (seats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No seat data available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 400 200" className="w-full max-w-lg mx-auto">
        {/* Background arc */}
        <path
          d="M 30 180 A 170 170 0 0 1 370 180"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2"
        />

        {/* Seats */}
        {seats.map((seat, index) => (
          <circle
            key={index}
            cx={seat.x}
            cy={seat.y}
            r={4}
            fill={seat.color}
            stroke="#fff"
            strokeWidth="0.5"
          >
            <title>{seat.party}</title>
          </circle>
        ))}

        {/* Center label */}
        <text x="200" y="190" textAnchor="middle" className="text-xs fill-gray-500">
          {seats.length} seats
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {legendParties.slice(0, 8).map((party, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: party.color }}
            />
            <span className="text-gray-700">{party.shortName || party.name}: {party.seats}</span>
          </div>
        ))}
        {legendParties.length > 8 && (
          <span className="text-gray-500">+{legendParties.length - 8} more</span>
        )}
      </div>
    </div>
  )
})

export default ParliamentHemicycle

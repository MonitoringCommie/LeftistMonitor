import { useMemo, memo, useCallback } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts'

interface Party {
  id: string
  name: string
  abbreviation?: string
  leftRightScore?: number
  libAuthScore?: number
  partyFamily?: string
  voteShare?: number
  color?: string
}

interface IdeologySpectrumProps {
  parties: Party[]
  selectedPartyId?: string
  onPartyClick?: (partyId: string) => void
  showLabels?: boolean
  title?: string
}

const PARTY_FAMILY_COLORS: Record<string, string> = {
  communist: '#DC2626',
  socialist: '#EF4444',
  social_democratic: '#F97316',
  green: '#22C55E',
  liberal: '#3B82F6',
  christian_democratic: '#6366F1',
  conservative: '#1E40AF',
  nationalist: '#7C3AED',
  far_right: '#4B5563',
  agrarian: '#84CC16',
  regional: '#14B8A6',
  other: '#9CA3AF',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: Party }>
}

const CustomTooltip = memo(function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const party = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <h4 className="font-semibold text-gray-900">{party.name}</h4>
      {party.abbreviation && (
        <span className="text-sm text-gray-500">({party.abbreviation})</span>
      )}
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Economic:</span>
          <span className={party.leftRightScore && party.leftRightScore < 0 ? 'text-red-600' : 'text-blue-600'}>
            {party.leftRightScore?.toFixed(1)} ({party.leftRightScore && party.leftRightScore < -3 ? 'Left' : party.leftRightScore && party.leftRightScore > 3 ? 'Right' : 'Center'})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Social:</span>
          <span className={party.libAuthScore && party.libAuthScore > 0 ? 'text-purple-600' : 'text-green-600'}>
            {party.libAuthScore?.toFixed(1)} ({party.libAuthScore && party.libAuthScore > 3 ? 'Auth' : party.libAuthScore && party.libAuthScore < -3 ? 'Lib' : 'Moderate'})
          </span>
        </div>
        {party.partyFamily && (
          <div className="flex justify-between">
            <span className="text-gray-600">Family:</span>
            <span className="capitalize">{party.partyFamily.replace('_', ' ')}</span>
          </div>
        )}
        {party.voteShare !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600">Vote Share:</span>
            <span>{party.voteShare.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )
})

const IdeologySpectrum = memo(function IdeologySpectrum({
  parties,
  selectedPartyId,
  onPartyClick,
  showLabels = true,
  title = 'Political Compass',
}: IdeologySpectrumProps) {
  const chartData = useMemo(() => {
    return parties
      .filter(p => p.leftRightScore !== undefined && p.libAuthScore !== undefined)
      .map(p => ({
        ...p,
        x: p.leftRightScore,
        y: p.libAuthScore,
        z: p.voteShare ? Math.max(50, Math.min(300, p.voteShare * 10)) : 80,
        fill: p.color || PARTY_FAMILY_COLORS[p.partyFamily || 'other'] || PARTY_FAMILY_COLORS.other,
      }))
  }, [parties])

  const handleClick = useCallback((data: { id: string }) => {
    onPartyClick?.(data.id)
  }, [onPartyClick])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No ideology data available for parties</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <defs>
              <linearGradient id="authLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEE2E2" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FECACA" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="authRight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DBEAFE" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#BFDBFE" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="libLeft" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D1FAE5" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#A7F3D0" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="libRight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <XAxis
              type="number"
              dataKey="x"
              domain={[-10, 10]}
              tickCount={5}
              tick={{ fontSize: 12 }}
            >
              <Label value="Economic Left - Right" position="bottom" offset={20} />
            </XAxis>

            <YAxis
              type="number"
              dataKey="y"
              domain={[-10, 10]}
              tickCount={5}
              tick={{ fontSize: 12 }}
            >
              <Label value="Libertarian - Authoritarian" angle={-90} position="left" offset={10} />
            </YAxis>

            <ReferenceLine x={0} stroke="#9CA3AF" strokeWidth={2} />
            <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={2} />

            <Tooltip content={<CustomTooltip />} />

            <Scatter
              data={chartData}
              onClick={handleClick}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <circle
                  key={`dot-${index}`}
                  cx={0}
                  cy={0}
                  r={Math.sqrt(entry.z)}
                  fill={entry.fill}
                  stroke={entry.id === selectedPartyId ? '#000' : '#fff'}
                  strokeWidth={entry.id === selectedPartyId ? 3 : 1}
                  opacity={0.8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {showLabels && (
          <>
            <div className="absolute top-8 left-12 text-xs text-red-600 font-medium opacity-60">
              Authoritarian Left
            </div>
            <div className="absolute top-8 right-8 text-xs text-blue-600 font-medium opacity-60">
              Authoritarian Right
            </div>
            <div className="absolute bottom-12 left-12 text-xs text-green-600 font-medium opacity-60">
              Libertarian Left
            </div>
            <div className="absolute bottom-12 right-8 text-xs text-yellow-600 font-medium opacity-60">
              Libertarian Right
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {Object.entries(PARTY_FAMILY_COLORS).slice(0, 8).map(([family, color]) => (
          <div key={family} className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize text-gray-600">{family.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default IdeologySpectrum

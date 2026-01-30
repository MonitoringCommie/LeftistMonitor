import { useMemo } from 'react'
import { useOccupations, useResistanceMovements, usePalestineSummary } from '../../api/territories'

interface OccupationsTabProps {
  countryId?: string
  countryName?: string
}

export default function OccupationsTab({ countryId, countryName }: OccupationsTabProps) {
  const { data: occupations, isLoading: occupationsLoading } = useOccupations({ ongoing: true })
  const { data: resistanceMovements, isLoading: movementsLoading } = useResistanceMovements({ active: true })
  const { data: palestineSummary } = usePalestineSummary()

  // Filter occupations relevant to this country (as occupier or occupied)
  const relevantOccupations = useMemo(() => {
    if (!occupations || !countryId) return occupations || []
    return occupations.filter(o => 
      o.occupier_country_id === countryId || 
      o.occupied_territory?.toLowerCase().includes(countryName?.toLowerCase() || '')
    )
  }, [occupations, countryId, countryName])

  if (occupationsLoading || movementsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Palestine Summary Stats */}
      {palestineSummary && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-900 mb-3">Palestine: The Ongoing Nakba</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-red-800">{palestineSummary.nakba_villages.count}</div>
              <div className="text-xs text-gray-600">Villages Destroyed (1948)</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{palestineSummary.settlements.count}</div>
              <div className="text-xs text-gray-600">Illegal Settlements</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{palestineSummary.checkpoints.count}</div>
              <div className="text-xs text-gray-600">Checkpoints</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-700">
                {palestineSummary.separation_wall.total_length_km?.toFixed(0) || '?'} km
              </div>
              <div className="text-xs text-gray-600">Apartheid Wall</div>
            </div>
          </div>

          <div className="mt-3 text-sm text-red-800">
            <strong>{palestineSummary.nakba_villages.total_refugees_displaced?.toLocaleString() || '750,000+'}</strong> Palestinians displaced in 1948 alone.
            Today over 7 million Palestinian refugees remain stateless.
          </div>
        </div>
      )}

      {/* Ongoing Occupations */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Ongoing Occupations Worldwide</h3>
        
        {occupations && occupations.length > 0 ? (
          <div className="space-y-3">
            {(relevantOccupations.length > 0 ? relevantOccupations : occupations).map(occupation => (
              <div key={occupation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{occupation.name}</h4>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{occupation.occupier_name}</span>
                      {' → '}
                      <span>{occupation.occupied_territory}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      {occupation.international_law_status || 'Illegal'}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Since {occupation.start_date?.split('-')[0] || '?'}
                    </div>
                  </div>
                </div>
                
                {occupation.description && (
                  <p className="mt-2 text-sm text-gray-700">{occupation.description}</p>
                )}
                
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {occupation.population_displaced && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {occupation.population_displaced.toLocaleString()} displaced
                    </span>
                  )}
                  {occupation.settlements_built && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                      {occupation.settlements_built} settlements
                    </span>
                  )}
                  {occupation.land_confiscated_km2 && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {occupation.land_confiscated_km2.toLocaleString()} km² confiscated
                    </span>
                  )}
                </div>

                {occupation.progressive_analysis && (
                  <div className="mt-3 p-2 bg-yellow-50 border-l-2 border-yellow-400 text-sm text-gray-700">
                    <strong className="text-yellow-800">Analysis:</strong> {occupation.progressive_analysis}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No occupation data available.</p>
        )}
      </div>

      {/* Resistance Movements */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Active Resistance Movements</h3>
        
        {resistanceMovements && resistanceMovements.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {resistanceMovements.map(movement => (
              <div key={movement.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">{movement.name}</h4>
                  <div className="flex gap-1">
                    {movement.armed_wing && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Armed</span>
                    )}
                    {movement.political_wing && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Political</span>
                    )}
                  </div>
                </div>
                
                {movement.occupation_name && (
                  <div className="text-sm text-gray-600 mt-1">
                    Resisting: {movement.occupation_name}
                  </div>
                )}
                
                {movement.ideology_tags && movement.ideology_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {movement.ideology_tags.map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {movement.founded_date && (
                  <div className="text-xs text-gray-500 mt-2">
                    Founded: {movement.founded_date.split('-')[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active resistance movements data available.</p>
        )}
      </div>

      {/* Educational Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
        <h4 className="font-semibold text-gray-900 mb-2">Understanding Occupation</h4>
        <p>
          Under international law, military occupation is meant to be temporary. Prolonged occupations 
          that involve population transfer (settlements) are illegal under the Fourth Geneva Convention.
          Occupied peoples have a right to resist occupation, including through armed struggle, under 
          UN General Assembly Resolution 37/43.
        </p>
      </div>
    </div>
  )
}

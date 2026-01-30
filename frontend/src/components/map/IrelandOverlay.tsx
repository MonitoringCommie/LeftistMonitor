import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useTroublesEventsGeoJSON, useFamineData } from '../../api/territories'

interface IrelandOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  troubles_loyalist: '#FF4500',     // Orange red - loyalist violence
  troubles_republican: '#228B22',   // Forest green - republican violence  
  troubles_state: '#000080',        // Navy - state/British forces
  troubles_collusion: '#8B0000',    // Dark red - state collusion
  famine: '#4A4A4A',                // Dark gray - famine deaths
}


export default function IrelandOverlay({ map, visible }: IrelandOverlayProps) {
  const { data: troublesEvents } = useTroublesEventsGeoJSON()
  const { data: famineData } = useFamineData()

  // Convert famine data to GeoJSON
  const famineGeoJSON = useMemo(() => {
    if (!famineData) return { type: 'FeatureCollection' as const, features: [] }
    return {
      type: 'FeatureCollection' as const,
      features: famineData
        .filter(d => d.lat && d.lon)
        .map(d => ({
          type: 'Feature' as const,
          properties: {
            id: d.id,
            county: d.county,
            province: d.province,
            population_1841: d.population_1841,
            population_1851: d.population_1851,
            decline_percent: d.population_decline_percent,
            deaths: d.estimated_deaths,
            emigration: d.estimated_emigration,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [d.lon, d.lat],
          },
        })),
    }
  }, [famineData])

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Troubles events source
      if (!map.getSource('troubles-events')) {
        map.addSource('troubles-events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      // Famine data source
      if (!map.getSource('famine-data')) {
        map.addSource('famine-data', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      // Troubles events layer
      if (!map.getLayer('troubles-events-layer')) {
        map.addLayer({
          id: 'troubles-events-layer',
          type: 'circle',
          source: 'troubles-events',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['get', 'total_deaths'],
              0, 5,
              5, 7,
              10, 10,
              50, 15
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'collusion_documented'], true], COLORS.troubles_collusion,
              ['==', ['get', 'perpetrator_side'], 'loyalist'], COLORS.troubles_loyalist,
              ['==', ['get', 'perpetrator_side'], 'republican'], COLORS.troubles_republican,
              ['==', ['get', 'perpetrator_side'], 'state'], COLORS.troubles_state,
              '#888888'
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': [
              'case',
              ['==', ['get', 'collusion_documented'], true], 3,
              1.5
            ],
            'circle-stroke-color': [
              'case', 
              ['==', ['get', 'collusion_documented'], true], '#FFD700',
              '#fff'
            ]
          },
          layout: { visibility: 'none' }
        })
      }

      // Famine layer
      if (!map.getLayer('famine-layer')) {
        map.addLayer({
          id: 'famine-layer',
          type: 'circle',
          source: 'famine-data',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['get', 'decline_percent'],
              0, 6,
              25, 10,
              50, 16,
              75, 22
            ],
            'circle-color': COLORS.famine,
            'circle-opacity': 0.7,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }
    }

    if (map.isStyleLoaded()) {
      initLayers()
    } else {
      map.once('load', initLayers)
    }
  }, [map])

  // Update data sources
  useEffect(() => {
    if (!map) return

    const updateSources = () => {
      if (troublesEvents && map.getSource('troubles-events')) {
        (map.getSource('troubles-events') as maplibregl.GeoJSONSource).setData(troublesEvents as any)
      }
      if (famineGeoJSON.features.length > 0 && map.getSource('famine-data')) {
        (map.getSource('famine-data') as maplibregl.GeoJSONSource).setData(famineGeoJSON as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, troublesEvents, famineGeoJSON])

  // Toggle visibility
  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      if (map.getLayer('troubles-events-layer')) {
        map.setLayoutProperty('troubles-events-layer', 'visibility', vis)
      }
      if (map.getLayer('famine-layer')) {
        map.setLayoutProperty('famine-layer', 'visibility', vis)
      }
    }

    if (map.isStyleLoaded()) {
      setVisibility()
    } else {
      map.once('load', setVisibility)
    }
  }, [map, visible])

  const stats = useMemo(() => {
    const troublesCount = troublesEvents?.features.length || 0
    const collusionCount = troublesEvents?.features.filter(
      f => f.properties.collusion_documented
    ).length || 0
    const famineCounties = famineData?.length || 0
    const totalFamineDeaths = famineData?.reduce(
      (sum, d) => sum + (d.estimated_deaths || 0), 0
    ) || 0

    return { troublesCount, collusionCount, famineCounties, totalFamineDeaths }
  }, [troublesEvents, famineData])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Ireland: Colonial History</div>

      <div className="space-y-1.5 text-xs">
        <div className="font-semibold text-gray-600 mt-1">The Troubles (1968-1998)</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.troubles_loyalist }} />
          <span className="text-gray-700">Loyalist Violence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.troubles_republican }} />
          <span className="text-gray-700">Republican Violence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.troubles_state }} />
          <span className="text-gray-700">State/British Forces</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-yellow-500" style={{ backgroundColor: COLORS.troubles_collusion }} />
          <span className="text-gray-700">State Collusion ({stats.collusionCount})</span>
        </div>

        <div className="font-semibold text-gray-600 mt-2">Great Famine (1845-1852)</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.famine }} />
          <span className="text-gray-700">Counties ({stats.famineCounties})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        <div>Troubles events: {stats.troublesCount}</div>
        <div>Famine deaths: ~{(stats.totalFamineDeaths / 1000000).toFixed(1)}M</div>
      </div>
    </div>
  )
}

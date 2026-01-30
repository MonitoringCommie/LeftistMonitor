import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useTibetEventsGeoJSON } from '../../api/territories'

interface TibetOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  destroyed_monastery: '#8B4513',   // Saddle brown - destroyed monasteries
  military_installation: '#2F4F4F', // Dark slate - military
  self_immolation: '#FF4500',       // Orange red - self-immolations
  massacre: '#DC143C',              // Crimson - massacres
  political_imprisonment: '#800080', // Purple - political prisoners
  settler_colonialism: '#DAA520',   // Goldenrod - settler transfer
}

const EVENT_LABELS: Record<string, string> = {
  destroyed_monastery: 'Destroyed Monasteries',
  military_installation: 'Military Installations',
  self_immolation: 'Self-Immolations',
  massacre: 'Massacres',
  political_imprisonment: 'Political Prisoners',
  settler_colonialism: 'Settler Colonialism',
}

export default function TibetOverlay({ map, visible }: TibetOverlayProps) {
  const { data: events } = useTibetEventsGeoJSON()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      if (!map.getSource('tibet-events')) {
        map.addSource('tibet-events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      if (!map.getLayer('tibet-events-layer')) {
        map.addLayer({
          id: 'tibet-events-layer',
          type: 'circle',
          source: 'tibet-events',
          paint: {
            'circle-radius': 7,
            'circle-color': [
              'match', ['get', 'category'],
              'destroyed_monastery', COLORS.destroyed_monastery,
              'military_installation', COLORS.military_installation,
              'self_immolation', COLORS.self_immolation,
              'massacre', COLORS.massacre,
              'political_imprisonment', COLORS.political_imprisonment,
              'settler_colonialism', COLORS.settler_colonialism,
              '#888888'
            ],
            'circle-opacity': 0.85,
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

  useEffect(() => {
    if (!map) return

    const updateSource = () => {
      if (events && map.getSource('tibet-events')) {
        (map.getSource('tibet-events') as maplibregl.GeoJSONSource).setData(events as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSource()
    } else {
      map.once('load', updateSource)
    }
  }, [map, events])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      if (map.getLayer('tibet-events-layer')) {
        map.setLayoutProperty('tibet-events-layer', 'visibility', visible ? 'visible' : 'none')
      }
    }

    if (map.isStyleLoaded()) {
      setVisibility()
    } else {
      map.once('load', setVisibility)
    }
  }, [map, visible])

  const stats = useMemo(() => {
    if (!events?.features) return {}
    return events.features.reduce((acc, f) => {
      const type = f.properties.category
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [events])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Tibet: Occupation Data</div>
      <div className="text-xs text-gray-500 mb-2">~6,000 monasteries destroyed since 1950</div>

      <div className="space-y-1.5 text-xs">
        {Object.entries(COLORS).map(([type, color]) => {
          const count = stats[type] || 0
          if (count === 0) return null
          return (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-700">{EVENT_LABELS[type] || type} ({count})</span>
            </div>
          )
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        160+ self-immolations in protest since 2009
      </div>
    </div>
  )
}

import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useWestPapuaEventsGeoJSON } from '../../api/territories'

interface WestPapuaOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  military_installation: '#1C1C1C', // Near black - military
  massacre: '#B22222',              // Firebrick - massacres
  resource_extraction: '#FFD700',   // Gold - resource theft
  transmigration: '#FF8C00',        // Dark orange - settler colonies
}

const EVENT_LABELS: Record<string, string> = {
  military_installation: 'Military Installations',
  massacre: 'Massacres',
  resource_extraction: 'Resource Extraction',
  transmigration: 'Transmigration Settlements',
}

export default function WestPapuaOverlay({ map, visible }: WestPapuaOverlayProps) {
  const { data: events } = useWestPapuaEventsGeoJSON()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      if (!map.getSource('west-papua-events')) {
        map.addSource('west-papua-events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      if (!map.getLayer('west-papua-events-layer')) {
        map.addLayer({
          id: 'west-papua-events-layer',
          type: 'circle',
          source: 'west-papua-events',
          paint: {
            'circle-radius': 8,
            'circle-color': [
              'match', ['get', 'category'],
              'military_installation', COLORS.military_installation,
              'massacre', COLORS.massacre,
              'resource_extraction', COLORS.resource_extraction,
              'transmigration', COLORS.transmigration,
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
      if (events && map.getSource('west-papua-events')) {
        (map.getSource('west-papua-events') as maplibregl.GeoJSONSource).setData(events as any)
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
      if (map.getLayer('west-papua-events-layer')) {
        map.setLayoutProperty('west-papua-events-layer', 'visibility', visible ? 'visible' : 'none')
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
      <div className="text-sm font-bold text-gray-800 mb-2">West Papua: Occupation Data</div>
      <div className="text-xs text-gray-500 mb-2">Indonesian occupation since 1963</div>

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
        100,000-500,000 Papuans killed since 1963
      </div>
    </div>
  )
}

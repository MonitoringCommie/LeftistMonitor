import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useKurdistanEventsGeoJSON } from '../../api/territories'

interface KurdistanOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  destroyed_village: '#8B4513',    // Saddle brown - destroyed villages
  military_installation: '#2F4F4F', // Dark slate gray - military
  dam_project: '#4169E1',          // Royal blue - dams flooding lands
  massacre: '#DC143C',             // Crimson - massacres
  political_imprisonment: '#800080', // Purple - political prisoners
  cultural_suppression: '#FF8C00', // Dark orange - cultural suppression
}

const EVENT_LABELS: Record<string, string> = {
  destroyed_village: 'Destroyed Villages',
  military_installation: 'Military Installations',
  dam_project: 'Dam Projects',
  massacre: 'Massacres',
  political_imprisonment: 'Political Imprisonment',
  cultural_suppression: 'Cultural Suppression',
}

export default function KurdistanOverlay({ map, visible }: KurdistanOverlayProps) {
  const { data: events } = useKurdistanEventsGeoJSON()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      if (!map.getSource('kurdistan-events')) {
        map.addSource('kurdistan-events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      if (!map.getLayer('kurdistan-events-layer')) {
        map.addLayer({
          id: 'kurdistan-events-layer',
          type: 'circle',
          source: 'kurdistan-events',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'match', ['get', 'category'],
              'destroyed_village', COLORS.destroyed_village,
              'military_installation', COLORS.military_installation,
              'dam_project', COLORS.dam_project,
              'massacre', COLORS.massacre,
              'political_imprisonment', COLORS.political_imprisonment,
              'cultural_suppression', COLORS.cultural_suppression,
              '#888888'
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 1.5,
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
      if (events && map.getSource('kurdistan-events')) {
        (map.getSource('kurdistan-events') as maplibregl.GeoJSONSource).setData(events as any)
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
      if (map.getLayer('kurdistan-events-layer')) {
        map.setLayoutProperty('kurdistan-events-layer', 'visibility', visible ? 'visible' : 'none')
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
      <div className="text-sm font-bold text-gray-800 mb-2">Kurdistan: Oppression Data</div>
      <div className="text-xs text-gray-500 mb-2">~4,000 villages destroyed by Turkey</div>

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
        Click features for details
      </div>
    </div>
  )
}

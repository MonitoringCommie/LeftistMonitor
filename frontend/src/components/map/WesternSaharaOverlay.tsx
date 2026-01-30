import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useWesternSaharaEventsGeoJSON } from '../../api/territories'

interface WesternSaharaOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  sand_berm: '#C19A6B',              // Desert sand - the berm/wall
  settlement: '#FF6B00',             // Orange - Moroccan settlements
  military_installation: '#2F4F4F', // Dark slate - military
  mine_field: '#FF0000',             // Red - landmines
  refugee_camp: '#4682B4',           // Steel blue - refugee camps
  resource_extraction: '#FFD700',    // Gold - resource theft
}

const EVENT_LABELS: Record<string, string> = {
  sand_berm: 'Sand Berm (2,700km wall)',
  settlement: 'Moroccan Settlements',
  military_installation: 'Military Installations',
  mine_field: 'Minefields',
  refugee_camp: 'Sahrawi Refugee Camps',
  resource_extraction: 'Resource Extraction',
}

export default function WesternSaharaOverlay({ map, visible }: WesternSaharaOverlayProps) {
  const { data: events } = useWesternSaharaEventsGeoJSON()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      if (!map.getSource('western-sahara-events')) {
        map.addSource('western-sahara-events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      if (!map.getLayer('western-sahara-events-layer')) {
        map.addLayer({
          id: 'western-sahara-events-layer',
          type: 'circle',
          source: 'western-sahara-events',
          paint: {
            'circle-radius': 7,
            'circle-color': [
              'match', ['get', 'category'],
              'sand_berm', COLORS.sand_berm,
              'settlement', COLORS.settlement,
              'military_installation', COLORS.military_installation,
              'mine_field', COLORS.mine_field,
              'refugee_camp', COLORS.refugee_camp,
              'resource_extraction', COLORS.resource_extraction,
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
      if (events && map.getSource('western-sahara-events')) {
        (map.getSource('western-sahara-events') as maplibregl.GeoJSONSource).setData(events as any)
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
      if (map.getLayer('western-sahara-events-layer')) {
        map.setLayoutProperty('western-sahara-events-layer', 'visibility', visible ? 'visible' : 'none')
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
      <div className="text-sm font-bold text-gray-800 mb-2">Western Sahara: Occupation Data</div>
      <div className="text-xs text-gray-500 mb-2">Africa's last colony - occupied by Morocco</div>

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
        7+ million landmines along the berm
      </div>
    </div>
  )
}

import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useKashmirEventsGeoJSON } from '../../api/territories'

interface KashmirOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  military_installation: '#1C1C1C', // Near black - military presence
  checkpoint: '#4A4A4A',            // Dark gray - checkpoints
  massacre: '#B22222',              // Firebrick - massacres
  mass_grave: '#8B0000',            // Dark red - mass graves
}

const EVENT_LABELS: Record<string, string> = {
  military_installation: 'Military Installations',
  checkpoint: 'Checkpoints',
  massacre: 'Massacres',
  mass_grave: 'Mass Graves',
}

export default function KashmirOverlay({ map, visible }: KashmirOverlayProps) {
  const { data: events } = useKashmirEventsGeoJSON()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      if (!map.getSource('kashmir-events')) {
        map.addSource('kashmir-events', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      if (!map.getLayer('kashmir-events-layer')) {
        map.addLayer({
          id: 'kashmir-events-layer',
          type: 'circle',
          source: 'kashmir-events',
          paint: {
            'circle-radius': 7,
            'circle-color': [
              'match', ['get', 'category'],
              'military_installation', COLORS.military_installation,
              'checkpoint', COLORS.checkpoint,
              'massacre', COLORS.massacre,
              'mass_grave', COLORS.mass_grave,
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
      if (events && map.getSource('kashmir-events')) {
        (map.getSource('kashmir-events') as maplibregl.GeoJSONSource).setData(events as any)
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
      if (map.getLayer('kashmir-events-layer')) {
        map.setLayoutProperty('kashmir-events-layer', 'visibility', visible ? 'visible' : 'none')
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
      <div className="text-sm font-bold text-gray-800 mb-2">Kashmir: Occupation Data</div>
      <div className="text-xs text-gray-500 mb-2">700,000+ Indian troops deployed</div>

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
        8,000+ enforced disappearances since 1989
      </div>
    </div>
  )
}

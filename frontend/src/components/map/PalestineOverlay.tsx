import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import {
  useNakbaVillagesGeoJSON,
  useSettlementsGeoJSON,
  useCheckpointsGeoJSON,
  useSeparationWallGeoJSON,
  useMassacresGeoJSON,
} from '../../api/territories'

interface PalestineOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

// Colors for different features
const COLORS = {
  nakbaVillage: '#8B0000', // Dark red - destroyed villages
  settlement: '#FF6B00', // Orange - illegal settlements  
  checkpoint: '#000000', // Black - checkpoints
  wall: '#4A0080', // Purple - separation wall
  massacre: '#DC143C', // Crimson - massacres
}

export default function PalestineOverlay({ map, visible }: PalestineOverlayProps) {
  const { data: nakbaVillages } = useNakbaVillagesGeoJSON()
  const { data: settlements } = useSettlementsGeoJSON()
  const { data: checkpoints } = useCheckpointsGeoJSON()
  const { data: wall } = useSeparationWallGeoJSON()
  const { data: massacres } = useMassacresGeoJSON()

  // Initialize sources and layers
  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Add sources if they don't exist
      if (!map.getSource('nakba-villages')) {
        map.addSource('nakba-villages', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }
      if (!map.getSource('settlements')) {
        map.addSource('settlements', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }
      if (!map.getSource('checkpoints')) {
        map.addSource('checkpoints', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }
      if (!map.getSource('separation-wall')) {
        map.addSource('separation-wall', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }
      if (!map.getSource('massacres')) {
        map.addSource('massacres', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
      }

      // Add layers if they don't exist
      if (!map.getLayer('nakba-villages-layer')) {
        map.addLayer({
          id: 'nakba-villages-layer',
          type: 'circle',
          source: 'nakba-villages',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['get', 'population_1945'],
              0, 4,
              1000, 6,
              5000, 10,
              10000, 14
            ],
            'circle-color': COLORS.nakbaVillage,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      if (!map.getLayer('settlements-layer')) {
        map.addLayer({
          id: 'settlements-layer',
          type: 'circle',
          source: 'settlements',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['get', 'population'],
              0, 4,
              5000, 8,
              20000, 12,
              50000, 16
            ],
            'circle-color': COLORS.settlement,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      if (!map.getLayer('checkpoints-layer')) {
        map.addLayer({
          id: 'checkpoints-layer',
          type: 'circle',
          source: 'checkpoints',
          paint: {
            'circle-radius': 5,
            'circle-color': COLORS.checkpoint,
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      if (!map.getLayer('separation-wall-layer')) {
        map.addLayer({
          id: 'separation-wall-layer',
          type: 'line',
          source: 'separation-wall',
          paint: {
            'line-color': COLORS.wall,
            'line-width': 4,
            'line-opacity': 0.9
          },
          layout: { visibility: 'none' }
        })
      }

      if (!map.getLayer('massacres-layer')) {
        map.addLayer({
          id: 'massacres-layer',
          type: 'circle',
          source: 'massacres',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['get', 'palestinian_deaths'],
              0, 6,
              50, 10,
              100, 14,
              200, 18
            ],
            'circle-color': COLORS.massacre,
            'circle-opacity': 0.9,
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
      if (nakbaVillages && map.getSource('nakba-villages')) {
        (map.getSource('nakba-villages') as maplibregl.GeoJSONSource).setData(nakbaVillages as any)
      }
      if (settlements && map.getSource('settlements')) {
        (map.getSource('settlements') as maplibregl.GeoJSONSource).setData(settlements as any)
      }
      if (checkpoints && map.getSource('checkpoints')) {
        (map.getSource('checkpoints') as maplibregl.GeoJSONSource).setData(checkpoints as any)
      }
      if (wall && map.getSource('separation-wall')) {
        (map.getSource('separation-wall') as maplibregl.GeoJSONSource).setData(wall as any)
      }
      if (massacres && map.getSource('massacres')) {
        (map.getSource('massacres') as maplibregl.GeoJSONSource).setData(massacres as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, nakbaVillages, settlements, checkpoints, wall, massacres])

  // Toggle visibility
  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'nakba-villages-layer',
        'settlements-layer', 
        'checkpoints-layer',
        'separation-wall-layer',
        'massacres-layer'
      ]
      
      layers.forEach(layer => {
        if (map.getLayer(layer)) {
          map.setLayoutProperty(layer, 'visibility', vis)
        }
      })
    }

    if (map.isStyleLoaded()) {
      setVisibility()
    } else {
      map.once('load', setVisibility)
    }
  }, [map, visible])

  // Statistics for the legend
  const stats = useMemo(() => ({
    villages: nakbaVillages?.features.length || 0,
    settlements: settlements?.features.length || 0,
    checkpoints: checkpoints?.features.length || 0,
    wallSegments: wall?.features.length || 0,
    massacres: massacres?.features.length || 0,
  }), [nakbaVillages, settlements, checkpoints, wall, massacres])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Palestine: Occupation Data</div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.nakbaVillage }} />
          <span className="text-gray-700">Nakba Villages ({stats.villages})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.settlement }} />
          <span className="text-gray-700">Illegal Settlements ({stats.settlements})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.checkpoint }} />
          <span className="text-gray-700">Checkpoints ({stats.checkpoints})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.wall }} />
          <span className="text-gray-700">Separation Wall ({stats.wallSegments} segments)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.massacre }} />
          <span className="text-gray-700">Massacres ({stats.massacres})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        Click features for details
      </div>
    </div>
  )
}

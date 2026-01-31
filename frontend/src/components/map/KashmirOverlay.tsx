import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface KashmirOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  loc: '#FF0000', // Red - Line of Control
  checkpoint: '#000000', // Black - checkpoints
  military: '#000080', // Navy - military installations
  grave: '#800080', // Purple - mass graves/cemeteries
  boundary: '#FFD700', // Gold - disputed boundaries
}

function useLineOfControl() {
  return useQuery({
    queryKey: ['kashmir-loc'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kashmir/line-of-control/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useBoundaries() {
  return useQuery({
    queryKey: ['kashmir-boundaries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kashmir/boundaries/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useCheckpoints() {
  return useQuery({
    queryKey: ['kashmir-checkpoints'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kashmir/checkpoints/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useMilitary() {
  return useQuery({
    queryKey: ['kashmir-military'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kashmir/military/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useGraves() {
  return useQuery({
    queryKey: ['kashmir-graves'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kashmir/graves/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function KashmirOverlay({ map, visible }: KashmirOverlayProps) {
  const { data: loc } = useLineOfControl()
  const { data: boundaries } = useBoundaries()
  const { data: checkpoints } = useCheckpoints()
  const { data: military } = useMilitary()
  const { data: graves } = useGraves()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Boundaries
      if (!map.getSource('kashmir-boundaries')) {
        map.addSource('kashmir-boundaries', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kashmir-boundaries-line',
          type: 'line',
          source: 'kashmir-boundaries',
          paint: {
            'line-color': COLORS.boundary,
            'line-width': 2,
            'line-dasharray': [4, 2]
          },
          layout: { visibility: 'none' }
        })
      }

      // Line of Control
      if (!map.getSource('kashmir-loc')) {
        map.addSource('kashmir-loc', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kashmir-loc-layer',
          type: 'line',
          source: 'kashmir-loc',
          paint: {
            'line-color': COLORS.loc,
            'line-width': 3,
            'line-opacity': 0.9
          },
          layout: { visibility: 'none' }
        })
      }

      // Checkpoints
      if (!map.getSource('kashmir-checkpoints')) {
        map.addSource('kashmir-checkpoints', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kashmir-checkpoints-layer',
          type: 'circle',
          source: 'kashmir-checkpoints',
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

      // Military
      if (!map.getSource('kashmir-military')) {
        map.addSource('kashmir-military', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kashmir-military-layer',
          type: 'circle',
          source: 'kashmir-military',
          paint: {
            'circle-radius': 6,
            'circle-color': COLORS.military,
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Graves
      if (!map.getSource('kashmir-graves')) {
        map.addSource('kashmir-graves', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kashmir-graves-layer',
          type: 'circle',
          source: 'kashmir-graves',
          paint: {
            'circle-radius': 5,
            'circle-color': COLORS.grave,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
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

    const updateSources = () => {
      if (loc && map.getSource('kashmir-loc')) {
        (map.getSource('kashmir-loc') as maplibregl.GeoJSONSource).setData(loc as any)
      }
      if (boundaries && map.getSource('kashmir-boundaries')) {
        (map.getSource('kashmir-boundaries') as maplibregl.GeoJSONSource).setData(boundaries as any)
      }
      if (checkpoints && map.getSource('kashmir-checkpoints')) {
        (map.getSource('kashmir-checkpoints') as maplibregl.GeoJSONSource).setData(checkpoints as any)
      }
      if (military && map.getSource('kashmir-military')) {
        (map.getSource('kashmir-military') as maplibregl.GeoJSONSource).setData(military as any)
      }
      if (graves && map.getSource('kashmir-graves')) {
        (map.getSource('kashmir-graves') as maplibregl.GeoJSONSource).setData(graves as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, loc, boundaries, checkpoints, military, graves])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'kashmir-boundaries-line',
        'kashmir-loc-layer',
        'kashmir-checkpoints-layer',
        'kashmir-military-layer',
        'kashmir-graves-layer',
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

  const stats = useMemo(() => ({
    locSegments: loc?.features?.length || 0,
    checkpoints: checkpoints?.features?.length || 0,
    military: military?.features?.length || 0,
    graves: graves?.features?.length || 0,
  }), [loc, checkpoints, military, graves])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Kashmir: Indian Occupation</div>
      <div className="text-xs text-gray-500 mb-2">Source: OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.loc }} />
          <span className="text-gray-700">Line of Control ({stats.locSegments} segments)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.checkpoint }} />
          <span className="text-gray-700">Checkpoints ({stats.checkpoints})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.military }} />
          <span className="text-gray-700">Military Installations ({stats.military})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.grave }} />
          <span className="text-gray-700">Cemeteries/Martyrs Graves ({stats.graves})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        700,000+ troops deployed (AFSPA)
      </div>
    </div>
  )
}

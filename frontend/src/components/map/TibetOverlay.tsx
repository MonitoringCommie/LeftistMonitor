import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface TibetOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  monastery: '#FFD700', // Gold - monasteries (many destroyed)
  military: '#000080', // Navy - military installations
  railway: '#8B4513', // Brown - railway (colonization tool)
  prison: '#8B0000', // Dark red - prisons/detention
}

function useMonasteries() {
  return useQuery({
    queryKey: ['tibet-monasteries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/tibet/monasteries/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useMilitary() {
  return useQuery({
    queryKey: ['tibet-military'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/tibet/military/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useRailway() {
  return useQuery({
    queryKey: ['tibet-railway'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/tibet/railway/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function usePrisons() {
  return useQuery({
    queryKey: ['tibet-prisons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/tibet/prisons/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function TibetOverlay({ map, visible }: TibetOverlayProps) {
  const { data: monasteries } = useMonasteries()
  const { data: military } = useMilitary()
  const { data: railway } = useRailway()
  const { data: prisons } = usePrisons()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Railway
      if (!map.getSource('tibet-railway')) {
        map.addSource('tibet-railway', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'tibet-railway-layer',
          type: 'line',
          source: 'tibet-railway',
          paint: {
            'line-color': COLORS.railway,
            'line-width': 2,
            'line-opacity': 0.8
          },
          layout: { visibility: 'none' }
        })
      }

      // Monasteries
      if (!map.getSource('tibet-monasteries')) {
        map.addSource('tibet-monasteries', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'tibet-monasteries-layer',
          type: 'circle',
          source: 'tibet-monasteries',
          paint: {
            'circle-radius': 4,
            'circle-color': COLORS.monastery,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000'
          },
          layout: { visibility: 'none' }
        })
      }

      // Military
      if (!map.getSource('tibet-military')) {
        map.addSource('tibet-military', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'tibet-military-layer',
          type: 'circle',
          source: 'tibet-military',
          paint: {
            'circle-radius': 5,
            'circle-color': COLORS.military,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Prisons
      if (!map.getSource('tibet-prisons')) {
        map.addSource('tibet-prisons', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'tibet-prisons-layer',
          type: 'circle',
          source: 'tibet-prisons',
          paint: {
            'circle-radius': 6,
            'circle-color': COLORS.prison,
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

  useEffect(() => {
    if (!map) return

    const updateSources = () => {
      if (monasteries && map.getSource('tibet-monasteries')) {
        (map.getSource('tibet-monasteries') as maplibregl.GeoJSONSource).setData(monasteries as any)
      }
      if (military && map.getSource('tibet-military')) {
        (map.getSource('tibet-military') as maplibregl.GeoJSONSource).setData(military as any)
      }
      if (railway && map.getSource('tibet-railway')) {
        (map.getSource('tibet-railway') as maplibregl.GeoJSONSource).setData(railway as any)
      }
      if (prisons && map.getSource('tibet-prisons')) {
        (map.getSource('tibet-prisons') as maplibregl.GeoJSONSource).setData(prisons as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, monasteries, military, railway, prisons])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'tibet-railway-layer',
        'tibet-monasteries-layer',
        'tibet-military-layer',
        'tibet-prisons-layer',
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
    monasteries: monasteries?.features?.length || 0,
    military: military?.features?.length || 0,
    railway: railway?.features?.length || 0,
    prisons: prisons?.features?.length || 0,
  }), [monasteries, military, railway, prisons])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Tibet: Chinese Occupation</div>
      <div className="text-xs text-gray-500 mb-2">Source: OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.monastery }} />
          <span className="text-gray-700">Monasteries/Temples ({stats.monasteries})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.military }} />
          <span className="text-gray-700">Military Installations ({stats.military})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.railway }} />
          <span className="text-gray-700">Railway Infrastructure ({stats.railway})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.prison }} />
          <span className="text-gray-700">Prisons/Detention ({stats.prisons})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        ~6,000 monasteries destroyed since 1950
      </div>
    </div>
  )
}

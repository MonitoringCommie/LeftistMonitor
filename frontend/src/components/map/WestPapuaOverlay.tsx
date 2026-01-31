import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface WestPapuaOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  mine: '#FFD700', // Gold - Freeport mine
  military: '#000080', // Navy - military installations
  settlement: '#228B22', // Green - transmigration settlements
}

function useFreeportMine() {
  return useQuery({
    queryKey: ['wp-freeport'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/west-papua/freeport-mine/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useMilitary() {
  return useQuery({
    queryKey: ['wp-military'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/west-papua/military/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useSettlements() {
  return useQuery({
    queryKey: ['wp-settlements'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/west-papua/settlements/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function WestPapuaOverlay({ map, visible }: WestPapuaOverlayProps) {
  const { data: freeport } = useFreeportMine()
  const { data: military } = useMilitary()
  const { data: settlements } = useSettlements()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Settlements (transmigration)
      if (!map.getSource('wp-settlements')) {
        map.addSource('wp-settlements', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'wp-settlements-layer',
          type: 'circle',
          source: 'wp-settlements',
          paint: {
            'circle-radius': 3,
            'circle-color': COLORS.settlement,
            'circle-opacity': 0.6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Military
      if (!map.getSource('wp-military')) {
        map.addSource('wp-military', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'wp-military-layer',
          type: 'circle',
          source: 'wp-military',
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

      // Freeport Mine
      if (!map.getSource('wp-freeport')) {
        map.addSource('wp-freeport', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'wp-freeport-layer',
          type: 'circle',
          source: 'wp-freeport',
          paint: {
            'circle-radius': 8,
            'circle-color': COLORS.mine,
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#000'
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
      if (freeport && map.getSource('wp-freeport')) {
        (map.getSource('wp-freeport') as maplibregl.GeoJSONSource).setData(freeport as any)
      }
      if (military && map.getSource('wp-military')) {
        (map.getSource('wp-military') as maplibregl.GeoJSONSource).setData(military as any)
      }
      if (settlements && map.getSource('wp-settlements')) {
        (map.getSource('wp-settlements') as maplibregl.GeoJSONSource).setData(settlements as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, freeport, military, settlements])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'wp-settlements-layer',
        'wp-military-layer',
        'wp-freeport-layer',
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
    freeport: freeport?.features?.length || 0,
    military: military?.features?.length || 0,
    settlements: settlements?.features?.length || 0,
  }), [freeport, military, settlements])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">West Papua: Indonesian Occupation</div>
      <div className="text-xs text-gray-500 mb-2">Source: OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.mine }} />
          <span className="text-gray-700">Freeport/Mining ({stats.freeport})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.military }} />
          <span className="text-gray-700">Military Installations ({stats.military})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.settlement }} />
          <span className="text-gray-700">Settlements ({stats.settlements})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        Transmigration program: millions relocated
      </div>
    </div>
  )
}

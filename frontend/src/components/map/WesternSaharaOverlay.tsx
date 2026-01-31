import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface WesternSaharaOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  wall: '#8B4513', // Brown - sand wall/berm
  minefield: '#FF0000', // Red - minefields
  settlement: '#4169E1', // Blue - Moroccan settlements
  refugeeCamp: '#228B22', // Green - Sahrawi refugee camps
  boundary: '#FFD700', // Gold - disputed boundary
}

function useWall() {
  return useQuery({
    queryKey: ['ws-wall'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/western-sahara/wall/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useMinefields() {
  return useQuery({
    queryKey: ['ws-minefields'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/western-sahara/minefields/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useSettlements() {
  return useQuery({
    queryKey: ['ws-settlements'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/western-sahara/settlements/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useRefugeeCamps() {
  return useQuery({
    queryKey: ['ws-refugee-camps'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/western-sahara/refugee-camps/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useBoundary() {
  return useQuery({
    queryKey: ['ws-boundary'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/western-sahara/boundary/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function WesternSaharaOverlay({ map, visible }: WesternSaharaOverlayProps) {
  const { data: wall } = useWall()
  const { data: minefields } = useMinefields()
  const { data: settlements } = useSettlements()
  const { data: refugeeCamps } = useRefugeeCamps()
  const { data: boundary } = useBoundary()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Boundary
      if (!map.getSource('ws-boundary')) {
        map.addSource('ws-boundary', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ws-boundary-line',
          type: 'line',
          source: 'ws-boundary',
          paint: {
            'line-color': COLORS.boundary,
            'line-width': 2,
            'line-dasharray': [4, 2]
          },
          layout: { visibility: 'none' }
        })
      }

      // Sand Wall/Berm
      if (!map.getSource('ws-wall')) {
        map.addSource('ws-wall', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ws-wall-layer',
          type: 'line',
          source: 'ws-wall',
          paint: {
            'line-color': COLORS.wall,
            'line-width': 3,
            'line-opacity': 0.9
          },
          layout: { visibility: 'none' }
        })
      }

      // Minefields
      if (!map.getSource('ws-minefields')) {
        map.addSource('ws-minefields', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ws-minefields-layer',
          type: 'circle',
          source: 'ws-minefields',
          paint: {
            'circle-radius': 6,
            'circle-color': COLORS.minefield,
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Settlements
      if (!map.getSource('ws-settlements')) {
        map.addSource('ws-settlements', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ws-settlements-layer',
          type: 'circle',
          source: 'ws-settlements',
          paint: {
            'circle-radius': 5,
            'circle-color': COLORS.settlement,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Refugee Camps
      if (!map.getSource('ws-refugee-camps')) {
        map.addSource('ws-refugee-camps', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ws-refugee-camps-layer',
          type: 'circle',
          source: 'ws-refugee-camps',
          paint: {
            'circle-radius': 8,
            'circle-color': COLORS.refugeeCamp,
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
      if (wall && map.getSource('ws-wall')) {
        (map.getSource('ws-wall') as maplibregl.GeoJSONSource).setData(wall as any)
      }
      if (minefields && map.getSource('ws-minefields')) {
        (map.getSource('ws-minefields') as maplibregl.GeoJSONSource).setData(minefields as any)
      }
      if (settlements && map.getSource('ws-settlements')) {
        (map.getSource('ws-settlements') as maplibregl.GeoJSONSource).setData(settlements as any)
      }
      if (refugeeCamps && map.getSource('ws-refugee-camps')) {
        (map.getSource('ws-refugee-camps') as maplibregl.GeoJSONSource).setData(refugeeCamps as any)
      }
      if (boundary && map.getSource('ws-boundary')) {
        (map.getSource('ws-boundary') as maplibregl.GeoJSONSource).setData(boundary as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, wall, minefields, settlements, refugeeCamps, boundary])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'ws-boundary-line',
        'ws-wall-layer',
        'ws-minefields-layer',
        'ws-settlements-layer',
        'ws-refugee-camps-layer',
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
    wallSegments: wall?.features?.length || 0,
    minefields: minefields?.features?.length || 0,
    settlements: settlements?.features?.length || 0,
    refugeeCamps: refugeeCamps?.features?.length || 0,
  }), [wall, minefields, settlements, refugeeCamps])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Western Sahara: Moroccan Occupation</div>
      <div className="text-xs text-gray-500 mb-2">Source: OCHA, OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.wall }} />
          <span className="text-gray-700">Sand Wall/Berm ({stats.wallSegments} segments)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.minefield }} />
          <span className="text-gray-700">Minefields ({stats.minefields})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.settlement }} />
          <span className="text-gray-700">Settlements ({stats.settlements})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.refugeeCamp }} />
          <span className="text-gray-700">Sahrawi Refugee Camps ({stats.refugeeCamps})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        7+ million landmines along the berm
      </div>
    </div>
  )
}

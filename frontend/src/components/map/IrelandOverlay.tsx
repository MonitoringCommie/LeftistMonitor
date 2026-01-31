import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface IrelandOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  peaceWall: '#8B0000', // Dark red - peace walls
  military: '#000080', // Navy - military/British installations
  checkpoint: '#000000', // Black - border checkpoints
  partition: '#FF6600', // Orange - partition boundary
}

function usePeaceWalls() {
  return useQuery({
    queryKey: ['ireland-peace-walls'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/ireland/peace-walls/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useMilitary() {
  return useQuery({
    queryKey: ['ireland-military'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/ireland/military/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useBorderCheckpoints() {
  return useQuery({
    queryKey: ['ireland-checkpoints'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/ireland/border-checkpoints/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function usePartitionBoundary() {
  return useQuery({
    queryKey: ['ireland-partition'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/ireland/partition-boundary/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function IrelandOverlay({ map, visible }: IrelandOverlayProps) {
  const { data: peaceWalls } = usePeaceWalls()
  const { data: military } = useMilitary()
  const { data: checkpoints } = useBorderCheckpoints()
  const { data: partition } = usePartitionBoundary()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Partition Boundary
      if (!map.getSource('ireland-partition')) {
        map.addSource('ireland-partition', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ireland-partition-line',
          type: 'line',
          source: 'ireland-partition',
          paint: {
            'line-color': COLORS.partition,
            'line-width': 3,
            'line-dasharray': [4, 2],
            'line-opacity': 0.8
          },
          layout: { visibility: 'none' }
        })
      }

      // Peace Walls
      if (!map.getSource('ireland-peace-walls')) {
        map.addSource('ireland-peace-walls', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ireland-peace-walls-layer',
          type: 'line',
          source: 'ireland-peace-walls',
          paint: {
            'line-color': COLORS.peaceWall,
            'line-width': 3,
            'line-opacity': 0.9
          },
          layout: { visibility: 'none' }
        })
      }

      // Military
      if (!map.getSource('ireland-military')) {
        map.addSource('ireland-military', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ireland-military-layer',
          type: 'circle',
          source: 'ireland-military',
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

      // Border Checkpoints
      if (!map.getSource('ireland-checkpoints')) {
        map.addSource('ireland-checkpoints', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'ireland-checkpoints-layer',
          type: 'circle',
          source: 'ireland-checkpoints',
          paint: {
            'circle-radius': 6,
            'circle-color': COLORS.checkpoint,
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
      if (peaceWalls && map.getSource('ireland-peace-walls')) {
        (map.getSource('ireland-peace-walls') as maplibregl.GeoJSONSource).setData(peaceWalls as any)
      }
      if (military && map.getSource('ireland-military')) {
        (map.getSource('ireland-military') as maplibregl.GeoJSONSource).setData(military as any)
      }
      if (checkpoints && map.getSource('ireland-checkpoints')) {
        (map.getSource('ireland-checkpoints') as maplibregl.GeoJSONSource).setData(checkpoints as any)
      }
      if (partition && map.getSource('ireland-partition')) {
        (map.getSource('ireland-partition') as maplibregl.GeoJSONSource).setData(partition as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, peaceWalls, military, checkpoints, partition])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'ireland-partition-line',
        'ireland-peace-walls-layer',
        'ireland-military-layer',
        'ireland-checkpoints-layer',
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
    peaceWalls: peaceWalls?.features?.length || 0,
    military: military?.features?.length || 0,
    checkpoints: checkpoints?.features?.length || 0,
    partition: partition?.features?.length || 0,
  }), [peaceWalls, military, checkpoints, partition])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Ireland: British Colonialism & Partition</div>
      <div className="text-xs text-gray-500 mb-2">Source: OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.partition }} />
          <span className="text-gray-700">1921 Partition Boundary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.peaceWall }} />
          <span className="text-gray-700">Peace Walls Belfast ({stats.peaceWalls})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.military }} />
          <span className="text-gray-700">Military/Forts ({stats.military})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.checkpoint }} />
          <span className="text-gray-700">Border Checkpoints ({stats.checkpoints})</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        Over 100 peace walls still standing
      </div>
    </div>
  )
}

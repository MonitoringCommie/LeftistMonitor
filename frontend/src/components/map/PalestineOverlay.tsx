import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface PalestineOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

// Colors for different features
const COLORS = {
  barrierConstructed: '#8B0000', // Dark red - constructed wall
  barrierPlanned: '#FF6B6B', // Light red - planned/under construction
  checkpoint: '#000000', // Black - checkpoints
  roadblock: '#555555', // Gray - roadblocks
  firingZone: '#FF4500', // Orange-red - firing zones
  areaA: '#228B22', // Green - Palestinian control
  areaB: '#90EE90', // Light green - joint control
  areaC: '#FFD700', // Gold - Israeli control
  settlement: '#0000CD', // Blue - settlements
}

// API hooks for Palestine data
function useSeparationBarrier() {
  return useQuery({
    queryKey: ['palestine-barrier'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/palestine/separation-barrier/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

function useCheckpoints() {
  return useQuery({
    queryKey: ['palestine-checkpoints'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/palestine/checkpoints/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useRoadblocks() {
  return useQuery({
    queryKey: ['palestine-roadblocks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/palestine/roadblocks/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useFiringZones() {
  return useQuery({
    queryKey: ['palestine-firing-zones'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/palestine/firing-zones/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useOsloAreas() {
  return useQuery({
    queryKey: ['palestine-oslo-areas'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/palestine/oslo-areas/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useSettlements() {
  return useQuery({
    queryKey: ['palestine-settlements'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/palestine/settlements/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function PalestineOverlay({ map, visible }: PalestineOverlayProps) {
  const { data: barrier } = useSeparationBarrier()
  const { data: checkpoints } = useCheckpoints()
  const { data: roadblocks } = useRoadblocks()
  const { data: firingZones } = useFiringZones()
  const { data: osloAreas } = useOsloAreas()
  const { data: settlements } = useSettlements()

  // Initialize sources and layers
  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Oslo Areas (polygons - add first so they're below other layers)
      if (!map.getSource('oslo-areas')) {
        map.addSource('oslo-areas', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'oslo-areas-fill',
          type: 'fill',
          source: 'oslo-areas',
          paint: {
            'fill-color': [
              'match', ['get', 'Area_name'],
              'Area A', COLORS.areaA,
              'Area B', COLORS.areaB,
              'Area C', COLORS.areaC,
              '#888888'
            ],
            'fill-opacity': 0.3
          },
          layout: { visibility: 'none' }
        })
      }

      // Firing Zones (polygons)
      if (!map.getSource('firing-zones')) {
        map.addSource('firing-zones', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'firing-zones-fill',
          type: 'fill',
          source: 'firing-zones',
          paint: {
            'fill-color': COLORS.firingZone,
            'fill-opacity': 0.25
          },
          layout: { visibility: 'none' }
        })
        map.addLayer({
          id: 'firing-zones-line',
          type: 'line',
          source: 'firing-zones',
          paint: {
            'line-color': COLORS.firingZone,
            'line-width': 1,
            'line-dasharray': [2, 2]
          },
          layout: { visibility: 'none' }
        })
      }

      // Separation Barrier (lines)
      if (!map.getSource('separation-barrier')) {
        map.addSource('separation-barrier', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'separation-barrier-layer',
          type: 'line',
          source: 'separation-barrier',
          paint: {
            'line-color': [
              'match', ['get', 'Status'],
              'Constructed', COLORS.barrierConstructed,
              'Under Construction', COLORS.barrierPlanned,
              'Projected', COLORS.barrierPlanned,
              COLORS.barrierConstructed
            ],
            'line-width': [
              'match', ['get', 'Type'],
              'Concrete', 4,
              'Fence', 3,
              3
            ],
            'line-opacity': 0.9
          },
          layout: { visibility: 'none' }
        })
      }

      // Checkpoints (points)
      if (!map.getSource('checkpoints')) {
        map.addSource('checkpoints', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'checkpoints-layer',
          type: 'circle',
          source: 'checkpoints',
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

      // Roadblocks (points)
      if (!map.getSource('roadblocks')) {
        map.addSource('roadblocks', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'roadblocks-layer',
          type: 'circle',
          source: 'roadblocks',
          paint: {
            'circle-radius': 4,
            'circle-color': COLORS.roadblock,
            'circle-opacity': 0.7,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Settlements (points)
      if (!map.getSource('settlements')) {
        map.addSource('settlements', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'settlements-layer',
          type: 'circle',
          source: 'settlements',
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
      if (barrier && map.getSource('separation-barrier')) {
        (map.getSource('separation-barrier') as maplibregl.GeoJSONSource).setData(barrier as any)
      }
      if (checkpoints && map.getSource('checkpoints')) {
        (map.getSource('checkpoints') as maplibregl.GeoJSONSource).setData(checkpoints as any)
      }
      if (roadblocks && map.getSource('roadblocks')) {
        (map.getSource('roadblocks') as maplibregl.GeoJSONSource).setData(roadblocks as any)
      }
      if (firingZones && map.getSource('firing-zones')) {
        (map.getSource('firing-zones') as maplibregl.GeoJSONSource).setData(firingZones as any)
      }
      if (osloAreas && map.getSource('oslo-areas')) {
        (map.getSource('oslo-areas') as maplibregl.GeoJSONSource).setData(osloAreas as any)
      }
      if (settlements && map.getSource('settlements')) {
        (map.getSource('settlements') as maplibregl.GeoJSONSource).setData(settlements as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, barrier, checkpoints, roadblocks, firingZones, osloAreas, settlements])

  // Toggle visibility
  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'oslo-areas-fill',
        'firing-zones-fill',
        'firing-zones-line',
        'separation-barrier-layer',
        'checkpoints-layer',
        'roadblocks-layer',
        'settlements-layer',
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
    barrierSegments: barrier?.features?.length || 0,
    checkpoints: checkpoints?.features?.length || 0,
    roadblocks: roadblocks?.features?.length || 0,
    firingZones: firingZones?.features?.length || 0,
    settlements: settlements?.features?.length || 0,
  }), [barrier, checkpoints, roadblocks, firingZones, settlements])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Palestine: Occupation Infrastructure</div>
      <div className="text-xs text-gray-500 mb-2">Source: OCHA, UN, OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1" style={{ backgroundColor: COLORS.barrierConstructed }} />
          <span className="text-gray-700">Separation Wall ({stats.barrierSegments} segments)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.checkpoint }} />
          <span className="text-gray-700">Checkpoints ({stats.checkpoints})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.roadblock }} />
          <span className="text-gray-700">Roadblocks ({stats.roadblocks})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.settlement }} />
          <span className="text-gray-700">Settlements ({stats.settlements})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.firingZone, opacity: 0.4 }} />
          <span className="text-gray-700">Firing Zones ({stats.firingZones})</span>
        </div>
        
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Oslo Areas:</div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.areaA, opacity: 0.5 }} />
              <span className="text-gray-600">A</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.areaB, opacity: 0.5 }} />
              <span className="text-gray-600">B</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.areaC, opacity: 0.5 }} />
              <span className="text-gray-600">C</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        All settlements illegal under international law
      </div>
    </div>
  )
}

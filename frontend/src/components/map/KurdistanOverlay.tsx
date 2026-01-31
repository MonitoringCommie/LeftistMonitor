import { useEffect, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../api/client'

interface KurdistanOverlayProps {
  map: maplibregl.Map | null
  visible: boolean
}

const COLORS = {
  destroyedVillage: '#8B0000', // Dark red - destroyed villages
  military: '#000080', // Navy - military installations
  dam: '#4169E1', // Blue - dams
  iraqi: '#228B22', // Green - Iraqi Kurdistan
}

function useDestroyedVillages() {
  return useQuery({
    queryKey: ['kurd-destroyed-villages'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kurdistan/destroyed-villages/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useMilitary() {
  return useQuery({
    queryKey: ['kurd-military'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kurdistan/military/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useDams() {
  return useQuery({
    queryKey: ['kurd-dams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kurdistan/dams/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

function useIraqiKurdistan() {
  return useQuery({
    queryKey: ['iraqi-kurdistan'],
    queryFn: async () => {
      const { data } = await apiClient.get('/territories/kurdistan/iraqi-kurdistan/geojson')
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}

export default function KurdistanOverlay({ map, visible }: KurdistanOverlayProps) {
  const { data: destroyedVillages } = useDestroyedVillages()
  const { data: military } = useMilitary()
  const { data: dams } = useDams()
  const { data: iraqi } = useIraqiKurdistan()

  useEffect(() => {
    if (!map) return

    const initLayers = () => {
      // Iraqi Kurdistan
      if (!map.getSource('iraqi-kurdistan')) {
        map.addSource('iraqi-kurdistan', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'iraqi-kurdistan-fill',
          type: 'fill',
          source: 'iraqi-kurdistan',
          paint: {
            'fill-color': COLORS.iraqi,
            'fill-opacity': 0.2
          },
          layout: { visibility: 'none' }
        })
        map.addLayer({
          id: 'iraqi-kurdistan-line',
          type: 'line',
          source: 'iraqi-kurdistan',
          paint: {
            'line-color': COLORS.iraqi,
            'line-width': 2
          },
          layout: { visibility: 'none' }
        })
      }

      // Destroyed Villages
      if (!map.getSource('kurd-destroyed')) {
        map.addSource('kurd-destroyed', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kurd-destroyed-layer',
          type: 'circle',
          source: 'kurd-destroyed',
          paint: {
            'circle-radius': 5,
            'circle-color': COLORS.destroyedVillage,
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          },
          layout: { visibility: 'none' }
        })
      }

      // Military
      if (!map.getSource('kurd-military')) {
        map.addSource('kurd-military', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kurd-military-layer',
          type: 'circle',
          source: 'kurd-military',
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

      // Dams
      if (!map.getSource('kurd-dams')) {
        map.addSource('kurd-dams', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'kurd-dams-layer',
          type: 'circle',
          source: 'kurd-dams',
          paint: {
            'circle-radius': 8,
            'circle-color': COLORS.dam,
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
      if (destroyedVillages && map.getSource('kurd-destroyed')) {
        (map.getSource('kurd-destroyed') as maplibregl.GeoJSONSource).setData(destroyedVillages as any)
      }
      if (military && map.getSource('kurd-military')) {
        (map.getSource('kurd-military') as maplibregl.GeoJSONSource).setData(military as any)
      }
      if (dams && map.getSource('kurd-dams')) {
        (map.getSource('kurd-dams') as maplibregl.GeoJSONSource).setData(dams as any)
      }
      if (iraqi && map.getSource('iraqi-kurdistan')) {
        (map.getSource('iraqi-kurdistan') as maplibregl.GeoJSONSource).setData(iraqi as any)
      }
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once('load', updateSources)
    }
  }, [map, destroyedVillages, military, dams, iraqi])

  useEffect(() => {
    if (!map) return

    const setVisibility = () => {
      const vis = visible ? 'visible' : 'none'
      const layers = [
        'iraqi-kurdistan-fill',
        'iraqi-kurdistan-line',
        'kurd-destroyed-layer',
        'kurd-military-layer',
        'kurd-dams-layer',
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
    destroyedVillages: destroyedVillages?.features?.length || 0,
    military: military?.features?.length || 0,
    dams: dams?.features?.length || 0,
  }), [destroyedVillages, military, dams])

  if (!visible) return null

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
      <div className="text-sm font-bold text-gray-800 mb-2">Kurdistan: Multi-State Oppression</div>
      <div className="text-xs text-gray-500 mb-2">Source: OpenStreetMap</div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.destroyedVillage }} />
          <span className="text-gray-700">Destroyed Villages ({stats.destroyedVillages})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.military }} />
          <span className="text-gray-700">Military Installations ({stats.military})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.dam }} />
          <span className="text-gray-700">Dam Projects ({stats.dams})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.iraqi, opacity: 0.4 }} />
          <span className="text-gray-700">Iraqi Kurdistan Region</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        ~4,000 villages destroyed in Turkey
      </div>
    </div>
  )
}

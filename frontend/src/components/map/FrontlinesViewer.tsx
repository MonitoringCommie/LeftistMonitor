import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import {
  getConflictsWithFrontlines,
  getFrontlineDates,
  getFrontlineGeoJSON,
  ConflictWithFrontlines,
  FrontlineDate,
  FrontlineGeoJSON,
} from '../../api/frontlines'

const SIDE_LABELS: Record<string, string> = {
  allies: 'Allied Forces',
  axis: 'Axis Powers',
  russia: 'Russian Forces',
  ukraine: 'Ukrainian Forces',
  republicans: 'Republican Forces',
  nationalists: 'Nationalist Forces',
  north_korea: 'North Korean/Chinese Forces',
  south_korea: 'South Korean Forces',
  un_forces: 'UN Forces',
  north_vietnam: 'North Vietnam/Viet Cong',
  south_vietnam: 'South Vietnam',
}

export default function FrontlinesViewer() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [conflicts, setConflicts] = useState<ConflictWithFrontlines[]>([])
  const [selectedConflict, setSelectedConflict] = useState<ConflictWithFrontlines | null>(null)
  const [dates, setDates] = useState<FrontlineDate[]>([])
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [frontlineData, setFrontlineData] = useState<FrontlineGeoJSON | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load conflicts with frontlines
  useEffect(() => {
    getConflictsWithFrontlines()
      .then(setConflicts)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // Load dates when conflict changes
  useEffect(() => {
    if (!selectedConflict) {
      setDates([])
      setSelectedDateIndex(0)
      return
    }

    getFrontlineDates(selectedConflict.id)
      .then((data) => {
        setDates(data)
        setSelectedDateIndex(0)
      })
      .catch(console.error)
  }, [selectedConflict])

  // Load frontline data when date changes
  useEffect(() => {
    if (!selectedConflict || dates.length === 0) {
      setFrontlineData(null)
      return
    }

    const targetDate = dates[selectedDateIndex]?.date
    if (!targetDate) return

    getFrontlineGeoJSON(selectedConflict.id, targetDate)
      .then(setFrontlineData)
      .catch(console.error)
  }, [selectedConflict, selectedDateIndex, dates])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-light': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'carto-light',
            type: 'raster',
            source: 'carto-light',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [10, 45],
      zoom: 3,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update map layers when frontline data changes
  useEffect(() => {
    if (!map.current || !frontlineData) return

    const mapInstance = map.current

    const updateLayers = () => {
      // Remove existing layers
      if (mapInstance.getLayer('frontlines-fill')) {
        mapInstance.removeLayer('frontlines-fill')
      }
      if (mapInstance.getLayer('frontlines-line')) {
        mapInstance.removeLayer('frontlines-line')
      }
      if (mapInstance.getLayer('frontlines-points')) {
        mapInstance.removeLayer('frontlines-points')
      }
      if (mapInstance.getSource('frontlines')) {
        mapInstance.removeSource('frontlines')
      }

      if (frontlineData.features.length === 0) return

      mapInstance.addSource('frontlines', {
        type: 'geojson',
        data: frontlineData as any,
      })

      // Add fill layer for polygons
      mapInstance.addLayer({
        id: 'frontlines-fill',
        type: 'fill',
        source: 'frontlines',
        filter: ['any',
          ['==', ['geometry-type'], 'Polygon'],
          ['==', ['geometry-type'], 'MultiPolygon']
        ],
        paint: {
          'fill-color': ['coalesce', ['get', 'color'], '#888888'],
          'fill-opacity': 0.5,
        },
      })

      // Add line layer for polygon borders and lines
      mapInstance.addLayer({
        id: 'frontlines-line',
        type: 'line',
        source: 'frontlines',
        filter: ['any',
          ['==', ['geometry-type'], 'Polygon'],
          ['==', ['geometry-type'], 'MultiPolygon'],
          ['==', ['geometry-type'], 'LineString'],
          ['==', ['geometry-type'], 'MultiLineString']
        ],
        paint: {
          'line-color': ['coalesce', ['get', 'color'], '#888888'],
          'line-width': 2,
        },
      })

      // Add points layer
      mapInstance.addLayer({
        id: 'frontlines-points',
        type: 'circle',
        source: 'frontlines',
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-color': ['coalesce', ['get', 'color'], '#888888'],
          'circle-radius': 5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
        },
      })

      // Fit bounds to data
      const bounds = new maplibregl.LngLatBounds()
      let hasValidBounds = false

      for (const feature of frontlineData.features) {
        if (!feature.geometry) continue

        const extendBounds = (coords: any) => {
          if (typeof coords[0] === 'number') {
            bounds.extend(coords as [number, number])
            hasValidBounds = true
          } else {
            for (const c of coords) extendBounds(c)
          }
        }

        extendBounds(feature.geometry.coordinates)
      }

      if (hasValidBounds) {
        mapInstance.fitBounds(bounds, { padding: 50, maxZoom: 8 })
      }
    }

    if (mapInstance.isStyleLoaded()) {
      updateLayers()
    } else {
      mapInstance.on('load', updateLayers)
    }
  }, [frontlineData])

  // Playback animation
  useEffect(() => {
    if (isPlaying && dates.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setSelectedDateIndex((prev) => {
          if (prev >= dates.length - 1) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1500)
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, dates.length])

  const currentDate = dates[selectedDateIndex]
  const currentSides = useMemo(() => {
    if (!frontlineData) return []
    const sides = new Set<string>()
    for (const f of frontlineData.features) {
      if (f.properties.controlled_by) {
        sides.add(f.properties.controlled_by)
      }
    }
    return Array.from(sides)
  }, [frontlineData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#FFF5F6' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#E8C8C8', borderTopColor: '#C41E3A' }} />
          <span style={{ color: '#5C3D2E' }}>Loading frontlines data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="p-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E8C8C8' }}>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600' }}>
              Select Conflict
            </label>
            <select
              value={selectedConflict?.id || ''}
              onChange={(e) => {
                const conflict = conflicts.find((c) => c.id === e.target.value)
                setSelectedConflict(conflict || null)
                setIsPlaying(false)
              }}
              className="block w-64 px-3 py-2 rounded-lg focus:outline-none"
              style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', color: '#2C1810' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E8C8C8'}
            >
              <option value="">Choose a conflict...</option>
              {conflicts.map((conflict) => (
                <option key={conflict.id} value={conflict.id}>
                  {conflict.name} ({conflict.frontline_dates_count} snapshots)
                </option>
              ))}
            </select>
          </div>

          {selectedConflict && dates.length > 0 && (
            <>
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium mb-1" style={{ color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem', fontWeight: '600' }}>
                  Date: {currentDate?.date || 'N/A'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={dates.length - 1}
                    value={selectedDateIndex}
                    onChange={(e) => setSelectedDateIndex(Number(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: '#E8C8C8' }}
                  />
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors text-white"
                    style={{ background: isPlaying ? '#8B1A1A' : '#C41E3A' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isPlaying ? '#6B1515' : '#8B1A1A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = isPlaying ? '#8B1A1A' : '#C41E3A'}
                  >
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Conflict info card */}
        {selectedConflict && (
          <div className="absolute top-4 left-4 rounded-lg p-4 max-w-xs" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.12)' }}>
            <h3 className="font-semibold mb-1" style={{ color: '#8B1A1A' }}>
              {selectedConflict.name}
            </h3>
            {selectedConflict.start_date && (
              <p className="text-xs mb-2" style={{ color: '#8B7355' }}>
                {selectedConflict.start_date}{selectedConflict.end_date ? ` — ${selectedConflict.end_date}` : ' — ongoing'}
              </p>
            )}
            {selectedConflict.conflict_type && (
              <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: 'rgba(196, 30, 58, 0.1)', color: '#C41E3A' }}>
                {selectedConflict.conflict_type.replace(/_/g, ' ')}
              </span>
            )}
            <p className="text-xs mt-2" style={{ color: '#5C3D2E' }}>
              {dates.length} frontline snapshots
            </p>
          </div>
        )}

        {/* Legend */}
        {currentSides.length > 0 && (
          <div className="absolute bottom-4 left-4 rounded-lg p-4 max-w-xs" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.12)' }}>
            <h3 className="font-semibold mb-1" style={{ color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
              Forces
            </h3>
            <div className="text-sm mb-3" style={{ color: '#8B7355' }}>
              {currentDate?.date}
            </div>
            <div className="space-y-2">
              {currentSides.map((side) => {
                const feature = frontlineData?.features.find(
                  (f) => f.properties.controlled_by === side
                )
                const color = feature?.properties.color || '#888888'
                return (
                  <div key={side} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm" style={{ color: '#5C3D2E' }}>
                      {SIDE_LABELS[side] || side}
                    </span>
                  </div>
                )
              })}
            </div>
            {frontlineData?.features[0]?.properties.notes && (
              <div className="mt-3 pt-3 text-xs" style={{ borderTop: '1px solid #E8C8C8', color: '#8B7355' }}>
                {frontlineData.features[0].properties.notes}
              </div>
            )}
          </div>
        )}

        {/* No data message */}
        {!selectedConflict && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255, 245, 246, 0.6)' }}>
            <div className="rounded-lg p-6 text-center" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderTop: '3px solid #C41E3A', boxShadow: '0 2px 8px rgba(139, 26, 26, 0.12)' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#8B1A1A' }}>
                Select a Conflict
              </h3>
              <p style={{ color: '#5C3D2E' }}>
                Choose a conflict from the dropdown above to view historical frontlines
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

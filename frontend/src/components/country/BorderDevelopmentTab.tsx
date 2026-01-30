import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useAllBordersGeoJSON } from '../../api/geography'

interface BorderDevelopmentTabProps {
  countryId: string
  countryName: string
}

const MAIN_COUNTRY_COLOR = '#EF4444'
const NEIGHBOR_COLOR = '#94A3B8'
const BORDER_COLOR = '#1E293B'

interface BorderFeature {
  type: 'Feature'
  properties: {
    id?: string
    name?: string
    valid_from?: string
    valid_to?: string | null
    isMain?: boolean
  }
  geometry: {
    type: string
    coordinates: number[] | number[][] | number[][][] | number[][][][]
  }
}

export default function BorderDevelopmentTab({ countryId, countryName }: BorderDevelopmentTabProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const { data: allBordersGeoJSON, isLoading } = useAllBordersGeoJSON()

  // Get available years for this country
  const yearRange = useMemo(() => {
    if (!allBordersGeoJSON?.features) return { min: 1900, max: new Date().getFullYear() }
    
    const countryFeatures = (allBordersGeoJSON.features as BorderFeature[]).filter(
      f => f.properties.id === countryId
    )
    
    if (countryFeatures.length === 0) return { min: 1900, max: new Date().getFullYear() }
    
    let minYear = Infinity
    let maxYear = -Infinity
    
    for (const feature of countryFeatures) {
      const from = new Date(feature.properties.valid_from || '1900-01-01').getFullYear()
      const to = feature.properties.valid_to 
        ? new Date(feature.properties.valid_to).getFullYear() 
        : new Date().getFullYear()
      
      minYear = Math.min(minYear, from)
      maxYear = Math.max(maxYear, to)
    }
    
    return { min: minYear, max: maxYear }
  }, [allBordersGeoJSON, countryId])

  // Filter borders for a specific year
  const filteredGeoJSON = useMemo(() => {
    if (!allBordersGeoJSON?.features) return null
    
    const features = allBordersGeoJSON.features as BorderFeature[]
    const targetDate = selectedYear + '-07-01'
    
    // Get the main country border
    const mainCountryFeature = features.find(f => {
      if (f.properties.id !== countryId) return false
      const validFrom = f.properties.valid_from || '1900-01-01'
      const validTo = f.properties.valid_to
      if (validFrom > targetDate) return false
      if (validTo && validTo < targetDate) return false
      return true
    })
    
    if (!mainCountryFeature) return null
    
    // Get main country bounding box to find neighbors
    let bbox: [number, number, number, number] = [180, 90, -180, -90]
    
    const extractCoords = (coords: any): void => {
      if (typeof coords[0] === 'number') {
        bbox[0] = Math.min(bbox[0], coords[0])
        bbox[1] = Math.min(bbox[1], coords[1])
        bbox[2] = Math.max(bbox[2], coords[0])
        bbox[3] = Math.max(bbox[3], coords[1])
      } else {
        for (const coord of coords) {
          extractCoords(coord)
        }
      }
    }
    
    extractCoords(mainCountryFeature.geometry.coordinates)
    
    // Expand bbox by 10 degrees to capture neighbors
    const expandedBbox: [number, number, number, number] = [
      bbox[0] - 10, bbox[1] - 10, bbox[2] + 10, bbox[3] + 10
    ]
    
    // Find neighboring countries (those whose borders are within expanded bbox)
    const neighborFeatures = features.filter(f => {
      if (f.properties.id === countryId) return false
      const validFrom = f.properties.valid_from || '1900-01-01'
      const validTo = f.properties.valid_to
      if (validFrom > targetDate) return false
      if (validTo && validTo < targetDate) return false
      
      // Check if any part of this country is in our expanded bbox
      let inBbox = false
      const checkInBbox = (coords: any): void => {
        if (inBbox) return
        if (typeof coords[0] === 'number') {
          if (coords[0] >= expandedBbox[0] && coords[0] <= expandedBbox[2] &&
              coords[1] >= expandedBbox[1] && coords[1] <= expandedBbox[3]) {
            inBbox = true
          }
        } else {
          for (const coord of coords) {
            checkInBbox(coord)
          }
        }
      }
      checkInBbox(f.geometry.coordinates)
      return inBbox
    })
    
    return {
      type: 'FeatureCollection' as const,
      features: [
        ...neighborFeatures.map(f => ({
          ...f,
          properties: { ...f.properties, isMain: false }
        })),
        { ...mainCountryFeature, properties: { ...mainCountryFeature.properties, isMain: true } }
      ]
    }
  }, [allBordersGeoJSON, countryId, selectedYear])

  // Get border changes history
  const borderChanges = useMemo(() => {
    if (!allBordersGeoJSON?.features) return []
    
    const features = allBordersGeoJSON.features as BorderFeature[]
    
    return features
      .filter(f => f.properties.id === countryId)
      .map(f => ({
        validFrom: new Date(f.properties.valid_from || '1900-01-01').getFullYear(),
        validTo: f.properties.valid_to 
          ? new Date(f.properties.valid_to).getFullYear() 
          : null
      }))
      .sort((a, b) => a.validFrom - b.validFrom)
  }, [allBordersGeoJSON, countryId])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

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
          }
        },
        layers: [
          {
            id: 'carto-light',
            type: 'raster',
            source: 'carto-light',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [0, 30],
      zoom: 3,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update map data when filtered GeoJSON changes
  useEffect(() => {
    if (!map.current || !filteredGeoJSON) return

    const mapInstance = map.current

    const updateLayers = () => {
      // Remove existing layers and sources
      if (mapInstance.getLayer('country-fills')) {
        mapInstance.removeLayer('country-fills')
      }
      if (mapInstance.getLayer('country-borders')) {
        mapInstance.removeLayer('country-borders')
      }
      if (mapInstance.getSource('countries')) {
        mapInstance.removeSource('countries')
      }

      mapInstance.addSource('countries', {
        type: 'geojson',
        data: filteredGeoJSON as GeoJSON.FeatureCollection,
      })

      mapInstance.addLayer({
        id: 'country-fills',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'isMain'], true],
            MAIN_COUNTRY_COLOR,
            NEIGHBOR_COLOR,
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'isMain'], true],
            0.7,
            0.4,
          ],
        },
      })

      mapInstance.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': BORDER_COLOR,
          'line-width': [
            'case',
            ['==', ['get', 'isMain'], true],
            2,
            1,
          ],
        },
      })

      // Fit to main country bounds
      const mainFeature = filteredGeoJSON.features.find(f => f.properties.isMain) as BorderFeature | undefined
      if (mainFeature) {
        const coords: number[][] = []
        const extractCoords = (c: any): void => {
          if (typeof c[0] === 'number') {
            coords.push(c)
          } else {
            for (const sub of c) extractCoords(sub)
          }
        }
        extractCoords(mainFeature.geometry.coordinates)
        
        if (coords.length > 0) {
          const bounds = coords.reduce(
            (b, c) => {
              b[0][0] = Math.min(b[0][0], c[0])
              b[0][1] = Math.min(b[0][1], c[1])
              b[1][0] = Math.max(b[1][0], c[0])
              b[1][1] = Math.max(b[1][1], c[1])
              return b
            },
            [[180, 90], [-180, -90]] as [[number, number], [number, number]]
          )
          
          mapInstance.fitBounds(bounds as maplibregl.LngLatBoundsLike, {
            padding: 50,
            maxZoom: 6
          })
        }
      }
    }

    if (mapInstance.isStyleLoaded()) {
      updateLayers()
    } else {
      mapInstance.on('load', updateLayers)
    }
  }, [filteredGeoJSON])

  // Playback animation
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setSelectedYear(prev => {
          if (prev >= yearRange.max) {
            setIsPlaying(false)
            return yearRange.min
          }
          return prev + 1
        })
      }, 500)
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, yearRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Loading border data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div ref={mapContainer} className="h-96 w-full" />
      </div>

      {/* Time controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {countryName} in {selectedYear}
          </h3>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={'px-4 py-2 rounded-lg font-medium transition-colors ' + (
              isPlaying 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {isPlaying ? 'Stop' : 'Play Animation'}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 w-12">{yearRange.min}</span>
          <input
            type="range"
            min={yearRange.min}
            max={yearRange.max}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 w-12 text-right">{yearRange.max}</span>
        </div>
      </div>

      {/* Border history */}
      {borderChanges.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Border Changes</h3>
          <div className="space-y-2">
            {borderChanges.map((change, index) => (
              <div 
                key={index}
                className={'p-3 rounded-lg cursor-pointer transition-colors ' + (
                  selectedYear >= change.validFrom && (!change.validTo || selectedYear <= change.validTo)
                    ? 'bg-red-100 border-2 border-red-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                )}
                onClick={() => setSelectedYear(change.validFrom)}
              >
                <span className="font-medium">
                  {change.validFrom} - {change.validTo || 'Present'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: MAIN_COUNTRY_COLOR }}></div>
            <span>{countryName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: NEIGHBOR_COLOR }}></div>
            <span>Neighboring Countries</span>
          </div>
        </div>
      </div>
    </div>
  )
}

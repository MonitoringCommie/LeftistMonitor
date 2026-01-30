import { useEffect, useRef, useCallback, useState, useMemo, memo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import { useAllBordersGeoJSON, useCountryRelationships } from '../../api/geography'
import { getActiveConflicts, ConflictMapItem } from '../../api/conflicts'
import { getConflictsWithFrontlines, getFrontlineGeoJSON, FrontlineGeoJSON, ConflictWithFrontlines } from '../../api/frontlines'
import { 
  useSelectedYear, 
  useShowConflicts, 
  useToggleConflicts, 
  useShowPalestine, 
  useTogglePalestine,
  useShowKurdistan,
  useToggleKurdistan,
  useShowWesternSahara,
  useToggleWesternSahara,
  useShowKashmir,
  useToggleKashmir,
  useShowTibet,
  useToggleTibet,
  useShowIreland,
  useToggleIreland,
  useShowWestPapua,
  useToggleWestPapua
} from '../../stores/mapStore'
import PalestineOverlay from './PalestineOverlay'
import KurdistanOverlay from './KurdistanOverlay'
import KashmirOverlay from './KashmirOverlay'
import TibetOverlay from './TibetOverlay'
import WesternSaharaOverlay from './WesternSaharaOverlay'
import IrelandOverlay from './IrelandOverlay'
import WestPapuaOverlay from './WestPapuaOverlay'

const COUNTRY_FILL_COLOR = '#627BC1'
const COUNTRY_BORDER_COLOR = '#1E293B'
const CONFLICT_COUNTRY_COLOR = '#DC2626'

const RELATIONSHIP_COLORS: Record<string, string> = {
  ally: '#22c55e',
  partner: '#3b82f6',
  enemy: '#dc2626',
  rival: '#f97316',
  neutral: '#9ca3af',
}

// Memoized filter function - moved outside component
const filterBordersByYear = (features: any[], year: number): any[] => {
  const targetDate = `${year}-07-01`
  const validFeatures = features.filter(feature => {
    const validFrom = feature.properties?.valid_from
    const validTo = feature.properties?.valid_to
    if (!validFrom) return false
    return validFrom <= targetDate && (!validTo || validTo >= targetDate)
  })

  const countryMap = new Map<string, any>()
  for (const feature of validFeatures) {
    const countryId = feature.properties.id
    if (!countryId) continue
    const existing = countryMap.get(countryId)
    if (!existing || (feature.properties.valid_from > existing.properties.valid_from)) {
      countryMap.set(countryId, feature)
    }
  }
  return Array.from(countryMap.values())
}

// Centroid calculation helper - memoizable
const calculateCentroid = (feature: any): [number, number] | null => {
  if (!feature.geometry) return null
  const coords = feature.geometry.type === 'MultiPolygon'
    ? feature.geometry.coordinates[0][0]
    : feature.geometry.coordinates[0]
  if (!coords?.length) return null
  let sumLng = 0, sumLat = 0
  for (const [lng, lat] of coords) {
    sumLng += lng
    sumLat += lat
  }
  return [sumLng / coords.length, sumLat / coords.length]
}

const WorldMap = memo(function WorldMap() {
  const navigate = useNavigate()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const popup = useRef<maplibregl.Popup | null>(null)
  const layersInitialized = useRef(false)
  const eventHandlersAttached = useRef(false)

  // Use granular selectors
  const selectedYear = useSelectedYear()
  const showConflicts = useShowConflicts()
  const toggleConflicts = useToggleConflicts()
  const showPalestine = useShowPalestine()
  const togglePalestine = useTogglePalestine()
  const showKurdistan = useShowKurdistan()
  const toggleKurdistan = useToggleKurdistan()
  const showWesternSahara = useShowWesternSahara()
  const toggleWesternSahara = useToggleWesternSahara()
  const showKashmir = useShowKashmir()
  const toggleKashmir = useToggleKashmir()
  const showTibet = useShowTibet()
  const toggleTibet = useToggleTibet()
  const showIreland = useShowIreland()
  const toggleIreland = useToggleIreland()
  const showWestPapua = useShowWestPapua()
  const toggleWestPapua = useToggleWestPapua()

  const [showRelationships, setShowRelationships] = useState(false)
  const [showFrontlines, setShowFrontlines] = useState(false)
  const [conflicts, setConflicts] = useState<ConflictMapItem[]>([])
  const [conflictCountryIds, setConflictCountryIds] = useState<Set<string>>(new Set())
  const [frontlineConflicts, setFrontlineConflicts] = useState<ConflictWithFrontlines[]>([])
  const [activeFrontlines, setActiveFrontlines] = useState<FrontlineGeoJSON | null>(null)

  const { data: allBordersGeoJSON, isLoading } = useAllBordersGeoJSON()
  const { data: relationships } = useCountryRelationships(selectedYear)

  // Memoized filtered borders
  const filteredBorders = useMemo(() => {
    if (!allBordersGeoJSON?.features) return null
    return {
      type: 'FeatureCollection' as const,
      features: filterBordersByYear(allBordersGeoJSON.features, selectedYear)
    }
  }, [allBordersGeoJSON, selectedYear])

  // Memoized country centroids - calculated once per border update
  const countryCentroids = useMemo(() => {
    if (!filteredBorders) return new Map<string, [number, number]>()
    const centroids = new Map<string, [number, number]>()
    for (const feature of filteredBorders.features) {
      const id = feature.properties?.id
      if (!id) continue
      const centroid = calculateCentroid(feature)
      if (centroid) centroids.set(id, centroid)
    }
    return centroids
  }, [filteredBorders])

  // Memoized relationship lines
  const relationshipLines = useMemo(() => {
    if (!relationships || !filteredBorders || countryCentroids.size === 0) return null

    const features = relationships.filter(rel => {
      const hasA = (rel.country_a_lat && rel.country_a_lng) || countryCentroids.has(rel.country_a_id)
      const hasB = (rel.country_b_lat && rel.country_b_lng) || countryCentroids.has(rel.country_b_id)
      return hasA && hasB
    }).map(rel => ({
      type: 'Feature' as const,
      properties: {
        id: rel.id,
        name: rel.name,
        nature: rel.relationship_nature,
        type: rel.relationship_type,
        country_a: rel.country_a_name,
        country_b: rel.country_b_name,
        color: RELATIONSHIP_COLORS[rel.relationship_nature] || RELATIONSHIP_COLORS.neutral,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          (rel.country_a_lat && rel.country_a_lng)
            ? [rel.country_a_lng, rel.country_a_lat]
            : countryCentroids.get(rel.country_a_id) || [0, 0],
          (rel.country_b_lat && rel.country_b_lng)
            ? [rel.country_b_lng, rel.country_b_lat]
            : countryCentroids.get(rel.country_b_id) || [0, 0],
        ],
      },
    }))
    return { type: 'FeatureCollection' as const, features }
  }, [relationships, filteredBorders, countryCentroids])

  // Fetch conflicts - with cleanup
  useEffect(() => {
    if (!showConflicts) {
      setConflicts([])
      setConflictCountryIds(new Set())
      return
    }

    let cancelled = false
    getActiveConflicts(selectedYear).then((data) => {
      if (cancelled) return
      setConflicts(data)
      const ids = new Set<string>()
      data.forEach(c => c.countries.forEach(cc => {
        if (cc.country_id) ids.add(cc.country_id)
      }))
      setConflictCountryIds(ids)
    }).catch(err => {
      if (!cancelled) console.error(err)
    })

    return () => { cancelled = true }
  }, [showConflicts, selectedYear])

  // Fetch frontlines conflicts list - once
  useEffect(() => {
    let cancelled = false
    getConflictsWithFrontlines().then(data => {
      if (!cancelled) setFrontlineConflicts(data)
    }).catch(err => {
      if (!cancelled) console.error(err)
    })
    return () => { cancelled = true }
  }, [])

  // Fetch frontlines for selected year
  useEffect(() => {
    if (!showFrontlines || frontlineConflicts.length === 0) {
      setActiveFrontlines(null)
      return
    }

    const targetDate = `${selectedYear}-07-01`
    const activeConflictsWithFrontlines = frontlineConflicts.filter(c => {
      if (!c.first_frontline_date || !c.last_frontline_date) return false
      return c.first_frontline_date <= targetDate && c.last_frontline_date >= targetDate
    })

    if (activeConflictsWithFrontlines.length === 0) {
      setActiveFrontlines(null)
      return
    }

    let cancelled = false
    const conflict = activeConflictsWithFrontlines[0]
    getFrontlineGeoJSON(conflict.id, targetDate)
      .then(data => { if (!cancelled) setActiveFrontlines(data) })
      .catch(err => { if (!cancelled) console.error(err) })

    return () => { cancelled = true }
  }, [showFrontlines, frontlineConflicts, selectedYear])

  // Update map colors for conflicts - batched
  useEffect(() => {
    if (!map.current || !layersInitialized.current) return
    const m = map.current
    if (!m.getLayer('country-fills')) return

    // Only update if layer is visible
    const visibility = m.getLayoutProperty('country-fills', 'visibility')
    if (visibility === 'none') return

    if (showConflicts && conflictCountryIds.size > 0) {
      const expr: any[] = ['case']
      conflictCountryIds.forEach(id => expr.push(['==', ['get', 'id'], id], CONFLICT_COUNTRY_COLOR))
      expr.push(COUNTRY_FILL_COLOR)
      m.setPaintProperty('country-fills', 'fill-color', expr)
    } else {
      m.setPaintProperty('country-fills', 'fill-color', COUNTRY_FILL_COLOR)
    }
  }, [showConflicts, conflictCountryIds])

  // Event handlers - stable references
  const handleCountryClick = useCallback((e: maplibregl.MapLayerMouseEvent) => {
    const id = e.features?.[0]?.properties?.id
    if (id) navigate('/country/' + id)
  }, [navigate])

  const handleCountryMouseEnter = useCallback((e: maplibregl.MapLayerMouseEvent) => {
    const m = map.current
    if (!m || !popup.current) return
    m.getCanvas().style.cursor = 'pointer'
    if (e.features?.[0] && e.lngLat) {
      const name = e.features[0].properties?.name
      popup.current
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${name}</strong><br><span style="font-size:12px;color:#666">Click for details</span>`)
        .addTo(m)
    }
  }, [])

  const handleCountryMouseLeave = useCallback(() => {
    const m = map.current
    if (!m) return
    m.getCanvas().style.cursor = ''
    popup.current?.remove()
  }, [])

  // Initialize map - only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-light': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'],
            tileSize: 256
          }
        },
        layers: [{
          id: 'carto-light',
          type: 'raster',
          source: 'carto-light',
          minzoom: 0,
          maxzoom: 19
        }]
      },
      center: [10, 30],
      zoom: 2,
    })

    m.addControl(new maplibregl.NavigationControl(), 'top-right')
    popup.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
    map.current = m

    return () => {
      popup.current?.remove()
      m.remove()
      map.current = null
      layersInitialized.current = false
      eventHandlersAttached.current = false
    }
  }, [])

  // Initialize layers and attach event handlers - once after map loads
  useEffect(() => {
    if (!map.current || !filteredBorders || layersInitialized.current) return
    const m = map.current

    const init = () => {
      if (m.getSource('countries')) return

      // Add all sources
      m.addSource('countries', { type: 'geojson', data: filteredBorders as any })
      m.addSource('relationships', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addSource('frontlines', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      // Add all layers
      m.addLayer({
        id: 'country-fills',
        type: 'fill',
        source: 'countries',
        paint: { 'fill-color': COUNTRY_FILL_COLOR, 'fill-opacity': 0.7 }
      })
      m.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'countries',
        paint: { 'line-color': COUNTRY_BORDER_COLOR, 'line-width': 1.5 }
      })
      m.addLayer({
        id: 'relationship-lines',
        type: 'line',
        source: 'relationships',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8,
          'line-dasharray': [2, 2]
        },
        layout: { visibility: 'none' }
      })
      m.addLayer({
        id: 'frontlines-fill',
        type: 'fill',
        source: 'frontlines',
        filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']],
        paint: { 'fill-color': ['coalesce', ['get', 'color'], '#888'], 'fill-opacity': 0.4 },
        layout: { visibility: 'none' }
      })
      m.addLayer({
        id: 'frontlines-line',
        type: 'line',
        source: 'frontlines',
        paint: { 'line-color': ['coalesce', ['get', 'color'], '#888'], 'line-width': 2 },
        layout: { visibility: 'none' }
      })

      layersInitialized.current = true

      // Attach event handlers only once
      if (!eventHandlersAttached.current) {
        m.on('click', 'country-fills', handleCountryClick)
        m.on('mouseenter', 'country-fills', handleCountryMouseEnter)
        m.on('mouseleave', 'country-fills', handleCountryMouseLeave)
        eventHandlersAttached.current = true
      }
    }

    if (m.isStyleLoaded()) {
      init()
    } else {
      m.once('load', init) // Use .once() to prevent multiple listeners
    }
  }, [filteredBorders, handleCountryClick, handleCountryMouseEnter, handleCountryMouseLeave])

  // Update sources - batched in single effect
  useEffect(() => {
    if (!map.current || !layersInitialized.current) return
    const m = map.current

    // Batch all source updates together
    requestAnimationFrame(() => {
      if (filteredBorders) {
        const countriesSource = m.getSource('countries') as maplibregl.GeoJSONSource
        countriesSource?.setData(filteredBorders as any)
      }

      if (relationshipLines) {
        const relSource = m.getSource('relationships') as maplibregl.GeoJSONSource
        relSource?.setData(relationshipLines as any)
      }

      const frontlinesSource = m.getSource('frontlines') as maplibregl.GeoJSONSource
      frontlinesSource?.setData(activeFrontlines || { type: 'FeatureCollection', features: [] } as any)
    })
  }, [filteredBorders, relationshipLines, activeFrontlines])

  // Toggle layer visibility
  useEffect(() => {
    if (!map.current || !layersInitialized.current) return
    map.current.setLayoutProperty('relationship-lines', 'visibility', showRelationships ? 'visible' : 'none')
  }, [showRelationships])

  useEffect(() => {
    if (!map.current || !layersInitialized.current) return
    const vis = showFrontlines ? 'visible' : 'none'
    map.current.setLayoutProperty('frontlines-fill', 'visibility', vis)
    map.current.setLayoutProperty('frontlines-line', 'visibility', vis)
  }, [showFrontlines])

  // Memoized relationship counts
  const relationshipCounts = useMemo(() => {
    if (!relationships) return {}
    return relationships.reduce((a, r) => {
      a[r.relationship_nature] = (a[r.relationship_nature] || 0) + 1
      return a
    }, {} as Record<string, number>)
  }, [relationships])

  // Memoized toggle handlers
  const handleToggleRelationships = useCallback(() => setShowRelationships(v => !v), [])
  const handleToggleFrontlines = useCallback(() => setShowFrontlines(v => !v), [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      <div className="absolute top-4 right-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 z-10">
        <span className="text-2xl font-bold text-gray-800">{selectedYear}</span>
      </div>

      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showConflicts}
            onChange={toggleConflicts}
            className="w-4 h-4 text-red-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Conflicts</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRelationships}
            onChange={handleToggleRelationships}
            className="w-4 h-4 text-green-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Alliances</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFrontlines}
            onChange={handleToggleFrontlines}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Frontlines</span>
        </label>
        
        <div className="border-t border-gray-200 my-2 pt-2">
          <div className="text-xs font-semibold text-gray-500 mb-2">LIBERATION STRUGGLES</div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPalestine}
                onChange={togglePalestine}
                className="w-4 h-4 text-red-800 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Palestine</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showKurdistan}
                onChange={toggleKurdistan}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kurdistan</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWesternSahara}
                onChange={toggleWesternSahara}
                className="w-4 h-4 text-yellow-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Western Sahara</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showKashmir}
                onChange={toggleKashmir}
                className="w-4 h-4 text-green-700 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Kashmir</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTibet}
                onChange={toggleTibet}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Tibet</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showIreland}
                onChange={toggleIreland}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Ireland</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWestPapua}
                onChange={toggleWestPapua}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">West Papua</span>
            </label>
          </div>
        </div>
        
        <Link to="/frontlines" className="block text-xs text-blue-600 hover:underline mt-2">
          Detailed Frontlines View
        </Link>
      </div>

      {showRelationships && relationships && relationships.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm font-medium text-gray-700 mb-2">Relationships</div>
          {Object.entries(RELATIONSHIP_COLORS).map(([nature, color]) => {
            const count = relationshipCounts[nature] || 0
            if (count === 0) return null
            return (
              <div key={nature} className="flex items-center gap-2 mb-1">
                <div className="w-6 h-0.5" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-600 capitalize">{nature} ({count})</span>
              </div>
            )
          })}
        </div>
      )}

      {showConflicts && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
          <div className="text-sm font-medium text-gray-700 mb-2">Active Conflicts ({selectedYear})</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: CONFLICT_COUNTRY_COLOR }} />
            <span className="text-xs text-gray-600">Countries in conflict</span>
          </div>
          {conflicts.length > 0 ? (
            <div className="max-h-32 overflow-y-auto">
              {conflicts.slice(0, 8).map(c => (
                <div key={c.id} className="text-xs text-gray-600 py-0.5">{c.name}</div>
              ))}
              {conflicts.length > 8 && <div className="text-xs text-gray-400">+{conflicts.length - 8} more</div>}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No active conflicts</div>
          )}
        </div>
      )}

      {showFrontlines && activeFrontlines && activeFrontlines.features.length > 0 && (
        <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="text-sm font-medium text-gray-700 mb-1">Frontlines</div>
          <div className="text-xs text-gray-500">{activeFrontlines.features[0]?.properties.conflict_name}</div>
        </div>
      )}

      {/* Liberation Struggle Overlays */}
      <PalestineOverlay map={map.current} visible={showPalestine} />
      <KurdistanOverlay map={map.current} visible={showKurdistan} />
      <KashmirOverlay map={map.current} visible={showKashmir} />
      <TibetOverlay map={map.current} visible={showTibet} />
      <WesternSaharaOverlay map={map.current} visible={showWesternSahara} />
      <IrelandOverlay map={map.current} visible={showIreland} />
      <WestPapuaOverlay map={map.current} visible={showWestPapua} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg px-4 py-2 shadow-lg">Loading map...</div>
        </div>
      )}
    </div>
  )
})

export default WorldMap

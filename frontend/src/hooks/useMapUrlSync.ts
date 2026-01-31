import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMapStore } from '../stores/mapStore'

/**
 * Hook to sync map state with URL search params
 * Enables shareable links and browser back/forward navigation
 * 
 * URL format: /map?year=2019&lat=30&lng=10&zoom=4&overlays=palestine,conflicts
 */
export function useMapUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialized = useRef(false)
  
  const {
    selectedYear,
    center,
    zoom,
    showConflicts,
    showPalestine,
    showKurdistan,
    showWesternSahara,
    showKashmir,
    showTibet,
    showIreland,
    showWestPapua,
    setYear,
    setCenter,
    setZoom,
  } = useMapStore()

  // On mount, read state from URL
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const yearParam = searchParams.get('year')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const zoomParam = searchParams.get('zoom')

    if (yearParam) {
      const year = parseInt(yearParam, 10)
      if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
        setYear(year)
      }
    }

    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter([lng, lat])
      }
    }

    if (zoomParam) {
      const z = parseFloat(zoomParam)
      if (!isNaN(z) && z >= 1 && z <= 20) {
        setZoom(z)
      }
    }

    // Parse overlay toggles from URL
    const overlaysParam = searchParams.get('overlays')
    if (overlaysParam) {
      const overlays = overlaysParam.split(',')
      const store = useMapStore.getState()
      
      if (overlays.includes('conflicts') && !store.showConflicts) {
        store.toggleConflicts()
      }
      if (overlays.includes('palestine') && !store.showPalestine) {
        store.togglePalestine()
      }
      if (overlays.includes('kurdistan') && !store.showKurdistan) {
        store.toggleKurdistan()
      }
      if (overlays.includes('westernsahara') && !store.showWesternSahara) {
        store.toggleWesternSahara()
      }
      if (overlays.includes('kashmir') && !store.showKashmir) {
        store.toggleKashmir()
      }
      if (overlays.includes('tibet') && !store.showTibet) {
        store.toggleTibet()
      }
      if (overlays.includes('ireland') && !store.showIreland) {
        store.toggleIreland()
      }
      if (overlays.includes('westpapua') && !store.showWestPapua) {
        store.toggleWestPapua()
      }
    }
  }, [searchParams, setYear, setCenter, setZoom])

  // Update URL when state changes (debounced to avoid too many updates)
  useEffect(() => {
    if (!initialized.current) return

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams()
      
      // Only add non-default values to keep URL clean
      if (selectedYear !== 2019) {
        params.set('year', String(selectedYear))
      }
      
      // Round coordinates to 2 decimal places
      const [lng, lat] = center
      if (Math.abs(lng - 10) > 1 || Math.abs(lat - 30) > 1) {
        params.set('lat', lat.toFixed(2))
        params.set('lng', lng.toFixed(2))
      }
      
      if (zoom !== 2) {
        params.set('zoom', zoom.toFixed(1))
      }

      // Build overlays string
      const overlays: string[] = []
      if (showConflicts) overlays.push('conflicts')
      if (showPalestine) overlays.push('palestine')
      if (showKurdistan) overlays.push('kurdistan')
      if (showWesternSahara) overlays.push('westernsahara')
      if (showKashmir) overlays.push('kashmir')
      if (showTibet) overlays.push('tibet')
      if (showIreland) overlays.push('ireland')
      if (showWestPapua) overlays.push('westpapua')
      
      if (overlays.length > 0) {
        params.set('overlays', overlays.join(','))
      }

      // Update URL without triggering navigation
      setSearchParams(params, { replace: true })
    }, 500) // Debounce by 500ms

    return () => clearTimeout(timeoutId)
  }, [
    selectedYear,
    center,
    zoom,
    showConflicts,
    showPalestine,
    showKurdistan,
    showWesternSahara,
    showKashmir,
    showTibet,
    showIreland,
    showWestPapua,
    setSearchParams,
  ])
}

/**
 * Generate a shareable URL for the current map state
 */
export function getShareableMapUrl(): string {
  const state = useMapStore.getState()
  const params = new URLSearchParams()
  
  params.set('year', String(state.selectedYear))
  params.set('lat', state.center[1].toFixed(2))
  params.set('lng', state.center[0].toFixed(2))
  params.set('zoom', state.zoom.toFixed(1))

  const overlays: string[] = []
  if (state.showConflicts) overlays.push('conflicts')
  if (state.showPalestine) overlays.push('palestine')
  if (state.showKurdistan) overlays.push('kurdistan')
  if (state.showWesternSahara) overlays.push('westernsahara')
  if (state.showKashmir) overlays.push('kashmir')
  if (state.showTibet) overlays.push('tibet')
  if (state.showIreland) overlays.push('ireland')
  if (state.showWestPapua) overlays.push('westpapua')
  
  if (overlays.length > 0) {
    params.set('overlays', overlays.join(','))
  }

  return `${window.location.origin}/map?${params.toString()}`
}

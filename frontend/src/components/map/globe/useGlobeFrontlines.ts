import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getFrontlineDates,
  getFrontlineGeoJSON,
  FrontlineDate,
  FrontlineGeoJSON,
} from '../../../api/frontlines'
import type { FrontlineSideInfo } from './types'
import { SIDE_LABELS, SIDE_COLORS } from './types'

interface FrontlineState {
  dates: FrontlineDate[]
  selectedDateIndex: number
  geojson: FrontlineGeoJSON | null
  sides: FrontlineSideInfo[]
  loading: boolean
  isPlaying: boolean
}

export function useGlobeFrontlines(conflictId: string | null) {
  const [state, setState] = useState<FrontlineState>({
    dates: [],
    selectedDateIndex: 0,
    geojson: null,
    sides: [],
    loading: false,
    isPlaying: false,
  })

  // Cache: conflictId → dates list
  const datesCache = useRef<Map<string, FrontlineDate[]>>(new Map())
  // Cache: "conflictId|date" → FrontlineGeoJSON
  const geojsonCache = useRef<Map<string, FrontlineGeoJSON>>(new Map())
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load dates when conflict changes
  useEffect(() => {
    if (!conflictId) {
      setState(s => ({
        ...s,
        dates: [],
        selectedDateIndex: 0,
        geojson: null,
        sides: [],
        loading: false,
        isPlaying: false,
      }))
      return
    }

    const cached = datesCache.current.get(conflictId)
    if (cached) {
      setState(s => ({
        ...s,
        dates: cached,
        selectedDateIndex: 0,
        geojson: null,
        sides: [],
        loading: false,
      }))
      return
    }

    setState(s => ({ ...s, loading: true }))

    getFrontlineDates(conflictId)
      .then(dates => {
        datesCache.current.set(conflictId, dates)
        setState(s => ({
          ...s,
          dates,
          selectedDateIndex: 0,
          geojson: null,
          sides: [],
          loading: false,
        }))
      })
      .catch(() => {
        setState(s => ({ ...s, dates: [], loading: false }))
      })
  }, [conflictId])

  // Load GeoJSON when date index changes
  useEffect(() => {
    if (!conflictId || state.dates.length === 0) return

    const targetDate = state.dates[state.selectedDateIndex]?.date
    if (!targetDate) return

    const cacheKey = `${conflictId}|${targetDate}`
    const cached = geojsonCache.current.get(cacheKey)
    if (cached) {
      const sides = extractSides(cached)
      setState(s => ({ ...s, geojson: cached, sides }))
      return
    }

    getFrontlineGeoJSON(conflictId, targetDate)
      .then(geojson => {
        geojsonCache.current.set(cacheKey, geojson)

        // Keep cache bounded
        if (geojsonCache.current.size > 100) {
          const firstKey = geojsonCache.current.keys().next().value
          if (firstKey !== undefined) geojsonCache.current.delete(firstKey)
        }

        const sides = extractSides(geojson)
        setState(s => ({ ...s, geojson, sides }))
      })
      .catch(() => {
        setState(s => ({ ...s, geojson: null, sides: [] }))
      })
  }, [conflictId, state.selectedDateIndex, state.dates])

  // Playback
  useEffect(() => {
    if (state.isPlaying && state.dates.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setState(s => {
          if (s.selectedDateIndex >= s.dates.length - 1) {
            return { ...s, isPlaying: false, selectedDateIndex: 0 }
          }
          return { ...s, selectedDateIndex: s.selectedDateIndex + 1 }
        })
      }, 1500)
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = null
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }
  }, [state.isPlaying, state.dates.length])

  const setDateIndex = useCallback((index: number) => {
    setState(s => ({ ...s, selectedDateIndex: Math.max(0, Math.min(index, s.dates.length - 1)) }))
  }, [])

  const togglePlay = useCallback(() => {
    setState(s => ({ ...s, isPlaying: !s.isPlaying }))
  }, [])

  return {
    dates: state.dates,
    selectedDateIndex: state.selectedDateIndex,
    geojson: state.geojson,
    sides: state.sides,
    loading: state.loading,
    isPlaying: state.isPlaying,
    currentDate: state.dates[state.selectedDateIndex]?.date ?? null,
    setDateIndex,
    togglePlay,
  }
}

function extractSides(geojson: FrontlineGeoJSON): FrontlineSideInfo[] {
  const sideMap = new Map<string, string>()

  for (const f of geojson.features) {
    const side = f.properties.controlled_by
    if (side && !sideMap.has(side)) {
      sideMap.set(side, f.properties.color || SIDE_COLORS[side] || '#888888')
    }
  }

  return Array.from(sideMap.entries()).map(([side, color]) => ({
    side,
    color,
    label: SIDE_LABELS[side] || side,
  }))
}

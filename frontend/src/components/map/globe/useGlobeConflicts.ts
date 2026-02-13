import { useState, useEffect, useRef, useCallback } from 'react'
import { getActiveConflicts, ConflictMapItem } from '../../../api/conflicts'
import { getConflictsWithFrontlines } from '../../../api/frontlines'
import type { GlobeConflict } from './types'

const DEBOUNCE_MS = 200

interface FrontlineInfo {
  ids: Set<string>
  /** Map from frontline conflict name (lowercase) → frontline conflict ID */
  nameToId: Map<string, string>
}

/** Check if an active conflict matches a frontline conflict (by ID or name containment) */
function matchFrontline(item: ConflictMapItem, info: FrontlineInfo): string | null {
  // Direct ID match
  if (info.ids.has(item.id)) return item.id

  // Name containment: "Russo-Ukrainian War" matches "northern Kharkiv front of the Russo-Ukrainian War"
  const nameLower = item.name.toLowerCase()
  for (const [flName, flId] of info.nameToId) {
    if (nameLower.includes(flName) || flName.includes(nameLower)) {
      return flId
    }
  }
  return null
}

/** Convert API ConflictMapItem to GlobeConflict with lat/lng and frontline info */
function toGlobeConflict(
  item: ConflictMapItem,
  frontlineInfo: FrontlineInfo
): GlobeConflict | null {
  // skip conflicts without coordinates
  if (item.lat == null || item.lng == null) return null

  const startYear = item.start_date ? new Date(item.start_date).getFullYear() : null
  const endYear = item.end_date ? new Date(item.end_date).getFullYear() : 2026
  if (startYear == null) return null

  const frontlineId = matchFrontline(item, frontlineInfo)

  return {
    id: item.id,
    name: item.name,
    startYear,
    endYear,
    lat: item.lat,
    lng: item.lng,
    conflict_type: item.conflict_type,
    intensity: item.intensity,
    participants: item.countries.map(c => ({
      name: c.name,
      side: c.side,
      country_id: c.country_id,
    })),
    hasFrontlines: frontlineId !== null,
    frontlineConflictId: frontlineId ?? undefined,
  }
}

export function useGlobeConflicts(currentYear: number) {
  const [conflicts, setConflicts] = useState<GlobeConflict[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cache: year → GlobeConflict[]
  const cacheRef = useRef<Map<number, GlobeConflict[]>>(new Map())
  const frontlineInfoRef = useRef<FrontlineInfo>({ ids: new Set(), nameToId: new Map() })
  const frontlineLoadedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load frontline-capable conflict IDs and names once
  useEffect(() => {
    if (frontlineLoadedRef.current) return
    frontlineLoadedRef.current = true

    getConflictsWithFrontlines()
      .then(list => {
        frontlineInfoRef.current = {
          ids: new Set(list.map(c => c.id)),
          nameToId: new Map(list.map(c => [c.name.toLowerCase(), c.id])),
        }
      })
      .catch(() => {
        // Non-critical — frontline indicators just won't show
      })
  }, [])

  const fetchYear = useCallback((year: number) => {
    // Check cache first
    const cached = cacheRef.current.get(year)
    if (cached) {
      setConflicts(cached)
      return
    }

    // Cancel in-flight
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    getActiveConflicts(year)
      .then(items => {
        if (controller.signal.aborted) return

        const mapped = items
          .map(item => toGlobeConflict(item, frontlineInfoRef.current))
          .filter((c): c is GlobeConflict => c !== null)

        cacheRef.current.set(year, mapped)

        // Keep cache bounded (max 50 years)
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value
          if (firstKey !== undefined) cacheRef.current.delete(firstKey)
        }

        setConflicts(mapped)
        setLoading(false)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setError(err?.message || 'Failed to load conflicts')
        setLoading(false)
      })
  }, [])

  // Debounced year change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    // If cached, no debounce needed
    if (cacheRef.current.has(currentYear)) {
      fetchYear(currentYear)
      return
    }

    timerRef.current = setTimeout(() => {
      fetchYear(currentYear)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentYear, fetchYear])

  // Pre-cache adjacent years for smoother scrubbing
  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      const adjacent = [currentYear - 1, currentYear + 1].filter(y => y >= 1900 && y <= 2026)
      for (const y of adjacent) {
        if (!cacheRef.current.has(y)) {
          getActiveConflicts(y)
            .then(items => {
              const mapped = items
                .map(item => toGlobeConflict(item, frontlineInfoRef.current))
                .filter((c): c is GlobeConflict => c !== null)
              cacheRef.current.set(y, mapped)
            })
            .catch(() => {}) // Silent pre-cache failure
        }
      }
    }, 500) // Wait a bit before pre-caching
    return () => clearTimeout(prefetchTimer)
  }, [currentYear])

  return { conflicts, loading, error }
}

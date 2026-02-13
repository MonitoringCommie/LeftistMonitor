import * as THREE from 'three'
import type { GlobeConflict, ConflictMarkerResult, PulseEntry } from './types'

/** Convert lng/lat to sphere position */
function toVec(lng: number, lat: number, r: number = 1.01): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

/** Color palette by conflict type */
export const CONFLICT_TYPE_COLORS: Record<string, number> = {
  interstate_war: 0xff2233,
  civil_war: 0xff7722,
  one_sided: 0xffcc33,
  military_operation: 0xff55aa,
  occupation: 0xaa44ff,
  territorial_dispute: 0x44aaff,
  insurgency: 0xff6644,
  ethnic_conflict: 0xdd5566,
}
const DEFAULT_CONFLICT_COLOR = 0xff4444

export function getConflictColor(type: string | null): number {
  if (!type) return DEFAULT_CONFLICT_COLOR
  const key = type.toLowerCase().replace(/[\s-]+/g, '_')
  return CONFLICT_TYPE_COLORS[key] ?? DEFAULT_CONFLICT_COLOR
}

// Shared geometries (created once, reused across all markers)
const sharedDotGeo = new THREE.SphereGeometry(0.015, 12, 12)
const sharedDotGeoLarge = new THREE.SphereGeometry(0.018, 12, 12)

function makeRingGeo(radius: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}
const sharedRingGeo = makeRingGeo(0.035)
const sharedRingGeoLarge = makeRingGeo(0.04)
const sharedOuterRingGeo = makeRingGeo(0.06)

/**
 * Create conflict marker meshes for a list of API conflicts.
 * Conflicts with frontline data get a special double-ring orange-tinted marker.
 * Markers are color-coded by conflict type.
 */
export function createConflictMarkers(conflicts: GlobeConflict[]): ConflictMarkerResult {
  const group = new THREE.Group()
  group.name = 'api-conflict-markers'

  const pulseEntries: PulseEntry[] = []
  const materials: THREE.Material[] = []

  for (const conflict of conflicts) {
    const markerGroup = new THREE.Group()
    const hasFrontlines = conflict.hasFrontlines
    const baseColor = hasFrontlines ? 0xff8844 : getConflictColor(conflict.conflict_type)
    const dotGeo = hasFrontlines ? sharedDotGeoLarge : sharedDotGeo
    const ringGeo = hasFrontlines ? sharedRingGeoLarge : sharedRingGeo

    // Core dot (unique material for per-type coloring)
    const dotMat = new THREE.MeshBasicMaterial({ color: baseColor })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    markerGroup.add(dot)
    materials.push(dotMat)

    // Inner ring
    const ringMat = new THREE.LineBasicMaterial({ color: baseColor, transparent: true, opacity: 0.5 })
    const ring = new THREE.Line(ringGeo, ringMat)
    markerGroup.add(ring)
    materials.push(ringMat)

    // Double ring for frontline-capable conflicts
    let outerRing: THREE.Line | undefined
    if (hasFrontlines) {
      const outerRingMat = new THREE.LineBasicMaterial({ color: 0xff8844, transparent: true, opacity: 0.3 })
      outerRing = new THREE.Line(sharedOuterRingGeo, outerRingMat)
      markerGroup.add(outerRing)
      materials.push(outerRingMat)
    }

    // Position on globe
    const pos = toVec(conflict.lng, conflict.lat)
    markerGroup.position.copy(pos)
    markerGroup.lookAt(0, 0, 0)
    markerGroup.userData = { conflictId: conflict.id, conflictName: conflict.name }

    group.add(markerGroup)
    pulseEntries.push({ mesh: dot, ring, outerRing, pulse: Math.random() * Math.PI * 2 })
  }

  return {
    group,
    pulseEntries,
    dispose: () => {
      for (const m of materials) m.dispose()
      group.clear()
      // NOTE: shared geometries are NOT disposed — they're module-level singletons
    },
  }
}

/** Animate pulse on conflict markers (called every frame) */
export function pulseConflictMarkers(entries: PulseEntry[]) {
  for (const m of entries) {
    m.pulse = (m.pulse + 0.03) % (Math.PI * 2)
    const scale = 1 + Math.sin(m.pulse) * 0.3
    m.mesh.scale.set(scale, scale, scale)
    if (m.ring.material instanceof THREE.LineBasicMaterial) {
      m.ring.material.opacity = 0.5 + Math.sin(m.pulse) * 0.3
    }
    if (m.outerRing?.material instanceof THREE.LineBasicMaterial) {
      m.outerRing.material.opacity = 0.3 + Math.sin(m.pulse) * 0.2
    }
  }
}

import * as THREE from 'three'

// ==================== Conflict Types ====================

/** A conflict sourced from the API, enriched with lat/lng for globe placement */
export interface GlobeConflict {
  id: string
  name: string
  startYear: number
  endYear: number
  lat: number
  lng: number
  conflict_type: string | null
  intensity: string | null
  participants: GlobeConflictParticipant[]
  hasFrontlines: boolean
  /** The parent frontline conflict ID (may differ from this conflict's ID for sub-events) */
  frontlineConflictId?: string
}

export interface GlobeConflictParticipant {
  name: string
  side: string | null
  country_id: string | null
}

// ==================== Frontline Types ====================

export interface FrontlineSideInfo {
  side: string
  color: string
  label: string
}

export interface FrontlineSnapshot {
  date: string
  sides: FrontlineSideInfo[]
}

// ==================== Renderer Types ====================

/** Disposable resource handle for GPU cleanup */
export interface Disposable {
  dispose: () => void
}

/** Result of rendering frontline GeoJSON onto the globe */
export interface FrontlineRenderResult extends Disposable {
  group: THREE.Group
  sides: FrontlineSideInfo[]
}

/** Result of rendering conflict markers */
export interface ConflictMarkerResult extends Disposable {
  group: THREE.Group
  pulseEntries: PulseEntry[]
}

export interface PulseEntry {
  mesh: THREE.Mesh
  ring: THREE.Line
  outerRing?: THREE.Line
  pulse: number
}

// ==================== Side label/color maps ====================

export const SIDE_LABELS: Record<string, string> = {
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

export const SIDE_COLORS: Record<string, string> = {
  allies: '#4499dd',
  axis: '#dd4444',
  russia: '#dd4444',
  ukraine: '#4499dd',
  republicans: '#dd4444',
  nationalists: '#4499dd',
  north_korea: '#dd4444',
  south_korea: '#4499dd',
  un_forces: '#44dd99',
  north_vietnam: '#dd4444',
  south_vietnam: '#4499dd',
}

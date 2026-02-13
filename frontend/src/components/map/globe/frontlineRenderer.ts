import * as THREE from 'three'
import { Earcut } from 'three/src/extras/Earcut.js'
import type { FrontlineGeoJSON } from '../../../api/frontlines'
import type { FrontlineRenderResult, FrontlineSideInfo } from './types'
import { SIDE_LABELS, SIDE_COLORS } from './types'

const GLOBE_R = 1.003 // slightly above globe surface
const POLYGON_OPACITY = 0.45
const LINE_WIDTH = 2
const POINT_RADIUS = 0.008

/** Convert lng/lat to sphere position */
function toSphere(lng: number, lat: number, r: number = GLOBE_R): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

/** Parse hex color string to THREE.Color */
function parseColor(hex: string | null, fallback: string = '#888888'): THREE.Color {
  return new THREE.Color(hex || fallback)
}

/**
 * Render a FrontlineGeoJSON FeatureCollection onto a Three.js group
 * positioned on the globe sphere surface.
 *
 * Returns a group and a dispose() function for GPU cleanup.
 */
export function renderFrontlines(geojson: FrontlineGeoJSON): FrontlineRenderResult {
  const group = new THREE.Group()
  group.name = 'frontlines'

  const disposables: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = []
  const sideMap = new Map<string, string>()

  for (const feature of geojson.features) {
    if (!feature.geometry) continue

    const side = feature.properties.controlled_by
    const color = feature.properties.color || SIDE_COLORS[side] || '#888888'
    if (side && !sideMap.has(side)) {
      sideMap.set(side, color)
    }

    const geoType = feature.geometry.type
    const coords = feature.geometry.coordinates

    if (geoType === 'Polygon') {
      renderPolygon(coords, color, group, disposables)
    } else if (geoType === 'MultiPolygon') {
      for (const polygon of coords) {
        renderPolygon(polygon, color, group, disposables)
      }
    } else if (geoType === 'LineString') {
      renderLine(coords, color, group, disposables)
    } else if (geoType === 'MultiLineString') {
      for (const line of coords) {
        renderLine(line, color, group, disposables)
      }
    } else if (geoType === 'Point') {
      renderPoint(coords, color, group, disposables)
    } else if (geoType === 'MultiPoint') {
      for (const point of coords) {
        renderPoint(point, color, group, disposables)
      }
    }
  }

  const sides: FrontlineSideInfo[] = Array.from(sideMap.entries()).map(([side, color]) => ({
    side,
    color,
    label: SIDE_LABELS[side] || side,
  }))

  return {
    group,
    sides,
    dispose: () => {
      for (const d of disposables) {
        d.geometry.dispose()
        d.material.dispose()
      }
      group.clear()
    },
  }
}

function renderPolygon(
  rings: number[][][],
  color: string,
  parent: THREE.Group,
  disposables: { geometry: THREE.BufferGeometry; material: THREE.Material }[]
) {
  if (!rings || rings.length === 0) return

  const outerRing = rings[0]
  if (!outerRing || outerRing.length < 3) return

  // Triangulate in 2D (lng/lat) then project to sphere
  try {
    // Flatten outer ring to earcut format [x0,y0,x1,y1,...]
    const flatCoords: number[] = []
    for (const coord of outerRing) {
      flatCoords.push(coord[0], coord[1])
    }

    // Handle holes
    const holeIndices: number[] = []
    for (let h = 1; h < rings.length; h++) {
      holeIndices.push(flatCoords.length / 2)
      for (const coord of rings[h]) {
        flatCoords.push(coord[0], coord[1])
      }
    }

    const indices = Earcut.triangulate(flatCoords, holeIndices.length > 0 ? holeIndices : undefined, 2)
    if (indices.length === 0) return

    // Build 3D vertices by projecting each 2D point to sphere
    const vertices: number[] = []
    const numPoints = flatCoords.length / 2
    for (let i = 0; i < numPoints; i++) {
      const lng = flatCoords[i * 2]
      const lat = flatCoords[i * 2 + 1]
      const v = toSphere(lng, lat)
      vertices.push(v.x, v.y, v.z)
    }

    // Fill mesh
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setIndex(Array.from(indices))
    geo.computeVertexNormals()

    const mat = new THREE.MeshBasicMaterial({
      color: parseColor(color),
      transparent: true,
      opacity: POLYGON_OPACITY,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    parent.add(new THREE.Mesh(geo, mat))
    disposables.push({ geometry: geo, material: mat })

    // Border line for outer ring
    const borderPts = outerRing.map(c => toSphere(c[0], c[1], GLOBE_R + 0.001))
    if (borderPts.length > 1) {
      // Close the ring
      borderPts.push(borderPts[0].clone())
      const lineGeo = new THREE.BufferGeometry().setFromPoints(borderPts)
      const lineMat = new THREE.LineBasicMaterial({
        color: parseColor(color),
        transparent: true,
        opacity: 0.7,
      })
      parent.add(new THREE.Line(lineGeo, lineMat))
      disposables.push({ geometry: lineGeo, material: lineMat })
    }
  } catch {
    // Triangulation can fail on degenerate polygons — skip silently
  }
}

function renderLine(
  coords: number[][],
  color: string,
  parent: THREE.Group,
  disposables: { geometry: THREE.BufferGeometry; material: THREE.Material }[]
) {
  if (!coords || coords.length < 2) return

  const points = coords.map(c => toSphere(c[0], c[1], GLOBE_R + 0.001))
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  const mat = new THREE.LineBasicMaterial({
    color: parseColor(color),
    transparent: true,
    opacity: 0.8,
    linewidth: LINE_WIDTH,
  })

  parent.add(new THREE.Line(geo, mat))
  disposables.push({ geometry: geo, material: mat })
}

function renderPoint(
  coords: number[],
  color: string,
  parent: THREE.Group,
  disposables: { geometry: THREE.BufferGeometry; material: THREE.Material }[]
) {
  if (!coords || coords.length < 2) return

  const geo = new THREE.SphereGeometry(POINT_RADIUS, 8, 8)
  const mat = new THREE.MeshBasicMaterial({ color: parseColor(color) })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(toSphere(coords[0], coords[1]))
  parent.add(mesh)
  disposables.push({ geometry: geo, material: mat })
}

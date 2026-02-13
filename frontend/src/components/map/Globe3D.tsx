import * as THREE from 'three'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  liberationStruggles,
  citiesData,
} from './globe-data'
import { useGlobeConflicts } from './globe/useGlobeConflicts'
import { useGlobeFrontlines } from './globe/useGlobeFrontlines'
import { createConflictMarkers, pulseConflictMarkers, getConflictColor, CONFLICT_TYPE_COLORS } from './globe/conflictRenderer'
import { renderFrontlines } from './globe/frontlineRenderer'
import type { PulseEntry } from './globe/types'

// ==================== HELPER FUNCTIONS ====================

function toVec(lng: number, lat: number, r: number = 1.01): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

function vec3ToLatLng(vec: THREE.Vector3): { lat: number; lng: number } {
  const v = vec.clone().normalize()
  const lat = Math.asin(v.y) * 180 / Math.PI
  const lng = Math.atan2(v.z, -v.x) * 180 / Math.PI
  return { lat, lng }
}

function pointInPolygon(point: number[], polygon: number[][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1]
    const xj = polygon[j][0], yj = polygon[j][1]
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

/** Format date range — show "Present" for ongoing conflicts */
function formatYearRange(startYear: number, endYear: number): string {
  const end = endYear >= 2026 ? 'Present' : String(endYear)
  return startYear === endYear ? String(startYear) : `${startYear}\u2013${end}`
}

/** Lerp angle toward target */
function lerpAngle(current: number, target: number, speed: number): number {
  return current + (target - current) * speed
}

// ==================== INTERFACES ====================

interface CountryPolygonData {
  id: string
  name: string
  arcs: number[][][]
  centroid: { lat: number; lng: number }
}

interface HoverTooltip {
  x: number
  y: number
  text: string
}

// Playback speeds
const SPEEDS = [0.5, 1, 2, 5] as const
const SPEED_LABELS = ['0.5x', '1x', '2x', '5x']

// ==================== COMPONENT ====================

const Globe3D = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Three.js object refs
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeGroupRef = useRef<THREE.Group | null>(null)
  const globeMeshRef = useRef<THREE.Mesh | null>(null)
  const frameIdRef = useRef<number>(0)

  // Group refs
  const bordersGroupRef = useRef<THREE.Group | null>(null)
  const apiConflictsGroupRef = useRef<THREE.Group | null>(null)
  const liberationGroupRef = useRef<THREE.Group | null>(null)
  const citiesGroupRef = useRef<THREE.Group | null>(null)
  const frontlinesGroupRef = useRef<THREE.Group | null>(null)

  // Country polygon data for click detection
  const countryPolygonsRef = useRef<CountryPolygonData[]>([])

  // Conflict marker data (for pulsing animation)
  const apiConflictPulseRef = useRef<PulseEntry[]>([])
  const apiConflictDisposeRef = useRef<(() => void) | null>(null)
  const liberationMeshesRef = useRef<{ mesh: THREE.Mesh; ring: THREE.Line; pulse: number }[]>([])

  // Frontline dispose ref
  const frontlineDisposeRef = useRef<(() => void) | null>(null)

  // Drag state
  const dragRef = useRef(false)
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const prevXRef = useRef(0)
  const prevYRef = useRef(0)
  const rotXRef = useRef(0.3)
  const rotYRef = useRef(0)
  const targetRotXRef = useRef<number | null>(null)
  const targetRotYRef = useRef<number | null>(null)
  const autoRotateRef = useRef(true)
  const isPlayingRef = useRef(false)
  const currentYearRef = useRef(2026)
  const playbackSpeedRef = useRef(1)

  // Raycasting for hover
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())


  // Zoom animation ref
  const targetZoomRef = useRef<number | null>(null)

  // React state (UI)
  const [currentYear, setCurrentYear] = useState(2026)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [visibility, setVisibility] = useState({
    borders: true,
    conflicts: true,
    cities: true,
    liberation: true,
    frontlines: true
  })
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null)
  const [conflictSearch, setConflictSearch] = useState('')
  const [contextLost, setContextLost] = useState(false)

  // API hooks
  const { conflicts: apiConflicts, loading: conflictsLoading } = useGlobeConflicts(currentYear)
  const frontlines = useGlobeFrontlines(null)

  // Sync state to refs
  useEffect(() => { autoRotateRef.current = autoRotate }, [autoRotate])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { currentYearRef.current = currentYear }, [currentYear])
  useEffect(() => { playbackSpeedRef.current = SPEEDS[speedIdx] }, [speedIdx])

  // ==================== FLY-TO ANIMATION ====================
  const flyTo = useCallback((lat: number, lng: number, zoom?: number) => {
    // Convert lat/lng to rotation angles
    targetRotXRef.current = lat * Math.PI / 180
    targetRotYRef.current = -lng * Math.PI / 180
    if (zoom !== undefined) targetZoomRef.current = zoom
    setAutoRotate(false)
  }, [])

  const resetView = useCallback(() => {
    targetZoomRef.current = 2.8
    targetRotXRef.current = null
    targetRotYRef.current = null
    setAutoRotate(true)
  }, [])

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentYear(y => Math.max(1900, y - 1))
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentYear(y => Math.min(2026, y + 1))
          break
        case ' ':
          e.preventDefault()
          setIsPlaying(v => !v)
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // ==================== MAIN THREE.JS SETUP ====================
  useEffect(() => {
    const container = containerRef.current!
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0e1a')
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.z = 2.8
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // WebGL context loss handling
    const onContextLost = (e: Event) => {
      e.preventDefault()
      setContextLost(true)
      cancelAnimationFrame(frameIdRef.current)
    }
    const onContextRestored = () => {
      setContextLost(false)
    }
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const dl1 = new THREE.DirectionalLight(0xffffff, 1.0)
    dl1.position.set(5, 3, 5)
    scene.add(dl1)
    const dl2 = new THREE.DirectionalLight(0x4488cc, 0.4)
    dl2.position.set(-5, -3, -5)
    scene.add(dl2)

    // Globe group
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)
    globeGroupRef.current = globeGroup

    // Earth
    const globeGeo = new THREE.SphereGeometry(1, 128, 128)
    const globeMat = new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0.0,
    })
    const globeMesh = new THREE.Mesh(globeGeo, globeMat)
    globeGroup.add(globeMesh)
    globeMeshRef.current = globeMesh

    // Load textures
    const loader = new THREE.TextureLoader()
    loader.load(
      '/globe/earth-4k.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        globeMat.map = tex
        globeMat.needsUpdate = true
        loader.load('/globe/earth-topology.png', (bump) => {
          bump.colorSpace = THREE.NoColorSpace
          globeMat.bumpMap = bump
          globeMat.bumpScale = 0.015
          globeMat.needsUpdate = true
        })
        loader.load('/globe/earth-water.png', (rough) => {
          rough.colorSpace = THREE.NoColorSpace
          globeMat.roughnessMap = rough
          globeMat.needsUpdate = true
        })
      },
      undefined,
      (err) => console.error('[Globe] Earth texture FAILED:', err)
    )

    // Atmosphere
    const atmoGeo = new THREE.SphereGeometry(1.02, 64, 64)
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x3388ff, transparent: true, opacity: 0.08, side: THREE.BackSide,
    })
    globeGroup.add(new THREE.Mesh(atmoGeo, atmoMat))

    // Stars
    const starGeo = new THREE.BufferGeometry()
    const starCount = 1500
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 30 + Math.random() * 40
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = r * Math.cos(phi)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })
    scene.add(new THREE.Points(starGeo, starMat))

    // Groups
    const bordersGroup = new THREE.Group()
    bordersGroup.name = 'borders'
    globeGroup.add(bordersGroup)
    bordersGroupRef.current = bordersGroup

    const apiConflictsGroup = new THREE.Group()
    apiConflictsGroup.name = 'api-conflicts'
    globeGroup.add(apiConflictsGroup)
    apiConflictsGroupRef.current = apiConflictsGroup

    const liberationGroup = new THREE.Group()
    liberationGroup.name = 'liberation'
    globeGroup.add(liberationGroup)
    liberationGroupRef.current = liberationGroup

    const citiesGroup = new THREE.Group()
    citiesGroup.name = 'cities'
    globeGroup.add(citiesGroup)
    citiesGroupRef.current = citiesGroup

    const frontlinesGroup = new THREE.Group()
    frontlinesGroup.name = 'frontlines'
    globeGroup.add(frontlinesGroup)
    frontlinesGroupRef.current = frontlinesGroup

    // ===== LOAD BORDERS (shared material for performance) =====
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x88bbff, transparent: true, opacity: 0.35
    })

    fetch('/globe/countries-10m.json')
      .then(r => r.json())
      .then(data => {
        const arc2coords = (arc: number[][], transform: { scale: number[]; translate: number[] }) => {
          let x = 0, y = 0
          return arc.map((p: number[]) => {
            x += p[0]; y += p[1]
            return [
              x * transform.scale[0] + transform.translate[0],
              y * transform.scale[1] + transform.translate[1]
            ]
          })
        }

        const decodedArcs = data.arcs.map((a: number[][]) => arc2coords(a, data.transform))
        const geos = data.objects.countries.geometries

        const drawRing = (indices: number[]) => {
          const coords: number[][] = []
          indices.forEach((idx: number) => {
            const coordList = idx < 0 ? [...decodedArcs[~idx]].reverse() : decodedArcs[idx]
            coordList.forEach((c: number[]) => coords.push(c))
          })
          if (coords.length > 1) {
            const pts = coords.map((c: number[]) => toVec(c[0], c[1], 1.002))
            const g = new THREE.BufferGeometry().setFromPoints(pts)
            bordersGroup.add(new THREE.Line(g, borderMaterial))
          }
          return coords
        }

        geos.forEach((geo: any) => {
          const countryData: CountryPolygonData = {
            id: String(geo.id || ''),
            name: geo.properties?.name || 'Unknown',
            arcs: [],
            centroid: { lat: 0, lng: 0 }
          }
          let allCoords: number[][] = []
          const rings = geo.type === 'Polygon' ? geo.arcs : geo.type === 'MultiPolygon' ? geo.arcs.flat() : []
          for (const ring of rings) {
            const ringCoords = drawRing(ring)
            countryData.arcs.push(ringCoords)
            allCoords = allCoords.concat(ringCoords)
          }
          if (allCoords.length > 0) {
            let avgLat = 0, avgLng = 0
            allCoords.forEach((c: number[]) => { avgLng += c[0]; avgLat += c[1] })
            countryData.centroid.lat = avgLat / allCoords.length
            countryData.centroid.lng = avgLng / allCoords.length
          }
          countryPolygonsRef.current.push(countryData)
        })
      })
      .catch(e => console.error('Borders failed:', e))

    // ===== LIBERATION MARKERS (shared geometry) =====
    const libDotGeo = new THREE.SphereGeometry(0.018, 16, 16)
    const libRingGeo = new THREE.BufferGeometry()
    const libRingPts: THREE.Vector3[] = []
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2
      libRingPts.push(new THREE.Vector3(Math.cos(angle) * 0.05, Math.sin(angle) * 0.05, 0))
    }
    libRingGeo.setFromPoints(libRingPts)

    liberationStruggles.forEach(struggle => {
      const group = new THREE.Group()
      const dotMat = new THREE.MeshBasicMaterial({ color: struggle.color })
      const dot = new THREE.Mesh(libDotGeo, dotMat)
      group.add(dot)
      const ringMat = new THREE.LineBasicMaterial({ color: struggle.color, transparent: true, opacity: 0.3 })
      const ring = new THREE.Line(libRingGeo, ringMat)
      group.add(ring)
      const pos = toVec(struggle.lng, struggle.lat)
      group.position.copy(pos)
      group.lookAt(0, 0, 0)
      liberationGroup.add(group)
      liberationMeshesRef.current.push({ mesh: dot, ring, pulse: Math.random() * Math.PI * 2 })
    })

    // ===== CITY MARKERS (shared geometry + material) =====
    const cityDotGeo = new THREE.SphereGeometry(0.006, 8, 8)
    const cityDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    citiesData.forEach(city => {
      const dot = new THREE.Mesh(cityDotGeo, cityDotMat)
      dot.position.copy(toVec(city.lng, city.lat))
      citiesGroup.add(dot)
    })

    // ===== POINTER EVENTS =====
    const canvas = renderer.domElement
    canvas.style.touchAction = 'none'

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current = true
      pointerStartRef.current = { x: e.clientX, y: e.clientY }
      prevXRef.current = e.clientX
      prevYRef.current = e.clientY
      // Cancel fly-to on drag
      targetRotXRef.current = null
      targetRotYRef.current = null
    }

    const onPointerMove = (e: PointerEvent) => {
      if (dragRef.current) {
        rotYRef.current += (e.clientX - prevXRef.current) * 0.005
        rotXRef.current += (e.clientY - prevYRef.current) * 0.005
        rotXRef.current = Math.max(-1.5, Math.min(1.5, rotXRef.current))
        prevXRef.current = e.clientX
        prevYRef.current = e.clientY
        return
      }

      // Hover tooltip via raycasting on conflict markers
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycasterRef.current.setFromCamera(mouseRef.current, camera)

      const conflictsGroup = apiConflictsGroupRef.current
      if (conflictsGroup && conflictsGroup.children.length > 0) {
        const allMarkers: THREE.Object3D[] = []
        conflictsGroup.traverse(obj => {
          if (obj instanceof THREE.Mesh) allMarkers.push(obj)
        })
        const hits = raycasterRef.current.intersectObjects(allMarkers, false)
        if (hits.length > 0) {
          // Walk up to find the group with conflictName in userData
          let target = hits[0].object
          while (target.parent && !target.userData.conflictName) target = target.parent
          if (target.userData.conflictName) {
            setHoverTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text: target.userData.conflictName })
            canvas.style.cursor = 'pointer'
            return
          }
        }
      }
      setHoverTooltip(null)
      canvas.style.cursor = 'grab'
    }

    const onPointerUp = (e: PointerEvent) => {
      dragRef.current = false
      const dx = Math.abs(e.clientX - pointerStartRef.current.x)
      const dy = Math.abs(e.clientY - pointerStartRef.current.y)
      if (dx < 5 && dy < 5) handleGlobeClick(e)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      camera.position.z = Math.max(1.5, Math.min(5, camera.position.z + e.deltaY * 0.001))
    }

    function handleGlobeClick(event: PointerEvent) {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycasterRef.current.setFromCamera(mouseRef.current, camera)

      // Check conflict markers first — navigate to detail page
      const conflictsGroup = apiConflictsGroupRef.current
      if (conflictsGroup && conflictsGroup.children.length > 0) {
        const allMarkers: THREE.Object3D[] = []
        conflictsGroup.traverse(obj => { if ((obj as THREE.Mesh).isMesh) allMarkers.push(obj) })
        const markerHits = raycasterRef.current.intersectObjects(allMarkers, false)
        if (markerHits.length > 0) {
          let target = markerHits[0].object
          while (target.parent && !target.userData.conflictId) target = target.parent
          if (target.userData.conflictId) {
            navigate(`/conflict/${target.userData.conflictId}`)
            return
          }
        }
      }

      // Check globe surface for country detection
      const intersects = raycasterRef.current.intersectObject(globeMesh)
      if (intersects.length > 0) {
        const point = intersects[0].point.clone()
        const inverseMatrix = new THREE.Matrix4().copy(globeGroup.matrixWorld).invert()
        point.applyMatrix4(inverseMatrix)
        const ll = vec3ToLatLng(point)
        const testPoint = [ll.lng, ll.lat]
        for (const country of countryPolygonsRef.current) {
          for (const polygon of country.arcs) {
            if (pointInPolygon(testPoint, polygon)) {
              navigate(`/country/${country.id}`)
              return
            }
          }
        }
      }
    }

    // Resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (!container) return
        const newW = container.clientWidth
        const newH = container.clientHeight
        camera.aspect = newW / newH
        camera.updateProjectionMatrix()
        renderer.setSize(newW, newH)
      }, 100)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onResize)

    // ===== ANIMATION LOOP =====
    let playbackAccumulator = 0

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      // Fly-to interpolation
      if (targetRotXRef.current !== null && targetRotYRef.current !== null) {
        rotXRef.current = lerpAngle(rotXRef.current, targetRotXRef.current, 0.06)
        rotYRef.current = lerpAngle(rotYRef.current, targetRotYRef.current, 0.06)
        // Stop when close enough
        if (Math.abs(rotXRef.current - targetRotXRef.current) < 0.001 &&
            Math.abs(rotYRef.current - targetRotYRef.current) < 0.001) {
          targetRotXRef.current = null
          targetRotYRef.current = null
        }
      } else if (autoRotateRef.current && !dragRef.current) {
        rotYRef.current += 0.0005
      }

      // Zoom interpolation
      if (targetZoomRef.current !== null) {
        const dz = targetZoomRef.current - camera.position.z
        if (Math.abs(dz) < 0.005) {
          camera.position.z = targetZoomRef.current
          targetZoomRef.current = null
        } else {
          camera.position.z += dz * 0.06
        }
      }

      if (isPlayingRef.current) {
        playbackAccumulator += 0.016 * playbackSpeedRef.current
        if (playbackAccumulator >= 0.06) {
          playbackAccumulator = 0
          const nextYear = currentYearRef.current + 1
          const newYear = nextYear > 2026 ? 1900 : nextYear
          currentYearRef.current = newYear
          setCurrentYear(newYear)
        }
      }

      globeGroup.rotation.set(rotXRef.current, rotYRef.current, 0)

      // Pulse API conflict markers
      pulseConflictMarkers(apiConflictPulseRef.current)

      // Pulse liberation markers
      liberationMeshesRef.current.forEach(m => {
        m.pulse = (m.pulse + 0.02) % (Math.PI * 2)
        const scale = 1 + Math.sin(m.pulse) * 0.2
        m.mesh.scale.set(scale, scale, scale)
        if (m.ring.material instanceof THREE.LineBasicMaterial) {
          m.ring.material.opacity = 0.3 + Math.sin(m.pulse) * 0.2
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      window.removeEventListener('resize', onResize)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      renderer.dispose()
      globeGeo.dispose()
      globeMat.dispose()
      atmoGeo.dispose()
      atmoMat.dispose()
      starGeo.dispose()
      starMat.dispose()
      borderMaterial.dispose()
      libDotGeo.dispose()
      libRingGeo.dispose()
      cityDotGeo.dispose()
      cityDotMat.dispose()
      apiConflictDisposeRef.current?.()
      frontlineDisposeRef.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ==================== UPDATE API CONFLICT MARKERS ====================
  useEffect(() => {
    const parentGroup = apiConflictsGroupRef.current
    if (!parentGroup) return
    apiConflictDisposeRef.current?.()
    while (parentGroup.children.length > 0) parentGroup.remove(parentGroup.children[0])

    if (apiConflicts.length === 0) {
      apiConflictPulseRef.current = []
      return
    }
    const result = createConflictMarkers(apiConflicts)
    parentGroup.add(result.group)
    apiConflictPulseRef.current = result.pulseEntries
    apiConflictDisposeRef.current = result.dispose
  }, [apiConflicts])


  // ==================== UPDATE FRONTLINES ====================
  useEffect(() => {
    const parent = frontlinesGroupRef.current
    if (!parent) return
    frontlineDisposeRef.current?.()
    frontlineDisposeRef.current = null
    while (parent.children.length > 0) parent.remove(parent.children[0])
    if (!frontlines.geojson || frontlines.geojson.features.length === 0) return
    const result = renderFrontlines(frontlines.geojson)
    parent.add(result.group)
    frontlineDisposeRef.current = result.dispose
  }, [frontlines.geojson])

  // ==================== UPDATE VISIBILITY ====================
  useEffect(() => {
    if (bordersGroupRef.current) bordersGroupRef.current.visible = visibility.borders
    if (apiConflictsGroupRef.current) apiConflictsGroupRef.current.visible = visibility.conflicts
    if (liberationGroupRef.current) liberationGroupRef.current.visible = visibility.liberation
    if (citiesGroupRef.current) citiesGroupRef.current.visible = visibility.cities
    if (frontlinesGroupRef.current) frontlinesGroupRef.current.visible = visibility.frontlines
  }, [visibility])


  // ==================== STYLES ====================
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    background: 'rgba(10, 14, 26, 0.92)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(68, 153, 221, 0.25)',
    borderRadius: '10px',
    padding: '16px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    color: '#fff',
    zIndex: 100,
    pointerEvents: 'auto' as const
  }

  // Conflict type color helper for UI
  const typeColorHex = (type: string | null) => {
    const c = getConflictColor(type)
    return '#' + c.toString(16).padStart(6, '0')
  }

  // Decade labels for timeline
  const decades = [1900, 1920, 1940, 1960, 1980, 2000, 2026]

  // ==================== RENDER ====================
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: '#0a0e1a',
        overflow: 'hidden'
      }}
    >
      {/* Custom slider styles */}
      <style>{`
        .globe-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #4499dd;
          cursor: pointer;
          border: 2px solid #0a0e1a;
          box-shadow: 0 0 6px rgba(68,153,221,0.5);
          margin-top: -5px;
        }
        .globe-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: linear-gradient(90deg, rgba(68,153,221,0.3), rgba(68,153,221,0.6));
          border-radius: 2px;
        }
        .globe-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #4499dd;
          cursor: pointer;
          border: 2px solid #0a0e1a;
        }
        .globe-slider::-moz-range-track {
          height: 4px;
          background: linear-gradient(90deg, rgba(68,153,221,0.3), rgba(68,153,221,0.6));
          border-radius: 2px;
        }
        .globe-panel::-webkit-scrollbar { width: 4px; }
        .globe-panel::-webkit-scrollbar-track { background: transparent; }
        .globe-panel::-webkit-scrollbar-thumb { background: rgba(68,153,221,0.3); border-radius: 2px; }
        .globe-panel::-webkit-scrollbar-thumb:hover { background: rgba(68,153,221,0.5); }
      `}</style>

      {/* WebGL Context Lost Overlay */}
      {contextLost && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 999,
          background: 'rgba(10,14,26,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#ff6666', fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>WebGL Context Lost</div>
          <div style={{ fontSize: '13px', color: '#888' }}>The 3D renderer was interrupted. Please reload the page.</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px', padding: '8px 20px',
              background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)',
              color: '#ff6666', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoverTooltip && (
        <div style={{
          position: 'absolute',
          left: hoverTooltip.x + 12,
          top: hoverTooltip.y - 28,
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          pointerEvents: 'none',
          zIndex: 200,
          whiteSpace: 'nowrap',
          border: '1px solid rgba(255,68,68,0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}>
          {hoverTooltip.text}
        </div>
      )}

      {/* Title */}
      <div style={{
        ...panelStyle,
        top: '20px', left: '20px',
        pointerEvents: 'none',
        border: 'none', background: 'none', backdropFilter: 'none',
        padding: 0
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>LeftistMonitor</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <p style={{ fontSize: '12px', color: '#8899dd', margin: 0 }}>
            Interactive 3D Globe
            {conflictsLoading && <span style={{ color: '#ff8844', marginLeft: '8px' }}>Loading...</span>}
          </p>
          {!autoRotate && (
            <button
              onClick={resetView}
              style={{
                padding: '2px 8px', fontSize: '10px',
                background: 'rgba(68,153,221,0.1)', border: '1px solid rgba(68,153,221,0.3)',
                color: '#8899dd', borderRadius: '4px', cursor: 'pointer',
                pointerEvents: 'auto', transition: 'all 0.15s ease',
              }}
            >
              Reset View
            </button>
          )}
        </div>
      </div>

      {/* Controls Panel */}
      <div style={{ ...panelStyle, top: '20px', right: '20px', minWidth: '180px' }}>
        <h3 style={{ fontSize: '10px', textTransform: 'uppercase' as const, color: '#8899dd', marginBottom: '10px', fontWeight: 600, letterSpacing: '1px' }}>Layers</h3>
        {(['borders', 'conflicts', 'cities', 'liberation', 'frontlines'] as const).map(key => (
          <button
            key={key}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '6px 10px', marginBottom: '4px',
              background: visibility[key] ? 'rgba(68,153,221,0.2)' : 'transparent',
              border: '1px solid ' + (visibility[key] ? 'rgba(68,153,221,0.5)' : 'rgba(68,153,221,0.15)'),
              color: visibility[key] ? '#fff' : '#667',
              borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onClick={() => setVisibility(v => ({ ...v, [key]: !v[key] }))}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: visibility[key] ? '#4499dd' : '#333',
              transition: 'all 0.15s ease',
            }} />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(68,153,221,0.15)' }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '6px 10px',
              background: autoRotate ? 'rgba(68,153,221,0.2)' : 'transparent',
              border: '1px solid ' + (autoRotate ? 'rgba(68,153,221,0.5)' : 'rgba(68,153,221,0.15)'),
              color: autoRotate ? '#fff' : '#667',
              borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onClick={() => setAutoRotate(v => !v)}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: autoRotate ? '#4499dd' : '#333',
            }} />
            Auto-Rotate
          </button>
        </div>
      </div>

      {/* Liberation Panel */}
      <div className="globe-panel" style={{ ...panelStyle, top: '360px', right: '20px', maxWidth: '200px', maxHeight: '280px', overflowY: 'auto' as const, border: '1px solid rgba(102, 204, 102, 0.2)' }}>
        <h3 style={{ fontSize: '10px', textTransform: 'uppercase' as const, color: '#6c6', marginBottom: '8px', fontWeight: 600, letterSpacing: '1px' }}>Liberation Struggles</h3>
        {liberationStruggles.map(s => (
          <div
            key={s.id}
            onClick={() => flyTo(s.lat, s.lng, 2.0)}
            style={{
              display: 'flex', alignItems: 'center', padding: '6px 4px',
              borderBottom: '1px solid rgba(102,204,102,0.08)',
              cursor: 'pointer', fontSize: '11px', transition: 'all 0.15s ease',
              borderRadius: '4px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(102,204,102,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: `#${s.color.toString(16).padStart(6, '0')}`,
              marginRight: '8px', flexShrink: 0,
              boxShadow: `0 0 4px #${s.color.toString(16).padStart(6, '0')}66`,
            }} />
            {s.name}
          </div>
        ))}
      </div>

      {/* Conflicts Panel */}
      <div className="globe-panel" style={{ ...panelStyle, bottom: '160px', left: '20px', maxWidth: '280px', maxHeight: '380px', overflowY: 'auto' as const, border: '1px solid rgba(221, 68, 68, 0.2)' }}>
        <h3 style={{ fontSize: '10px', textTransform: 'uppercase' as const, color: '#f88', marginBottom: '8px', fontWeight: 600, letterSpacing: '1px' }}>
          Active Conflicts
          <span style={{ color: '#666', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>({apiConflicts.length})</span>
        </h3>
        {apiConflicts.length > 5 && (
          <input
            type="text"
            placeholder="Search conflicts..."
            value={conflictSearch}
            onChange={e => setConflictSearch(e.target.value)}
            style={{
              width: '100%', padding: '5px 8px', marginBottom: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(221,68,68,0.2)',
              borderRadius: '5px', color: '#ddd', fontSize: '11px',
              outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(221,68,68,0.5)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(221,68,68,0.2)'}
          />
        )}
        {apiConflicts.length === 0 && !conflictsLoading && (
          <div style={{ fontSize: '11px', color: '#555', padding: '8px 0' }}>No conflicts for {currentYear}</div>
        )}
        {apiConflicts.filter(c => !conflictSearch || c.name.toLowerCase().includes(conflictSearch.toLowerCase())).map(c => {
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/conflict/${c.id}`)}
              style={{
                display: 'flex', alignItems: 'flex-start', padding: '7px 6px',
                borderBottom: '1px solid rgba(221,68,68,0.08)',
                cursor: 'pointer', fontSize: '11px',
                background: 'transparent',
                borderRadius: '5px', transition: 'all 0.15s ease',
                borderLeft: '3px solid transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(221,68,68,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: typeColorHex(c.conflict_type),
                marginRight: '8px', flexShrink: 0, marginTop: '3px',
                boxShadow: c.hasFrontlines ? `0 0 0 2px ${typeColorHex(c.conflict_type)}44, 0 0 6px ${typeColorHex(c.conflict_type)}33` : 'none',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: '#eee', lineHeight: 1.3 }}>
                  {c.name}
                  {c.hasFrontlines && (
                    <span style={{ fontSize: '9px', color: '#ff8844', marginLeft: '4px', fontWeight: 600 }}>FL</span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#777', marginTop: '2px' }}>
                  {formatYearRange(c.startYear, c.endYear)} &middot; {c.conflict_type || 'Unknown'}
                </div>
              </div>
            </div>
          )
        })}

        {/* Conflict type legend */}
        {apiConflicts.length > 0 && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(221,68,68,0.15)' }}>
            <div style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase' as const, marginBottom: '6px', letterSpacing: '0.5px' }}>Types</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
              {Object.entries(CONFLICT_TYPE_COLORS).slice(0, 6).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', color: '#888' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#' + color.toString(16).padStart(6, '0') }} />
                  {type.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Time Slider — only visible when borders layer is on */}
      {visibility.borders && <div style={{ ...panelStyle, bottom: '20px', left: '50%', transform: 'translateX(-50%)', minWidth: '450px', maxWidth: '600px', textAlign: 'center' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            style={{
              width: '36px', height: '36px',
              background: isPlaying ? 'rgba(68,153,221,0.3)' : 'rgba(68,153,221,0.1)',
              border: '1px solid rgba(68,153,221,0.4)',
              color: isPlaying ? '#fff' : '#aaf', borderRadius: '50%', cursor: 'pointer',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s ease',
            }}
            onClick={() => setIsPlaying(v => !v)}
            title="Play/Pause (Space)"
          >
            {isPlaying ? '\u23F8' : '\u25B6'}
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="range"
              min="1900" max="2026"
              value={currentYear}
              onChange={e => setCurrentYear(parseInt(e.target.value))}
              className="globe-slider"
              style={{ width: '100%', cursor: 'pointer', appearance: 'none', background: 'transparent' }}
            />
            {/* Decade labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', padding: '0 2px' }}>
              {decades.map(d => (
                <span key={d} style={{ fontSize: '9px', color: '#556', userSelect: 'none' }}>{d}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#4499dd', lineHeight: 1 }}>
              {currentYear}
            </div>
            <div style={{ fontSize: '10px', color: '#667', marginTop: '2px' }}>
              {apiConflicts.length} active
            </div>
          </div>
        </div>

        {/* Speed control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
          <span style={{ fontSize: '9px', color: '#556', marginRight: '4px' }}>Speed:</span>
          {SPEED_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setSpeedIdx(i)}
              style={{
                padding: '2px 8px',
                background: speedIdx === i ? 'rgba(68,153,221,0.3)' : 'transparent',
                border: '1px solid ' + (speedIdx === i ? 'rgba(68,153,221,0.5)' : 'rgba(68,153,221,0.15)'),
                color: speedIdx === i ? '#fff' : '#556',
                borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
          <span style={{ fontSize: '9px', color: '#445', marginLeft: '8px' }}>
            {'\u2190\u2192'} keys &middot; Space
          </span>
        </div>

      </div>}

      {/* Usage hint */}
      {visibility.borders && <div style={{
        position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 99, fontSize: '10px', color: '#445', textAlign: 'center' as const,
        pointerEvents: 'none'
      }}>
        Drag to rotate &middot; Scroll to zoom &middot; Click country to explore
      </div>}



    </div>
  )
}

export default Globe3D

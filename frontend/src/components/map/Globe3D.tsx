import * as THREE from 'three'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ConflictData,
  LiberationStruggle,
  conflictData,
  liberationStruggles,
  citiesData,
  getCountryCoords
} from './globe-data'

// ==================== HELPER FUNCTIONS ====================
// These MUST match the working standalone globe-test.html exactly

function toVec(lng: number, lat: number, r: number = 1.01): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lng + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

function latLngToVec(lat: number, lng: number, r: number = 1.01): THREE.Vector3 {
  return toVec(lng, lat, r)
}

function vec3ToLatLng(vec: THREE.Vector3): { lat: number; lng: number } {
  const v = vec.clone().normalize()
  const lat = Math.asin(v.y) * 180 / Math.PI
  const lng = Math.atan2(v.z, -v.x) * 180 / Math.PI
  return { lat, lng }
}

function createGreatCircleArc(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  numPoints: number = 50
): THREE.Vector3[] {
  const v1 = latLngToVec(lat1, lng1, 1)
  const v2 = latLngToVec(lat2, lng2, 1)
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const p1 = v1.clone().multiplyScalar(Math.cos(t * Math.PI / 2))
    const p2 = v2.clone().multiplyScalar(Math.sin(t * Math.PI / 2))
    const p = p1.add(p2).normalize()

    // Arc height above surface
    const dist = v1.distanceTo(v2)
    const maxHeight = Math.min(0.15, dist * 0.05)
    const height = maxHeight * Math.sin(t * Math.PI)
    p.multiplyScalar(1 + height)

    points.push(p)
  }
  return points
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

// ==================== INTERFACES ====================

interface CountryPolygonData {
  id: string
  name: string
  arcs: number[][][]
  centroid: { lat: number; lng: number }
}

interface SelectedCountry {
  id: string
  name: string
}

// ==================== COMPONENT ====================

const Globe3D = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Refs for Three.js objects (persist across renders, no re-render on change)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeGroupRef = useRef<THREE.Group | null>(null)
  const globeMeshRef = useRef<THREE.Mesh | null>(null)
  const frameIdRef = useRef<number>(0)

  // Groups
  const bordersGroupRef = useRef<THREE.Group | null>(null)
  const conflictsGroupRef = useRef<THREE.Group | null>(null)
  const arcsGroupRef = useRef<THREE.Group | null>(null)
  const liberationGroupRef = useRef<THREE.Group | null>(null)
  const citiesGroupRef = useRef<THREE.Group | null>(null)

  // Country polygon data for click detection
  const countryPolygonsRef = useRef<CountryPolygonData[]>([])

  // Conflict marker meshes (for pulsing animation)
  const conflictMeshesRef = useRef<{ mesh: THREE.Mesh; ring: THREE.Line; pulse: number }[]>([])
  const liberationMeshesRef = useRef<{ mesh: THREE.Mesh; ring: THREE.Line; pulse: number }[]>([])

  // Animation state (refs to avoid re-renders during drag)
  const dragRef = useRef(false)
  const prevXRef = useRef(0)
  const prevYRef = useRef(0)
  const rotXRef = useRef(0.3)
  const rotYRef = useRef(0)
  const autoRotateRef = useRef(true)
  const isPlayingRef = useRef(false)
  const currentYearRef = useRef(2026)

  // Raycasting
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // React state (only for UI that needs re-rendering)
  const [currentYear, setCurrentYear] = useState(2026)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [visibility, setVisibility] = useState({
    borders: true,
    conflicts: true,
    cities: true,
    liberation: true
  })
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null)
  const [selectedStruggle, setSelectedStruggle] = useState<LiberationStruggle | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null)

  // Sync state to refs (so animation loop reads latest values without re-creating)
  useEffect(() => { autoRotateRef.current = autoRotate }, [autoRotate])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { currentYearRef.current = currentYear }, [currentYear])

  // Memoized active conflicts to avoid new array reference every render
  const activeConflicts = useMemo(
    () => conflictData.filter(c => c.startYear <= currentYear && c.endYear >= currentYear),
    [currentYear]
  )

  // ==================== MAIN THREE.JS SETUP (runs once) ====================
  useEffect(() => {
    const container = containerRef.current
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
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const dl1 = new THREE.DirectionalLight(0xffffff, 1.0)
    dl1.position.set(5, 3, 5)
    scene.add(dl1)
    const dl2 = new THREE.DirectionalLight(0x4488cc, 0.4)
    dl2.position.set(-5, -3, -5)
    scene.add(dl2)

    // Globe group (everything that rotates together)
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)
    globeGroupRef.current = globeGroup

    // Globe sphere
    const globeGeo = new THREE.SphereGeometry(1, 128, 128)
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 25,
      specular: 0x333333
    })
    const globeMesh = new THREE.Mesh(globeGeo, globeMat)
    globeGroup.add(globeMesh)
    globeMeshRef.current = globeMesh

    // Load textures
    const loader = new THREE.TextureLoader()
    loader.load('/globe/earth-blue-marble.jpg', (tex) => {
      globeMat.map = tex
      globeMat.needsUpdate = true
    })
    loader.load('/globe/earth-topology.png', (tex) => {
      globeMat.bumpMap = tex
      globeMat.bumpScale = 0.015
      globeMat.needsUpdate = true
    })
    loader.load('/globe/earth-water.png', (tex) => {
      globeMat.specularMap = tex
      globeMat.needsUpdate = true
    })

    // Atmosphere
    const atmoGeo = new THREE.SphereGeometry(1.02, 64, 64)
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x3388ff, transparent: true, opacity: 0.08, side: THREE.BackSide
    })
    globeGroup.add(new THREE.Mesh(atmoGeo, atmoMat))

    // Stars
    const starGeo = new THREE.BufferGeometry()
    const starCount = 1000
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100
      positions[i + 1] = (Math.random() - 0.5) * 100
      positions[i + 2] = (Math.random() - 0.5) * 100
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })))

    // Create groups
    const bordersGroup = new THREE.Group()
    bordersGroup.name = 'borders'
    globeGroup.add(bordersGroup)
    bordersGroupRef.current = bordersGroup

    const conflictsGroup = new THREE.Group()
    conflictsGroup.name = 'conflicts'
    globeGroup.add(conflictsGroup)
    conflictsGroupRef.current = conflictsGroup

    const arcsGroup = new THREE.Group()
    arcsGroup.name = 'arcs'
    globeGroup.add(arcsGroup)
    arcsGroupRef.current = arcsGroup

    const liberationGroup = new THREE.Group()
    liberationGroup.name = 'liberation'
    globeGroup.add(liberationGroup)
    liberationGroupRef.current = liberationGroup

    const citiesGroup = new THREE.Group()
    citiesGroup.name = 'cities'
    globeGroup.add(citiesGroup)
    citiesGroupRef.current = citiesGroup

    // ==================== LOAD BORDERS (TopoJSON) ====================
    fetch('/globe/countries-50m.json')
      .then(r => r.json())
      .then(data => {
        // First decode ALL arcs
        const arc2coords = (arc: number[][], transform: { scale: number[]; translate: number[] }) => {
          let x = 0, y = 0
          return arc.map((p: number[]) => {
            x += p[0]
            y += p[1]
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
            let coordList: number[][]
            if (idx < 0) {
              coordList = [...decodedArcs[~idx]].reverse()
            } else {
              coordList = decodedArcs[idx]
            }
            coordList.forEach((c: number[]) => coords.push(c))
          })

          // Draw border line
          if (coords.length > 1) {
            const pts = coords.map((c: number[]) => toVec(c[0], c[1], 1.002))
            const g = new THREE.BufferGeometry().setFromPoints(pts)
            const m = new THREE.LineBasicMaterial({
              color: 0x88bbff, transparent: true, opacity: 0.35
            })
            bordersGroup.add(new THREE.Line(g, m))
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

          if (geo.type === 'Polygon') {
            geo.arcs.forEach((ring: number[]) => {
              const ringCoords = drawRing(ring)
              countryData.arcs.push(ringCoords)
              allCoords = allCoords.concat(ringCoords)
            })
          } else if (geo.type === 'MultiPolygon') {
            geo.arcs.forEach((polygon: number[][]) => {
              polygon.forEach((ring: number[]) => {
                const ringCoords = drawRing(ring)
                countryData.arcs.push(ringCoords)
                allCoords = allCoords.concat(ringCoords)
              })
            })
          }

          // Calculate centroid
          if (allCoords.length > 0) {
            let avgLat = 0, avgLng = 0
            allCoords.forEach((c: number[]) => {
              avgLng += c[0]
              avgLat += c[1]
            })
            countryData.centroid.lat = avgLat / allCoords.length
            countryData.centroid.lng = avgLng / allCoords.length
          }

          countryPolygonsRef.current.push(countryData)
        })
      })
      .catch(e => console.error('Borders failed:', e))

    // ==================== CREATE CONFLICT MARKERS ====================
    conflictData.forEach(conflict => {
      const group = new THREE.Group()

      // Pulsing dot
      const dotGeo = new THREE.SphereGeometry(0.015, 16, 16)
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xff4444 })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      group.add(dot)

      // Ring
      const ringGeo = new THREE.BufferGeometry()
      const ringPts: THREE.Vector3[] = []
      for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * Math.PI * 2
        ringPts.push(new THREE.Vector3(Math.cos(angle) * 0.035, Math.sin(angle) * 0.035, 0))
      }
      ringGeo.setFromPoints(ringPts)
      const ringMat = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5 })
      const ring = new THREE.Line(ringGeo, ringMat)
      group.add(ring)

      const pos = toVec(conflict.lng, conflict.lat)
      group.position.copy(pos)
      group.lookAt(0, 0, 0) // Face center so ring is tangent to surface

      // Store conflict id for filtering
      group.userData = { conflictId: conflict.id, startYear: conflict.startYear, endYear: conflict.endYear }

      conflictsGroup.add(group)
      conflictMeshesRef.current.push({ mesh: dot, ring, pulse: Math.random() * Math.PI * 2 })
    })

    // ==================== CREATE LIBERATION MARKERS ====================
    liberationStruggles.forEach(struggle => {
      const group = new THREE.Group()

      const dotGeo = new THREE.SphereGeometry(0.018, 16, 16)
      const dotMat = new THREE.MeshBasicMaterial({ color: struggle.color })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      group.add(dot)

      const ringGeo = new THREE.BufferGeometry()
      const ringPts: THREE.Vector3[] = []
      for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * Math.PI * 2
        ringPts.push(new THREE.Vector3(Math.cos(angle) * 0.05, Math.sin(angle) * 0.05, 0))
      }
      ringGeo.setFromPoints(ringPts)
      const ringMat = new THREE.LineBasicMaterial({ color: struggle.color, transparent: true, opacity: 0.3 })
      const ring = new THREE.Line(ringGeo, ringMat)
      group.add(ring)

      const pos = toVec(struggle.lng, struggle.lat)
      group.position.copy(pos)
      group.lookAt(0, 0, 0)

      liberationGroup.add(group)
      liberationMeshesRef.current.push({ mesh: dot, ring, pulse: Math.random() * Math.PI * 2 })
    })

    // ==================== CREATE CITY MARKERS ====================
    citiesData.forEach(city => {
      const dotGeo = new THREE.SphereGeometry(0.008, 8, 8)
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const dot = new THREE.Mesh(dotGeo, dotMat)
      dot.position.copy(toVec(city.lng, city.lat))
      citiesGroup.add(dot)
    })

    // ==================== POINTER EVENTS ====================
    const canvas = renderer.domElement
    canvas.style.touchAction = 'none'

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current = true
      prevXRef.current = e.clientX
      prevYRef.current = e.clientY
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return
      rotYRef.current += (e.clientX - prevXRef.current) * 0.005
      rotXRef.current += (e.clientY - prevYRef.current) * 0.005
      rotXRef.current = Math.max(-1.5, Math.min(1.5, rotXRef.current))
      prevXRef.current = e.clientX
      prevYRef.current = e.clientY
    }

    const onPointerUp = (e: PointerEvent) => {
      // Detect click (small movement threshold)
      const wasDrag = Math.abs(e.clientX - prevXRef.current) > 5 || Math.abs(e.clientY - prevYRef.current) > 5
      dragRef.current = false

      if (!wasDrag) {
        handleGlobeClick(e)
      }
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
      const intersects = raycasterRef.current.intersectObject(globeMesh)

      if (intersects.length > 0) {
        // Transform intersection point back to un-rotated space
        const point = intersects[0].point.clone()
        // Apply inverse of globeGroup rotation
        const inverseMatrix = new THREE.Matrix4().copy(globeGroup.matrixWorld).invert()
        point.applyMatrix4(inverseMatrix)

        const ll = vec3ToLatLng(point)

        // Find which country
        const testPoint = [ll.lng, ll.lat]
        for (const country of countryPolygonsRef.current) {
          for (const polygon of country.arcs) {
            if (pointInPolygon(testPoint, polygon)) {
              setSelectedCountry({ id: country.id, name: country.name })
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

    // ==================== ANIMATION LOOP ====================
    let playbackAccumulator = 0

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      // Auto-rotation
      if (autoRotateRef.current && !dragRef.current) {
        rotYRef.current += 0.0005
      }

      // Timeline playback
      if (isPlayingRef.current) {
        playbackAccumulator += 0.5
        if (playbackAccumulator >= 1) {
          playbackAccumulator = 0
          const nextYear = currentYearRef.current + 1
          const newYear = nextYear > 2026 ? 1900 : nextYear
          currentYearRef.current = newYear
          setCurrentYear(newYear)
        }
      }

      // Apply rotation
      globeGroup.rotation.set(rotXRef.current, rotYRef.current, 0)

      // Update conflict marker visibility based on current year
      const year = currentYearRef.current
      conflictsGroup.children.forEach((child) => {
        const ud = child.userData
        if (ud.startYear !== undefined) {
          child.visible = ud.startYear <= year && year <= ud.endYear
        }
      })

      // Pulse conflict markers
      conflictMeshesRef.current.forEach(m => {
        m.pulse = (m.pulse + 0.03) % (Math.PI * 2)
        const scale = 1 + Math.sin(m.pulse) * 0.3
        m.mesh.scale.set(scale, scale, scale)
        if (m.ring.material instanceof THREE.LineBasicMaterial) {
          m.ring.material.opacity = 0.5 + Math.sin(m.pulse) * 0.3
        }
      })

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
      window.removeEventListener('resize', onResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      globeGeo.dispose()
      globeMat.dispose()
      atmoGeo.dispose()
      atmoMat.dispose()
      starGeo.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps — runs once on mount

  // ==================== UPDATE CONFLICT ARCS WHEN YEAR CHANGES ====================
  useEffect(() => {
    const arcsGroup = arcsGroupRef.current
    if (!arcsGroup) return

    // Clear old arcs
    while (arcsGroup.children.length > 0) {
      const child = arcsGroup.children[0] as THREE.Line
      if (child.geometry) child.geometry.dispose()
      if (child.material && child.material instanceof THREE.Material) child.material.dispose()
      arcsGroup.remove(child)
    }

    // Draw new arcs for active conflicts
    activeConflicts.forEach(conflict => {
      conflict.sides.forEach(side => {
        side.countries.forEach(countryName => {
          const coords = getCountryCoords(countryName)
          if (!coords) return
          // Don't draw arc to self
          if (Math.abs(coords.lat - conflict.lat) < 2 && Math.abs(coords.lng - conflict.lng) < 2) return

          const arcPoints = createGreatCircleArc(conflict.lat, conflict.lng, coords.lat, coords.lng, 40)
          if (arcPoints.length > 1) {
            const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints)
            const arcMat = new THREE.LineBasicMaterial({
              color: side.color,
              transparent: true,
              opacity: 0.4
            })
            arcsGroup.add(new THREE.Line(arcGeo, arcMat))
          }
        })
      })
    })
  }, [activeConflicts])

  // ==================== UPDATE VISIBILITY ====================
  useEffect(() => {
    if (bordersGroupRef.current) bordersGroupRef.current.visible = visibility.borders
    if (conflictsGroupRef.current) conflictsGroupRef.current.visible = visibility.conflicts
    if (arcsGroupRef.current) arcsGroupRef.current.visible = visibility.conflicts
    if (liberationGroupRef.current) liberationGroupRef.current.visible = visibility.liberation
    if (citiesGroupRef.current) citiesGroupRef.current.visible = visibility.cities
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

  const btnStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(68, 153, 221, 0.1)',
    border: '1px solid rgba(68, 153, 221, 0.4)',
    color: '#aaf',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '8px'
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'rgba(68, 153, 221, 0.3)',
    borderColor: '#4499dd',
    color: '#fff'
  }

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
      {/* Title */}
      <div style={{
        ...panelStyle,
        top: '20px', left: '20px',
        pointerEvents: 'none',
        border: 'none', background: 'none', backdropFilter: 'none',
        padding: 0
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>LeftistMonitor</h1>
        <p style={{ fontSize: '12px', color: '#8899dd', margin: '4px 0 0 0' }}>Interactive 3D Globe</p>
      </div>

      {/* Controls Panel */}
      <div style={{ ...panelStyle, top: '20px', right: '20px', minWidth: '200px' }}>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase' as const, color: '#8899dd', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>Display</h3>
        {(['borders', 'conflicts', 'cities', 'liberation'] as const).map(key => (
          <button
            key={key}
            style={visibility[key] ? activeBtnStyle : btnStyle}
            onClick={() => setVisibility(v => ({ ...v, [key]: !v[key] }))}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(68,153,221,0.2)' }}>
          <button
            style={autoRotate ? activeBtnStyle : btnStyle}
            onClick={() => setAutoRotate(v => !v)}
          >
            Auto-Rotate
          </button>
        </div>
      </div>

      {/* Liberation Panel */}
      <div style={{ ...panelStyle, top: '320px', right: '20px', maxWidth: '220px', maxHeight: '300px', overflowY: 'auto' as const, border: '1px solid rgba(102, 204, 102, 0.25)' }}>
        <h3 style={{ fontSize: '11px', textTransform: 'uppercase' as const, color: '#6c6', marginBottom: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>Liberation Struggles</h3>
        {liberationStruggles.map(s => (
          <div
            key={s.id}
            onClick={() => { setSelectedStruggle(s); setSelectedConflict(null) }}
            style={{
              display: 'flex', alignItems: 'center', padding: '8px 0',
              borderBottom: '1px solid rgba(102,204,102,0.1)',
              cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: `#${s.color.toString(16).padStart(6, '0')}`,
              marginRight: '8px', flexShrink: 0
            }} />
            {s.name}
          </div>
        ))}
      </div>

      {/* Conflicts Panel */}
      <div style={{ ...panelStyle, bottom: '180px', left: '20px', maxWidth: '240px', maxHeight: '350px', overflowY: 'auto' as const, border: '1px solid rgba(221, 68, 68, 0.25)' }}>
        <h3 style={{ fontSize: '11px', textTransform: 'uppercase' as const, color: '#f88', marginBottom: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>Active Conflicts</h3>
        {activeConflicts.map(c => (
          <div
            key={c.id}
            onClick={() => { setSelectedConflict(c); setSelectedStruggle(null) }}
            style={{
              display: 'flex', alignItems: 'flex-start', padding: '8px 0',
              borderBottom: '1px solid rgba(221,68,68,0.1)',
              cursor: 'pointer', fontSize: '12px',
              background: selectedConflict?.id === c.id ? 'rgba(221,68,68,0.15)' : 'transparent',
              borderRadius: selectedConflict?.id === c.id ? '4px' : '0',
              paddingLeft: selectedConflict?.id === c.id ? '6px' : '0'
            }}
          >
            <div style={{ display: 'flex', gap: '4px', marginRight: '8px', flexShrink: 0, marginTop: '2px' }}>
              {c.sides.map((s, i) => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: `#${s.color.toString(16).padStart(6, '0')}`
                }} />
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#fff' }}>{c.name}</div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{c.startYear}-{c.endYear}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Time Slider */}
      <div style={{ ...panelStyle, bottom: '20px', left: '50%', transform: 'translateX(-50%)', minWidth: '400px', textAlign: 'center' as const }}>
        <h3 style={{ fontSize: '11px', textTransform: 'uppercase' as const, color: '#8899dd', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>Timeline</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            style={{
              width: '32px', height: '32px',
              background: 'rgba(68,153,221,0.1)',
              border: '1px solid rgba(68,153,221,0.4)',
              color: '#aaf', borderRadius: '4px', cursor: 'pointer',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}
            onClick={() => setIsPlaying(v => !v)}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <input
            type="range"
            min="1900" max="2026"
            value={currentYear}
            onChange={e => setCurrentYear(parseInt(e.target.value))}
            style={{ flex: 1, height: '4px', cursor: 'pointer' }}
          />
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#4499dd', minWidth: '60px', textAlign: 'right' as const }}>
            {currentYear}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          {activeConflicts.length} conflicts active
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '65px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 99, fontSize: '11px', color: '#888', textAlign: 'center' as const,
        pointerEvents: 'none'
      }}>
        Drag to rotate &bull; Scroll to zoom &bull; Click for details
      </div>

      {/* Detail Panel */}
      {(selectedConflict || selectedStruggle) && (
        <div style={{
          ...panelStyle,
          right: '20px', top: '50%', transform: 'translateY(-50%)',
          maxWidth: '300px', maxHeight: '80vh', overflowY: 'auto' as const,
          zIndex: 101
        }}>
          <button
            onClick={() => { setSelectedConflict(null); setSelectedStruggle(null) }}
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', color: '#888',
              fontSize: '20px', cursor: 'pointer', width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            &times;
          </button>
          {selectedConflict && (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px', paddingRight: '24px' }}>
                {selectedConflict.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', fontSize: '12px', color: '#aaf', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(68,153,221,0.2)' }}>
                <div><strong>Type:</strong> {selectedConflict.type}</div>
                <div><strong>Period:</strong> {selectedConflict.startYear}-{selectedConflict.endYear}</div>
                <div><strong>Est. Casualties:</strong> {selectedConflict.casualties.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase' as const, color: '#8899dd', marginBottom: '8px', fontWeight: 600 }}>Sides</div>
              {selectedConflict.sides.map((side, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: `#${side.color.toString(16).padStart(6, '0')}`,
                    marginRight: '8px', flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontWeight: 500, color: '#fff' }}>{side.name}</div>
                    <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{side.countries.join(', ')}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#aaf', marginTop: '12px' }}>
                {selectedConflict.description}
              </div>
            </div>
          )}
          {selectedStruggle && (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px', paddingRight: '24px' }}>
                {selectedStruggle.name}
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#aaf' }}>
                {selectedStruggle.description}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Country Panel */}
      {selectedCountry && (
        <div style={{
          ...panelStyle,
          right: '20px', bottom: '120px',
          maxWidth: '280px', zIndex: 101,
          border: '1px solid rgba(136, 187, 255, 0.25)'
        }}>
          <button
            onClick={() => setSelectedCountry(null)}
            style={{
              float: 'right' as const, background: 'none', border: 'none',
              color: '#888', fontSize: '18px', cursor: 'pointer', padding: 0
            }}
          >
            &times;
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', color: '#fff' }}>
            {selectedCountry.name}
          </h2>
          <button
            onClick={() => navigate(`/country/${selectedCountry.id}`)}
            style={{
              display: 'block', width: '100%', padding: '10px', marginTop: '12px',
              background: 'rgba(68,153,221,0.2)',
              border: '1px solid rgba(68,153,221,0.4)',
              color: '#aaf', borderRadius: '4px', fontSize: '12px',
              cursor: 'pointer', textAlign: 'center' as const, textDecoration: 'none'
            }}
          >
            View Country Details →
          </button>
        </div>
      )}
    </div>
  )
}

export default Globe3D

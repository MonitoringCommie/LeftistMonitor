import { lazy, Suspense } from 'react'
import { useMapUrlSync } from '../hooks/useMapUrlSync'

// Lazy load the heavy map component
const WorldMap = lazy(() => import('../components/map/WorldMap'))

function MapLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#FFF5F6' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C41E3A', borderTopColor: 'transparent' }} />
        <p style={{ color: '#5C3D2E', fontFamily: 'Georgia, serif' }}>Loading map...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  // Sync map state with URL for shareable links
  useMapUrlSync()

  return (
    <div className="relative w-full h-full">
      {/* Map takes full space */}
      <Suspense fallback={<MapLoader />}>
        <WorldMap />
      </Suspense>

      {/* Title overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="rounded-lg shadow-lg px-6 py-3" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <h1 className="text-2xl font-bold" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>Leftist Monitor</h1>
          <p className="text-sm text-center" style={{ color: '#5C3D2E', fontFamily: 'Georgia, serif' }}>Click a country to explore</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="rounded-lg shadow-lg p-3" style={{ background: '#FFFFFF', border: '1px solid #E8C8C8', borderLeft: '4px solid #C41E3A', borderRadius: '10px' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#2C1810', fontFamily: 'Georgia, serif' }}>World Map</h3>
          <p className="text-xs" style={{ color: '#8B7355', fontFamily: 'Georgia, serif' }}>
            Explore political history, elections,<br/>
            parties, events, and more.
          </p>
        </div>
      </div>
    </div>
  )
}

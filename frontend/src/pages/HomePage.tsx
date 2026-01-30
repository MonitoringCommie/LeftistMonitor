import { lazy, Suspense } from 'react'

// Lazy load the heavy map component
const WorldMap = lazy(() => import('../components/map/WorldMap'))

function MapLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="relative w-full h-full">
      {/* Map takes full space */}
      <Suspense fallback={<MapLoader />}>
        <WorldMap />
      </Suspense>

      {/* Title overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3">
          <h1 className="text-2xl font-bold text-gray-800">Leftist Monitor</h1>
          <p className="text-sm text-gray-600 text-center">Click a country to explore</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">World Map</h3>
          <p className="text-xs text-gray-500">
            Explore political history, elections,<br/>
            parties, events, and more.
          </p>
        </div>
      </div>
    </div>
  )
}

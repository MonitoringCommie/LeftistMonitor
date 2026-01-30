import { lazy, Suspense } from 'react'

const FrontlinesViewer = lazy(() => import('../components/map/FrontlinesViewer'))

function MapLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading frontlines viewer...</p>
      </div>
    </div>
  )
}

export default function FrontlinesPage() {
  return (
    <Suspense fallback={<MapLoader />}>
      <FrontlinesViewer />
    </Suspense>
  )
}

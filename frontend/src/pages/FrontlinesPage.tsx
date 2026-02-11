import { lazy, Suspense } from 'react'

const FrontlinesViewer = lazy(() => import('../components/map/FrontlinesViewer'))

function MapLoader() {
  return (
    <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#FFF5F6' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E8C8C8', borderTopColor: 'transparent' }} />
        <p style={{ color: '#5C3D2E' }}>Loading frontlines viewer...</p>
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

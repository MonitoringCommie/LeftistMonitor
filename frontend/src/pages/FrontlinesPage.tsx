import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF5F6' }}>
      <header style={{ borderBottom: '1px solid #E8C8C8' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#8B7355' }}>
            <Link to="/" className="hover:opacity-80" style={{ color: '#C41E3A' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#2C1810' }}>Frontlines</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: '#8B1A1A' }}>
            Historical War Frontlines
          </h1>
          <p className="max-w-3xl" style={{ color: '#5C3D2E' }}>
            Interactive maps showing the movement of frontlines across major historical conflicts, from World War II to modern warfare.
          </p>
        </div>
      </header>
      <div className="flex-1" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <Suspense fallback={<MapLoader />}>
          <FrontlinesViewer />
        </Suspense>
      </div>
    </div>
  )
}

import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import TimeSlider from '../map/TimeSlider'

export default function Layout() {
  const location = useLocation()

  // Show TimeSlider only on country detail pages - globe has its own time slider
  const showTimeSlider = location.pathname.startsWith("/country/")

  // Different layout for map-based pages vs content pages
  const isMapPage = location.pathname === '/map'

  return (
    <div className="flex flex-col h-screen" style={{ background: '#FFF5F6' }}>
      <Header />

      {/* Main content area */}
      <main className={`flex-1 ${isMapPage ? 'overflow-hidden relative min-h-0' : 'overflow-auto'}`}>
        <Outlet />
      </main>

      {/* Time Slider - fixed at bottom, only on map-related pages */}
      {showTimeSlider && (
        <div
          style={{
            background: 'linear-gradient(135deg, #8B1A1A 0%, #C41E3A 50%, #8B1A1A 100%)',
            borderTop: '3px solid #D4A017',
          }}
          className="px-4 py-2"
        >
          <div className="max-w-4xl mx-auto">
            <TimeSlider />
          </div>
        </div>
      )}
    </div>
  )
}

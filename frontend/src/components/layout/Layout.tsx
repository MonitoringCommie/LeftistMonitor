import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import TimeSlider from '../map/TimeSlider'

export default function Layout() {
  const location = useLocation()

  // Show TimeSlider only on map page and country detail pages (where borders/conflicts matter)
  const showTimeSlider = location.pathname === "/map" || location.pathname.startsWith("/country/")

  // Different layout for map-based pages vs content pages
  const isMapPage = location.pathname === '/map'

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* Main content area */}
      <main className={`flex-1 ${isMapPage ? 'overflow-hidden' : 'overflow-auto'}`}>
        <Outlet />
      </main>

      {/* Time Slider - fixed at bottom, only on map-related pages */}
      {showTimeSlider && (
        <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 transition-colors">
          <div className="max-w-4xl mx-auto">
            <TimeSlider />
          </div>
        </div>
      )}
    </div>
  )
}

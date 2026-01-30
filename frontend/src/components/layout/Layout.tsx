import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import TimeSlider from '../map/TimeSlider'

export default function Layout() {
  const location = useLocation()

  // Show TimeSlider on all pages except frontlines and about
  const showTimeSlider = location.pathname === "/" || location.pathname.startsWith("/country/")

  // Different layout for map-based pages vs content pages
  const isMapPage = location.pathname === '/'

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* Main content area */}
      <main className={`flex-1 ${isMapPage ? 'overflow-hidden' : 'overflow-auto'}`}>
        <Outlet />
      </main>

      {/* Time Slider - fixed at bottom */}
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

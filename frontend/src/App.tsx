import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import { usePrefetchBorders } from './api/geography'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const HubPage = lazy(() => import('./pages/HubPage'))
const PeoplePage = lazy(() => import('./pages/PeoplePage'))
const CountryPage = lazy(() => import('./pages/CountryPage'))
const FrontlinesPage = lazy(() => import('./pages/FrontlinesPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'))
const BooksPage = lazy(() => import('./pages/BooksPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const GlobalStatsPage = lazy(() => import('./pages/GlobalStatsPage'))

// Detail pages
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'))
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'))
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

function AppContent() {
  // Prefetch borders data on app load for smoother map experience
  usePrefetchBorders()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HubPage />} />
          <Route path="map" element={<HomePage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="person/:id" element={<PersonDetailPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="book/:id" element={<BookDetailPage />} />
          <Route path="event/:id" element={<EventDetailPage />} />
          <Route path="country/:id" element={<CountryPage />} />
          <Route path="frontlines" element={<FrontlinesPage />} />
          <Route path="compare" element={<ComparisonPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="stats" element={<GlobalStatsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

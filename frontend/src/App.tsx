import { BrowserRouter, Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"
import Layout from "./components/layout/Layout"
import { usePrefetchBorders } from "./api/geography"
import ErrorBoundary from "./components/ErrorBoundary"

// Lazy load pages for code splitting
// GlobePage removed — single map at /map
const MapPage = lazy(() => import("./pages/MapPage"))
const HubPage = lazy(() => import("./pages/HubPage"))
const PeoplePage = lazy(() => import("./pages/PeoplePage"))
const CountryPage = lazy(() => import("./pages/CountryPage"))
const FrontlinesPage = lazy(() => import("./pages/FrontlinesPage"))
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"))
const AboutPage = lazy(() => import("./pages/AboutPage"))
const GlossaryPage = lazy(() => import("./pages/GlossaryPage"))
const BooksPage = lazy(() => import("./pages/BooksPage"))
const AdminPage = lazy(() => import("./pages/AdminPage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const GlobalStatsPage = lazy(() => import("./pages/GlobalStatsPage"))

// Detail pages
const PersonDetailPage = lazy(() => import("./pages/PersonDetailPage"))
const BookDetailPage = lazy(() => import("./pages/BookDetailPage"))
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"))

// Movement pages
const FeministMovementsPage = lazy(() => import("./pages/FeministMovementsPage"))
const CivilRightsPage = lazy(() => import("./pages/CivilRightsPage"))
const LaborMovementsPage = lazy(() => import("./pages/LaborMovementsPage"))
const LGBTQMovementsPage = lazy(() => import("./pages/LGBTQMovementsPage"))
const EnvironmentalMovementsPage = lazy(() => import("./pages/EnvironmentalMovementsPage"))
const IndigenousMovementsPage = lazy(() => import("./pages/IndigenousMovementsPage"))

// Liberation struggle pages
const UyghurRegionPage = lazy(() => import("./pages/UyghurRegionPage"))

// Visualization pages
const NetworkAnalysisPage = lazy(() => import("./pages/NetworkAnalysisPage"))
const HeatmapPage = lazy(() => import("./pages/HeatmapPage"))
const RefugeeFlowsPage = lazy(() => import("./pages/RefugeeFlowsPage"))
const RevolutionaryTimelinePage = lazy(() => import("./pages/RevolutionaryTimelinePage"))

// Human rights pages
const PoliticalPrisonersPage = lazy(() => import("./pages/PoliticalPrisonersPage"))

// History pages
const SlaveryHistoryPage = lazy(() => import("./pages/SlaveryHistoryPage"))
const ElectionsPage = lazy(() => import("./pages/ElectionsPage"))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]" style={{ backgroundColor: '#FFF5F6' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: '#E8C8C8', borderTopColor: '#C41E3A' }} />
        <p style={{ color: '#8B7355' }}>Loading...</p>
      </div>
    </div>
  )
}

function AppContent() {
  usePrefetchBorders()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Map page renders OUTSIDE Layout — full viewport, no header */}
        <Route path="map" element={<MapPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HubPage />} />
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

          {/* Movement pages */}
          <Route path="movements/feminist" element={<FeministMovementsPage />} />
          <Route path="movements/civil-rights" element={<CivilRightsPage />} />
          <Route path="movements/labor" element={<LaborMovementsPage />} />
          <Route path="movements/lgbtq" element={<LGBTQMovementsPage />} />
          <Route path="movements/environmental" element={<EnvironmentalMovementsPage />} />
          <Route path="movements/indigenous" element={<IndigenousMovementsPage />} />

          {/* Liberation struggle pages */}
          <Route path="liberation/uyghur-region" element={<UyghurRegionPage />} />

          {/* Visualization pages */}
          <Route path="visualizations/network" element={<NetworkAnalysisPage />} />
          <Route path="visualizations/heatmap" element={<HeatmapPage />} />
          <Route path="visualizations/refugee-flows" element={<RefugeeFlowsPage />} />
          <Route path="visualizations/timeline" element={<RevolutionaryTimelinePage />} />

          {/* Human rights pages */}
          <Route path="prisoners" element={<PoliticalPrisonersPage />} />

          {/* History pages */}
          <Route path="history/slavery" element={<SlaveryHistoryPage />} />
          <Route path="elections" element={<ElectionsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

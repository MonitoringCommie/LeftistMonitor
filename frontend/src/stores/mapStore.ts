import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface MapState {
  // Current year for time slider
  selectedYear: number

  // Selected country
  selectedCountryId: string | null
  hoveredCountryId: string | null

  // Map viewport
  center: [number, number]
  zoom: number

  // Overlay toggles
  showConflicts: boolean
  showCapitals: boolean
  showOccupations: boolean
  
  // Liberation Struggles overlays
  showPalestine: boolean
  showKurdistan: boolean
  showWesternSahara: boolean
  showKashmir: boolean
  showTibet: boolean
  showIreland: boolean
  showWestPapua: boolean

  // Animation
  isPlaying: boolean
  playbackSpeed: number // years per second

  // Actions
  setYear: (year: number) => void
  incrementYear: () => void
  decrementYear: () => void
  selectCountry: (id: string | null) => void
  hoverCountry: (id: string | null) => void
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  toggleConflicts: () => void
  toggleCapitals: () => void
  toggleOccupations: () => void
  togglePalestine: () => void
  toggleKurdistan: () => void
  toggleWesternSahara: () => void
  toggleKashmir: () => void
  toggleTibet: () => void
  toggleIreland: () => void
  toggleWestPapua: () => void
  togglePlayback: () => void
  setPlaybackSpeed: (speed: number) => void
}

const MIN_YEAR = 1900
const MAX_YEAR = new Date().getFullYear()

export const useMapStore = create<MapState>((set) => ({
  // Default to 2019 - last year with complete CShapes border data
  selectedYear: 2019,
  selectedCountryId: null,
  hoveredCountryId: null,
  center: [10, 30],
  zoom: 2,
  showConflicts: false,
  showCapitals: true,
  showOccupations: false,
  showPalestine: false,
  showKurdistan: false,
  showWesternSahara: false,
  showKashmir: false,
  showTibet: false,
  showIreland: false,
  showWestPapua: false,
  isPlaying: false,
  playbackSpeed: 2,

  setYear: (year) => set({
    selectedYear: Math.max(MIN_YEAR, Math.min(MAX_YEAR, year))
  }),

  incrementYear: () => set((state) => ({
    selectedYear: Math.min(MAX_YEAR, state.selectedYear + 1)
  })),

  decrementYear: () => set((state) => ({
    selectedYear: Math.max(MIN_YEAR, state.selectedYear - 1)
  })),

  selectCountry: (id) => set({ selectedCountryId: id }),

  hoverCountry: (id) => set({ hoveredCountryId: id }),

  setCenter: (center) => set({ center }),

  setZoom: (zoom) => set({ zoom }),

  toggleConflicts: () => set((state) => ({
    showConflicts: !state.showConflicts
  })),

  toggleCapitals: () => set((state) => ({
    showCapitals: !state.showCapitals
  })),

  toggleOccupations: () => set((state) => ({
    showOccupations: !state.showOccupations
  })),

  togglePalestine: () => set((state) => ({
    showPalestine: !state.showPalestine
  })),

  toggleKurdistan: () => set((state) => ({
    showKurdistan: !state.showKurdistan
  })),

  toggleWesternSahara: () => set((state) => ({
    showWesternSahara: !state.showWesternSahara
  })),

  toggleKashmir: () => set((state) => ({
    showKashmir: !state.showKashmir
  })),

  toggleTibet: () => set((state) => ({
    showTibet: !state.showTibet
  })),

  toggleIreland: () => set((state) => ({
    showIreland: !state.showIreland
  })),

  toggleWestPapua: () => set((state) => ({
    showWestPapua: !state.showWestPapua
  })),

  togglePlayback: () => set((state) => ({
    isPlaying: !state.isPlaying
  })),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
}))

// Optimized selectors to prevent unnecessary re-renders
export const useSelectedYear = () => useMapStore((state) => state.selectedYear)
export const useSetYear = () => useMapStore((state) => state.setYear)

export const useSelectedCountryId = () => useMapStore((state) => state.selectedCountryId)
export const useSelectCountry = () => useMapStore((state) => state.selectCountry)

export const useHoveredCountryId = () => useMapStore((state) => state.hoveredCountryId)
export const useHoverCountry = () => useMapStore((state) => state.hoverCountry)

export const useShowConflicts = () => useMapStore((state) => state.showConflicts)
export const useToggleConflicts = () => useMapStore((state) => state.toggleConflicts)

export const useShowCapitals = () => useMapStore((state) => state.showCapitals)
export const useToggleCapitals = () => useMapStore((state) => state.toggleCapitals)

export const useShowOccupations = () => useMapStore((state) => state.showOccupations)
export const useToggleOccupations = () => useMapStore((state) => state.toggleOccupations)

export const useShowPalestine = () => useMapStore((state) => state.showPalestine)
export const useTogglePalestine = () => useMapStore((state) => state.togglePalestine)

export const useShowKurdistan = () => useMapStore((state) => state.showKurdistan)
export const useToggleKurdistan = () => useMapStore((state) => state.toggleKurdistan)

export const useShowWesternSahara = () => useMapStore((state) => state.showWesternSahara)
export const useToggleWesternSahara = () => useMapStore((state) => state.toggleWesternSahara)

export const useShowKashmir = () => useMapStore((state) => state.showKashmir)
export const useToggleKashmir = () => useMapStore((state) => state.toggleKashmir)

export const useShowTibet = () => useMapStore((state) => state.showTibet)
export const useToggleTibet = () => useMapStore((state) => state.toggleTibet)

export const useShowIreland = () => useMapStore((state) => state.showIreland)
export const useToggleIreland = () => useMapStore((state) => state.toggleIreland)

export const useShowWestPapua = () => useMapStore((state) => state.showWestPapua)
export const useToggleWestPapua = () => useMapStore((state) => state.toggleWestPapua)

export const useIsPlaying = () => useMapStore((state) => state.isPlaying)
export const useTogglePlayback = () => useMapStore((state) => state.togglePlayback)

export const usePlaybackSpeed = () => useMapStore((state) => state.playbackSpeed)
export const useSetPlaybackSpeed = () => useMapStore((state) => state.setPlaybackSpeed)

export const useMapViewport = () => useMapStore(
  useShallow((state) => ({ center: state.center, zoom: state.zoom }))
)
export const useSetCenter = () => useMapStore((state) => state.setCenter)
export const useSetZoom = () => useMapStore((state) => state.setZoom)

export const useYearControls = () => useMapStore(
  useShallow((state) => ({
    incrementYear: state.incrementYear,
    decrementYear: state.decrementYear,
  }))
)

// Combined selector for TimeSlider component
export const useTimeSliderState = () => useMapStore(
  useShallow((state) => ({
    selectedYear: state.selectedYear,
    setYear: state.setYear,
    isPlaying: state.isPlaying,
    togglePlayback: state.togglePlayback,
    playbackSpeed: state.playbackSpeed,
    setPlaybackSpeed: state.setPlaybackSpeed,
    incrementYear: state.incrementYear,
  }))
)

// Combined selector for WorldMap component
export const useWorldMapState = () => useMapStore(
  useShallow((state) => ({
    selectedYear: state.selectedYear,
    showConflicts: state.showConflicts,
    toggleConflicts: state.toggleConflicts,
    showOccupations: state.showOccupations,
    toggleOccupations: state.toggleOccupations,
    showPalestine: state.showPalestine,
    togglePalestine: state.togglePalestine,
    showKurdistan: state.showKurdistan,
    toggleKurdistan: state.toggleKurdistan,
    showWesternSahara: state.showWesternSahara,
    toggleWesternSahara: state.toggleWesternSahara,
    showKashmir: state.showKashmir,
    toggleKashmir: state.toggleKashmir,
    showTibet: state.showTibet,
    toggleTibet: state.toggleTibet,
    showIreland: state.showIreland,
    toggleIreland: state.toggleIreland,
    selectCountry: state.selectCountry,
    hoverCountry: state.hoverCountry,
  }))
)

// Selector for all liberation struggles
export const useLiberationStruggles = () => useMapStore(
  useShallow((state) => ({
    showPalestine: state.showPalestine,
    showKurdistan: state.showKurdistan,
    showWesternSahara: state.showWesternSahara,
    showKashmir: state.showKashmir,
    showTibet: state.showTibet,
    showIreland: state.showIreland,
    showWestPapua: state.showWestPapua,
    togglePalestine: state.togglePalestine,
    toggleKurdistan: state.toggleKurdistan,
    toggleWesternSahara: state.toggleWesternSahara,
    toggleKashmir: state.toggleKashmir,
    toggleTibet: state.toggleTibet,
    toggleIreland: state.toggleIreland,
    toggleWestPapua: state.toggleWestPapua,
  }))
)

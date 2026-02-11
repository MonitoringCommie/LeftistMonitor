import { useState } from 'react'

interface GlobeControlsProps {
  showCities: boolean
  onToggleCities: () => void
  showConflicts: boolean
  onToggleConflicts: () => void
  showLiberationStruggles: boolean
  onToggleLiberationStruggles: () => void
  onAutoRotate: () => void
  selectedYear: number
  onYearChange: (year: number) => void
  isPlaying: boolean
  onTogglePlayback: () => void
  activeConflictCount: number
}

export default function GlobeControls({
  showCities,
  onToggleCities,
  showConflicts,
  onToggleConflicts,
  showLiberationStruggles,
  onToggleLiberationStruggles,
  onAutoRotate,
  selectedYear,
  onYearChange,
  isPlaying,
  onTogglePlayback,
  activeConflictCount,
}: GlobeControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4">
      {/* Header with title and top controls */}
      <div className="flex items-start justify-between pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            Leftist Monitor
          </h1>
          <p className="text-sm text-blue-300 mt-1 opacity-80">Interactive 3D Globe - Wars, Conflicts & Liberation Struggles</p>
        </div>

        {/* Top Right Controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onToggleCities}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              showCities ? 'bg-slate-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {showCities ? 'Hide' : 'Show'} Cities
          </button>
          <button
            onClick={onToggleConflicts}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              showConflicts ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {showConflicts ? 'Hide' : 'Show'} Conflicts
          </button>
          <button
            onClick={onToggleLiberationStruggles}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              showLiberationStruggles ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {showLiberationStruggles ? 'Hide' : 'Show'} Liberation
          </button>
          <button
            onClick={onAutoRotate}
            className="px-3 py-1.5 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all whitespace-nowrap"
          >
            Auto-Rotate
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all whitespace-nowrap"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvanced && (
        <div className="absolute top-32 right-4 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-600/50 p-4 w-80 max-h-96 overflow-y-auto pointer-events-auto">
          <h3 className="text-sm font-bold text-white mb-3">Advanced Controls</h3>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">Search Cities</label>
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full px-2 py-1.5 rounded text-xs bg-gray-800 border border-gray-700 text-gray-300 placeholder-gray-600"
            />
          </div>

          {/* Zoom Controls */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">Zoom Level</label>
            <div className="flex gap-1">
              <button className="flex-1 px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">-</button>
              <button className="flex-1 px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">Reset</button>
              <button className="flex-1 px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">+</button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">Filter by Type</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Capital Cities
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Conflict Cities
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Historical Cities
              </label>
            </div>
          </div>

          {/* Display Options */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Display</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Show Labels
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Show Trails
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Animation
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Bottom: Time Controls */}
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        {/* Time Slider */}
        <div className="w-[600px] max-w-[90vw]">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onTogglePlayback}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors flex-shrink-0"
              >
                {isPlaying ? '||' : '▶'}
              </button>
              <span className="text-2xl font-bold text-white tabular-nums">{selectedYear}</span>
              <div className="flex-1" />
              <span className="text-xs text-gray-400">
                {activeConflictCount} active conflict{activeConflictCount !== 1 ? 's' : ''}
              </span>
            </div>
            <input
              type="range"
              min={1900}
              max={2026}
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-500">1900</span>
              <span className="text-[10px] text-gray-500">1925</span>
              <span className="text-[10px] text-gray-500">1950</span>
              <span className="text-[10px] text-gray-500">1975</span>
              <span className="text-[10px] text-gray-500">2000</span>
              <span className="text-[10px] text-gray-500">2026</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <span>Drag to rotate</span>
          <span className="text-gray-700">|</span>
          <span>Scroll to zoom</span>
          <span className="text-gray-700">|</span>
          <span>Click for details</span>
        </div>
      </div>
    </div>
  )
}

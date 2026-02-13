import { memo } from 'react'
import { useCommandPalette } from './CommandPaletteProvider'

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent)
const shortcut = isMac ? '\u2318K' : 'Ctrl+K'

const SearchBar = memo(function SearchBar() {
  const { open } = useCommandPalette()

  return (
    <button
      onClick={open}
      className="w-full max-w-md flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        color: 'rgba(255, 255, 255, 0.75)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
      }}
    >
      <svg
        style={{ width: 16, height: 16, flexShrink: 0 }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
      <kbd style={{
        fontSize: '11px',
        padding: '2px 6px',
        borderRadius: '4px',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontFamily: 'system-ui, sans-serif',
      }}>
        {shortcut}
      </kbd>
    </button>
  )
})

export default SearchBar

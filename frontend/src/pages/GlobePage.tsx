import { Link } from 'react-router-dom'
import Globe3D from '../components/map/Globe3D'

export default function GlobePage() {
  return (
    <div className="flex flex-col h-screen" style={{ background: '#0a0a2e' }}>
      {/* Minimal top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0 z-20 relative"
        style={{
          background: 'linear-gradient(135deg, #8B1A1A 0%, #C41E3A 50%, #8B1A1A 100%)',
          borderBottom: '3px solid #D4A017',
        }}
      >
        <Link
          to="/"
          className="text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(212, 160, 23, 0.5)',
            fontFamily: 'Georgia, serif',
          }}
        >
          {'\u2190'} Back to Hub
        </Link>
        <span
          className="text-white text-lg font-bold"
          style={{
            fontFamily: 'Georgia, serif',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {'\u2606'} 3D Globe {'\u2606'}
        </span>
        <div />
      </div>

      {/* Globe area */}
      <div className="flex-1 relative min-h-0">
        <Globe3D />
      </div>
    </div>
  )
}

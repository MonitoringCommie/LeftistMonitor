import { memo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SearchBar from '../ui/SearchBar'
import { useAuthStore, useLogout } from '../../api/auth'

const Header = memo(function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, hasRole } = useAuthStore()
  const logout = useLogout()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/map', label: 'Map' },
    { to: '/people', label: 'People' },
    { to: '/books', label: 'Books' },
    { to: '/frontlines', label: 'Frontlines' },
    { to: '/compare', label: 'Compare' },
    { to: '/about', label: 'About' },
    { to: '/glossary', label: 'Glossary' },
    { to: '/stats', label: 'Stats' },
    { to: '/elections', label: 'Elections' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  const headerStyles = {
    background: 'linear-gradient(135deg, #8B1A1A 0%, #C41E3A 50%, #8B1A1A 100%)',
    borderBottom: '4px solid #D4A017',
    boxShadow: '0 4px 12px rgba(139, 26, 26, 0.3)',
  }

  const navLinkStyles = (isActivePath: boolean) => ({
    color: isActivePath ? '#D4A017' : 'rgba(255,255,255,0.75)',
    transition: 'color 0.2s ease',
  })

  return (
    <header
      className="text-white shadow-lg relative z-50"
      style={headerStyles}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <span
              className="text-xl font-bold"
              style={{ color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Georgia, serif', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              {'\u2606'} LeftistMonitor {'\u2606'}
            </span>
          </Link>

          {/* Search - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm transition-colors rounded-md"
                style={navLinkStyles(isActive(link.to))}
                onMouseEnter={(e) => {
                  if (!isActive(link.to)) {
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.to)) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(212, 160, 23, 0.5)',
                    color: '#F5DEB3',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.color = '#F5DEB3'
                  }}
                >
                  <span>{user?.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50"
                    style={{
                      background: '#fff',
                      border: '1px solid #E8C8C8',
                      boxShadow: '0 4px 16px rgba(139, 26, 26, 0.15)',
                    }}
                  >
                    <div
                      className="px-4 py-2 border-b"
                      style={{ borderColor: '#E8C8C8' }}
                    >
                      <p className="text-sm font-medium" style={{ color: '#2C1810' }}>
                        {user?.display_name || user?.username}
                      </p>
                      <p className="text-xs capitalize" style={{ color: '#8B7355' }}>
                        {user?.role}
                      </p>
                    </div>
                    {hasRole('admin') && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm transition-colors"
                        style={{ color: '#5C3D2E' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FDEAED'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: '#C41E3A' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FDEAED'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ml-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(212, 160, 23, 0.5)',
                  color: '#F5DEB3',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.color = '#F5DEB3'
                }}
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: 'rgba(255,255,255,0.75)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              }}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="md:hidden absolute top-16 left-0 right-0 shadow-lg border-t"
            style={{
              background: '#8B1A1A',
              borderColor: '#D4A017',
            }}
          >
            {/* Mobile Search */}
            <div
              className="p-4 border-b"
              style={{ borderColor: 'rgba(212, 160, 23, 0.4)' }}
            >
              <SearchBar />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-sm transition-colors border-b"
                  style={{
                    color: isActive(link.to) ? '#D4A017' : 'rgba(255,255,255,0.75)',
                    background: isActive(link.to) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    borderColor: 'rgba(212, 160, 23, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.color = '#fff'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Auth Links */}
              {isAuthenticated() ? (
                <>
                  {hasRole('admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="px-4 py-3 text-sm transition-colors border-b"
                      style={{
                        color: '#F5DEB3',
                        borderColor: 'rgba(212, 160, 23, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="px-4 py-3 text-left text-sm transition-colors"
                    style={{
                      color: '#F5DEB3',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Sign Out ({user?.username})
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-sm transition-colors"
                  style={{
                    color: '#F5DEB3',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#F5DEB3'
                  }}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
})

export default Header

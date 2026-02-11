import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin, useRegister, useAuthStore } from '../api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useLogin()
  const register = useRegister()

  // Redirect if already authenticated
  if (isAuthenticated()) {
    navigate('/')
    return null
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await login.mutateAsync({ email, password })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      await register.mutateAsync({ email, username, password })
      // After registration, log them in
      await login.mutateAsync({ email, password })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    }
  }

  return (
    <div style={{ backgroundColor: '#FFF5F6' }} className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold" style={{ color: '#C41E3A' }}>
            LeftistMonitor
          </Link>
          <p className="mt-2" style={{ color: '#8B7355' }}>
            {isRegistering ? 'Create an account to contribute' : 'Sign in to your account'}
          </p>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8C8C8',
          borderLeft: '4px solid #C41E3A',
          borderRadius: '10px'
        }} className="p-8">
          {error && (
            <div style={{
              background: 'rgba(196, 30, 58, 0.08)',
              border: '1px solid rgba(196, 30, 58, 0.3)',
              color: '#C41E3A'
            }} className="mb-4 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#5C3D2E' }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  style={{
                    background: '#FFF5F6',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    color: '#2C1810'
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  placeholder="you@example.com"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1" style={{ color: '#5C3D2E' }}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  style={{
                    background: '#FFF5F6',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    color: '#2C1810'
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  placeholder="username"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#5C3D2E' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  style={{
                    background: '#FFF5F6',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    color: '#2C1810'
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  placeholder="********"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: '#5C3D2E' }}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  style={{
                    background: '#FFF5F6',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    color: '#2C1810'
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  placeholder="********"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={register.isPending || login.isPending}
                style={{
                  background: '#C41E3A',
                  color: '#fff'
                }}
                className="w-full py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:opacity-90 transition-opacity"
              >
                {register.isPending || login.isPending ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#5C3D2E' }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  style={{
                    background: '#FFF5F6',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    color: '#2C1810'
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  placeholder="you@example.com"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#5C3D2E' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  style={{
                    background: '#FFF5F6',
                    borderColor: 'rgba(196, 30, 58, 0.3)',
                    color: '#2C1810'
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                  placeholder="********"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C41E3A'
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(196, 30, 58, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(196, 30, 58, 0.3)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                style={{
                  background: '#C41E3A',
                  color: '#fff'
                }}
                className="w-full py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:opacity-90 transition-opacity"
              >
                {login.isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError(null)
              }}
              style={{ color: '#C41E3A' }}
              className="hover:opacity-80 text-sm transition-opacity"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: '#8B7355' }}>
          <Link to="/" style={{ color: '#C41E3A' }} className="hover:opacity-80">
            Back to Map
          </Link>
        </p>
      </div>
    </div>
  )
}

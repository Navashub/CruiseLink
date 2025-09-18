import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authAPI } from './services'
import { getStoredUser, setStoredUser, clearStoredUser, handleAPIError } from './utils/authUtils'
import sessionManager from './utils/sessionManager'

// Import pages
import {
  LandingPage,
  LoginPage,
  RegistrationPage,
  TripBrowser,
  CreateTrip,
  UserProfile,
  TripDetails,
  TripsList,
  Notifications,
  AdminPanel
} from './pages'

// Import components
import { Navbar } from './components'
import SessionWarningModal from './components/ui/SessionWarningModal'

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = authAPI.getToken()
      const storedUser = getStoredUser()
      
      if (token && storedUser) {
        try {
          // Verify token is valid by getting user profile
          const userProfile = await authAPI.getProfile()
          setUser(userProfile)
          setIsAuthenticated(true)
          // Initialize session manager for existing session
          sessionManager.init(
            () => logout(), // Auto logout callback
            () => setShowSessionWarning(true) // Session warning callback
          )
        } catch (error) {
          // Token is invalid, clear all auth data
          console.error('Invalid token:', error)
          clearStoredUser()
        }
      } else if (token || storedUser) {
        // Partial auth data, clear everything
        clearStoredUser()
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    setStoredUser(userData)
    // Initialize session manager
    sessionManager.init(
      () => logout(), // Auto logout callback
      () => setShowSessionWarning(true) // Session warning callback
    )
    // Token is already stored by the authAPI.login function
  }

  const register = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    setStoredUser(userData)
    // Initialize session manager
    sessionManager.init(
      () => logout(), // Auto logout callback
      () => setShowSessionWarning(true) // Session warning callback
    )
    // Token is already stored by the authAPI.register function
  }

  const logout = async () => {
    try {
      // Destroy session manager
      sessionManager.destroy()
      
      // Call logout API to invalidate token on server
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', handleAPIError(error))
      // Continue with logout even if API call fails
    }
    
    // Clear local state and storage
    setUser(null)
    setIsAuthenticated(false)
    setShowSessionWarning(false)
    clearStoredUser()
  }

  // Handle session warning actions
  const handleExtendSession = () => {
    setShowSessionWarning(false)
    sessionManager.resetTimeout()
  }

  const handleSessionLogout = () => {
    setShowSessionWarning(false)
    logout()
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar user={user} onLogout={logout} />}
      
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <TripBrowser user={user} />
              ) : (
                <LandingPage />
              )
            } 
          />
          <Route 
            path="/login" 
            element={<LoginPage onLogin={login} />} 
          />
          <Route 
            path="/register" 
            element={<RegistrationPage onRegister={register} />} 
          />
          <Route 
            path="/trips" 
            element={<TripsList user={user} />} 
          />
          <Route 
            path="/create-trip" 
            element={<CreateTrip user={user} />} 
          />
          <Route 
            path="/trips/create" 
            element={<CreateTrip user={user} />} 
          />
          <Route 
            path="/trips/:id" 
            element={<TripDetails user={user} />} 
          />
          <Route 
            path="/notifications" 
            element={<Notifications user={user} />} 
          />
          <Route 
            path="/profile" 
            element={<UserProfile user={user} setUser={setUser} />} 
          />
          <Route 
            path="/trip/:id" 
            element={<TripDetails user={user} />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminPanel user={user} /> : <TripBrowser user={user} />} 
          />
        </Routes>
      </main>

      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showSessionWarning}
        onExtend={handleExtendSession}
        onLogout={handleSessionLogout}
      />
    </div>
  )
}

export default App
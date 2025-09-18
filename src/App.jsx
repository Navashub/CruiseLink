import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Import pages
import {
  LandingPage,
  LoginPage,
  RegistrationPage,
  TripBrowser,
  CreateTrip,
  UserProfile,
  TripDetails,
  AdminPanel
} from './pages'

// Import components
import { Navbar } from './components'

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Simple authentication state management
  useEffect(() => {
    const savedUser = localStorage.getItem('roadtripUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('roadtripUser', JSON.stringify(userData))
  }

  const register = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('roadtripUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('roadtripUser')
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
            element={<TripBrowser user={user} />} 
          />
          <Route 
            path="/create-trip" 
            element={<CreateTrip user={user} />} 
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
    </div>
  )
}

export default App